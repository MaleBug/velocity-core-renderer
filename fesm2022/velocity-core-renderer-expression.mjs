/**
 * The expression language behind calculated fields.
 *
 * One copy for every reader: the admin app parses an expression to check it before it is saved,
 * the client app evaluates it for a live preview, and the backend — the source of truth for the
 * stored value — implements the same grammar against this file's specs. Never `eval`: an
 * expression is admin-authored text, and nothing but the grammar below is allowed to run.
 *
 * Grammar, lowest precedence first:
 *
 *   expression := or
 *   or         := and ( OR and )*
 *   and        := comparison ( AND comparison )*
 *   comparison := additive ( ( = | != | < | <= | > | >= ) additive )?
 *   additive   := term ( ( + | - ) term )*
 *   term       := unary ( ( * | / | % ) unary )*
 *   unary      := ( - | + | NOT ) unary | primary
 *   primary    := number | name | name '(' arguments? ')' | '(' expression ')'
 *
 * Every value is a number or null; there is no boolean type. A comparison is 1 or 0, the way a
 * spreadsheet's is. Null means "no value":
 *
 * - Arithmetic, comparison, `ABS` and `ROUND` with a null operand are null.
 * - Division or remainder by zero, and any result that is not finite, are null — never Infinity.
 * - `AND`, `OR`, `NOT` and `IF`'s condition read null as false, and anything non-zero as true.
 * - `MIN` and `MAX` skip nulls, and are null only when every argument is.
 * - `COALESCE` is its first argument that is not null.
 *
 * Keywords and function names are case-insensitive; variable names are case-sensitive.
 *
 * An expression may nest at most {@link MAX_CALCULATION_DEPTH} deep — parentheses and calls inside
 * each other, or a parsed tree that tall, as a long chain of operators makes — so neither parsing
 * nor evaluating it can run out of stack.
 */
/** Each function with the fewest and most arguments it takes; `null` for no upper bound. */
const CALCULATION_FUNCTIONS = {
    ABS: { min: 1, max: 1 },
    COALESCE: { min: 1, max: null },
    IF: { min: 3, max: 3 },
    MAX: { min: 1, max: null },
    MIN: { min: 1, max: null },
    ROUND: { min: 1, max: 2 },
};
/** How deep an expression may nest, far past anything written by hand. */
const MAX_CALCULATION_DEPTH = 200;
const KEYWORDS = new Set(['AND', 'OR', 'NOT']);
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
/**
 * Whether `name` can be used as a variable: an identifier that is not a keyword or a function
 * name, either of which would read as something else inside an expression.
 */
function isCalculationVariableName(name) {
    const upper = name.toUpperCase();
    return NAME_PATTERN.test(name) && !KEYWORDS.has(upper) && !Object.hasOwn(CALCULATION_FUNCTIONS, upper);
}
const SYMBOLS = ['<=', '>=', '!=', '<>', '+', '-', '*', '/', '%', '(', ')', ',', '=', '<', '>'];
class CalculationSyntaxError extends Error {
    position;
    constructor(message, position) {
        super(message);
        this.position = position;
    }
}
function tokenize(source) {
    const tokens = [];
    let index = 0;
    while (index < source.length) {
        const char = source[index];
        if (/\s/.test(char)) {
            index++;
            continue;
        }
        const number = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(source.slice(index));
        if (number) {
            tokens.push({ kind: 'number', value: Number(number[0]), position: index });
            index += number[0].length;
            continue;
        }
        const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(index));
        if (name) {
            tokens.push({ kind: 'name', text: name[0], position: index });
            index += name[0].length;
            continue;
        }
        const symbol = SYMBOLS.find((candidate) => source.startsWith(candidate, index));
        if (symbol) {
            // `<>` is accepted for spreadsheet habits and read as `!=`.
            tokens.push({ kind: 'symbol', text: symbol === '<>' ? '!=' : symbol, position: index });
            index += symbol.length;
            continue;
        }
        throw new CalculationSyntaxError(`Unexpected character "${char}"`, index);
    }
    tokens.push({ kind: 'end', position: source.length });
    return tokens;
}
class Parser {
    tokens;
    index = 0;
    /** How many parentheses and calls the parser is inside — the only places it recurses. */
    nesting = 0;
    constructor(tokens) {
        this.tokens = tokens;
    }
    parse() {
        const node = this.or();
        const next = this.peek();
        if (next.kind !== 'end') {
            throw new CalculationSyntaxError(`Unexpected ${describe(next)}`, next.position);
        }
        checkDepth(node);
        return node;
    }
    or() {
        let node = this.and();
        while (this.keyword('OR')) {
            const position = this.previous().position;
            node = { kind: 'binary', operator: 'OR', left: node, right: this.and(), position };
        }
        return node;
    }
    and() {
        let node = this.comparison();
        while (this.keyword('AND')) {
            const position = this.previous().position;
            node = { kind: 'binary', operator: 'AND', left: node, right: this.comparison(), position };
        }
        return node;
    }
    comparison() {
        const node = this.additive();
        const operator = this.symbol('=', '!=', '<', '<=', '>', '>=');
        if (operator === null) {
            return node;
        }
        const position = this.previous().position;
        const right = this.additive();
        const chained = this.peek();
        // `a < b < c` reads as maths but would compare a 1 or 0 against c; refuse it outright.
        if (chained.kind === 'symbol' && ['=', '!=', '<', '<=', '>', '>='].includes(chained.text)) {
            throw new CalculationSyntaxError('Comparisons cannot be chained; join them with AND', chained.position);
        }
        return { kind: 'binary', operator: operator, left: node, right, position };
    }
    additive() {
        let node = this.term();
        let operator;
        while ((operator = this.symbol('+', '-')) !== null) {
            const position = this.previous().position;
            node = { kind: 'binary', operator: operator, left: node, right: this.term(), position };
        }
        return node;
    }
    term() {
        let node = this.unary();
        let operator;
        while ((operator = this.symbol('*', '/', '%')) !== null) {
            const position = this.previous().position;
            node = { kind: 'binary', operator: operator, left: node, right: this.unary(), position };
        }
        return node;
    }
    unary() {
        // Read the prefix operators in a loop, then wrap the operand innermost first, so `- - - x`
        // costs no stack however long it is.
        const operators = [];
        for (;;) {
            const sign = this.symbol('-', '+');
            if (sign !== null) {
                operators.push({ operator: sign, position: this.previous().position });
            }
            else if (this.keyword('NOT')) {
                operators.push({ operator: 'NOT', position: this.previous().position });
            }
            else {
                break;
            }
        }
        let node = this.primary();
        for (let i = operators.length - 1; i >= 0; i--) {
            node = { kind: 'unary', operator: operators[i].operator, operand: node, position: operators[i].position };
        }
        return node;
    }
    primary() {
        const token = this.advance();
        if (token.kind === 'number') {
            return { kind: 'number', value: token.value, position: token.position };
        }
        if (token.kind === 'symbol' && token.text === '(') {
            return this.nested(token.position, () => {
                const node = this.or();
                this.expect(')');
                return node;
            });
        }
        if (token.kind === 'name') {
            const upper = token.text.toUpperCase();
            if (KEYWORDS.has(upper)) {
                throw new CalculationSyntaxError(`Unexpected ${upper}`, token.position);
            }
            if (this.symbol('(') !== null) {
                return this.nested(token.position, () => this.call(token.text, token.position));
            }
            if (Object.hasOwn(CALCULATION_FUNCTIONS, upper)) {
                throw new CalculationSyntaxError(`${upper} needs parentheses: ${upper}(…)`, token.position);
            }
            return { kind: 'name', name: token.text, position: token.position };
        }
        throw new CalculationSyntaxError(token.kind === 'end' ? 'The expression ends too early' : `Unexpected ${describe(token)}`, token.position);
    }
    call(name, position) {
        const upper = name.toUpperCase();
        if (!Object.hasOwn(CALCULATION_FUNCTIONS, upper)) {
            throw new CalculationSyntaxError(`Unknown function "${name}"`, position);
        }
        const args = [];
        if (this.symbol(')') === null) {
            do {
                args.push(this.or());
            } while (this.symbol(',') !== null);
            this.expect(')');
        }
        const fn = upper;
        const { min, max } = CALCULATION_FUNCTIONS[fn];
        if (args.length < min || (max !== null && args.length > max)) {
            const expected = max === null ? `at least ${min}` : min === max ? `${min}` : `${min} to ${max}`;
            throw new CalculationSyntaxError(`${fn} takes ${expected} argument${expected.endsWith(' 1') || expected === '1' ? '' : 's'}, not ${args.length}`, position);
        }
        return { kind: 'call', name: fn, args, position };
    }
    nested(position, parse) {
        if (++this.nesting > MAX_CALCULATION_DEPTH) {
            throw new CalculationSyntaxError(tooDeep(), position);
        }
        try {
            return parse();
        }
        finally {
            this.nesting--;
        }
    }
    peek() {
        return this.tokens[this.index];
    }
    previous() {
        return this.tokens[this.index - 1];
    }
    advance() {
        const token = this.tokens[this.index];
        if (token.kind !== 'end') {
            this.index++;
        }
        return token;
    }
    symbol(...texts) {
        const token = this.peek();
        if (token.kind === 'symbol' && texts.includes(token.text)) {
            this.index++;
            return token.text;
        }
        return null;
    }
    keyword(word) {
        const token = this.peek();
        if (token.kind === 'name' && token.text.toUpperCase() === word) {
            this.index++;
            return true;
        }
        return false;
    }
    expect(text) {
        if (this.symbol(text) === null) {
            const token = this.peek();
            throw new CalculationSyntaxError(token.kind === 'end' ? `Missing "${text}"` : `Expected "${text}" but found ${describe(token)}`, token.position);
        }
    }
}
/**
 * Refuses a tree taller than {@link MAX_CALCULATION_DEPTH}, which evaluating would recurse through.
 * Walks it with its own stack, since the tree may be exactly the one too tall to recurse through.
 */
function checkDepth(ast) {
    const stack = [{ node: ast, depth: 1 }];
    while (stack.length > 0) {
        const { node, depth } = stack.pop();
        if (depth > MAX_CALCULATION_DEPTH) {
            throw new CalculationSyntaxError(tooDeep(), node.position);
        }
        const children = node.kind === 'unary'
            ? [node.operand]
            : node.kind === 'binary'
                ? [node.left, node.right]
                : node.kind === 'call'
                    ? node.args
                    : [];
        for (const child of children) {
            stack.push({ node: child, depth: depth + 1 });
        }
    }
}
function tooDeep() {
    return `The expression nests more than ${MAX_CALCULATION_DEPTH} deep`;
}
function describe(token) {
    switch (token.kind) {
        case 'number':
            return `number ${token.value}`;
        case 'name':
            return `"${token.text}"`;
        case 'symbol':
            return `"${token.text}"`;
        case 'end':
            return 'end of expression';
    }
}
/** Parses an expression, or reports the first problem with its text. Blank text is an error. */
function parseCalculation(source) {
    if (source.trim() === '') {
        return { ok: false, errors: [{ message: 'The expression is empty', position: 0 }] };
    }
    try {
        return { ok: true, ast: new Parser(tokenize(source)).parse() };
    }
    catch (error) {
        if (error instanceof CalculationSyntaxError) {
            return { ok: false, errors: [{ message: error.message, position: error.position }] };
        }
        throw error;
    }
}
/** Every variable name the expression reads, once each, in the order they first appear. */
function calculationReferencedNames(ast) {
    const names = new Set();
    const visit = (node) => {
        switch (node.kind) {
            case 'name':
                names.add(node.name);
                break;
            case 'unary':
                visit(node.operand);
                break;
            case 'binary':
                visit(node.left);
                visit(node.right);
                break;
            case 'call':
                node.args.forEach(visit);
                break;
        }
    };
    visit(ast);
    return [...names];
}
/**
 * Evaluates a parsed expression. A name with no entry in `values` reads as null, the same as a
 * field with nothing entered — callers that need to refuse unknown names check them at parse time
 * with {@link calculationReferencedNames}.
 */
function evaluateCalculation(ast, values) {
    return finite(evaluate(ast, values));
}
function evaluate(node, values) {
    switch (node.kind) {
        case 'number':
            return node.value;
        case 'name':
            return Object.hasOwn(values, node.name) ? finite(values[node.name]) : null;
        case 'unary': {
            const operand = evaluate(node.operand, values);
            if (node.operator === 'NOT') {
                return truthy(operand) ? 0 : 1;
            }
            return operand === null ? null : node.operator === '-' ? -operand : operand;
        }
        case 'binary':
            return binary(node.operator, node.left, node.right, values);
        case 'call':
            return call(node.name, node.args, values);
    }
}
function binary(operator, leftNode, rightNode, values) {
    if (operator === 'AND') {
        return truthy(evaluate(leftNode, values)) && truthy(evaluate(rightNode, values)) ? 1 : 0;
    }
    if (operator === 'OR') {
        return truthy(evaluate(leftNode, values)) || truthy(evaluate(rightNode, values)) ? 1 : 0;
    }
    const left = evaluate(leftNode, values);
    const right = evaluate(rightNode, values);
    if (left === null || right === null) {
        return null;
    }
    switch (operator) {
        case '+':
            return finite(left + right);
        case '-':
            return finite(left - right);
        case '*':
            return finite(left * right);
        case '/':
            return right === 0 ? null : finite(left / right);
        case '%':
            return right === 0 ? null : finite(left % right);
        case '=':
            return left === right ? 1 : 0;
        case '!=':
            return left !== right ? 1 : 0;
        case '<':
            return left < right ? 1 : 0;
        case '<=':
            return left <= right ? 1 : 0;
        case '>':
            return left > right ? 1 : 0;
        case '>=':
            return left >= right ? 1 : 0;
    }
}
function call(name, args, values) {
    // IF evaluates only the branch it takes, so the other may divide by zero harmlessly.
    if (name === 'IF') {
        return truthy(evaluate(args[0], values)) ? evaluate(args[1], values) : evaluate(args[2], values);
    }
    if (name === 'COALESCE') {
        for (const arg of args) {
            const value = evaluate(arg, values);
            if (value !== null) {
                return value;
            }
        }
        return null;
    }
    const evaluated = args.map((arg) => evaluate(arg, values));
    switch (name) {
        case 'ABS':
            return evaluated[0] === null ? null : Math.abs(evaluated[0]);
        case 'ROUND':
            return round(evaluated[0], evaluated.length > 1 ? evaluated[1] : 0);
        case 'MIN':
        case 'MAX': {
            const present = evaluated.filter((value) => value !== null);
            if (present.length === 0) {
                return null;
            }
            return name === 'MIN' ? Math.min(...present) : Math.max(...present);
        }
    }
}
/**
 * Rounds half away from zero — 2.5 to 3, -2.5 to -3 — the way people and spreadsheets do, not
 * `Math.round`'s half-up. The scaled value is first cut to 12 significant digits, so a decimal the
 * float cannot hold exactly (1.005 is 1.00499…) still rounds the way it reads.
 */
function round(value, digits) {
    if (value === null || digits === null || !Number.isInteger(digits) || digits < 0 || digits > 10) {
        return null;
    }
    const factor = 10 ** digits;
    const scaled = Number((Math.abs(value) * factor).toPrecision(12));
    return finite((Math.sign(value) * Math.round(scaled)) / factor);
}
function truthy(value) {
    return value !== null && value !== 0;
}
function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
const CALCULATION_AGGREGATES = [
    { label: 'First', value: 'first' },
    { label: 'Sum', value: 'sum' },
    { label: 'Average', value: 'avg' },
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' },
    { label: 'Count', value: 'count' },
];
/** Folds one variable's values — one per related record, in record order — into its value. */
function aggregateCalculationValues(values, aggregate) {
    const present = values.map((value) => finite(value)).filter((value) => value !== null);
    switch (aggregate) {
        case 'first':
            return values.length === 0 ? null : finite(values[0]);
        case 'count':
            return present.length;
        case 'sum':
            return present.length === 0 ? null : finite(present.reduce((total, value) => total + value, 0));
        case 'avg':
            return present.length === 0
                ? null
                : finite(present.reduce((total, value) => total + value, 0) / present.length);
        case 'min':
            return present.length === 0 ? null : Math.min(...present);
        case 'max':
            return present.length === 0 ? null : Math.max(...present);
    }
}
const DEFAULT_CALCULATED_FIELD_CONFIG = {
    expression: '',
    variables: [],
    resultType: 'number',
    fractionDigits: 0,
    currency: 'USD',
};
const RESULT_TYPES = new Set(['number', 'decimal', 'currency']);
const AGGREGATE_VALUES = new Set(CALCULATION_AGGREGATES.map((option) => option.value));
/**
 * Reads a `Calculated` field's stored `fieldConfig`. Anything missing or malformed falls back to
 * {@link DEFAULT_CALCULATED_FIELD_CONFIG}, and a variable that is not the shape the admin writes
 * is dropped — a hand-edited config still opens, and still evaluates what it can.
 */
function parseCalculatedFieldConfig(json) {
    let parsed = null;
    try {
        parsed = json === null || json.trim() === '' ? null : JSON.parse(json);
    }
    catch {
        parsed = null;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { ...DEFAULT_CALCULATED_FIELD_CONFIG, variables: [] };
    }
    const raw = parsed;
    const fractionDigits = raw['fractionDigits'];
    return {
        expression: typeof raw['expression'] === 'string' ? raw['expression'] : '',
        variables: Array.isArray(raw['variables']) ? raw['variables'].flatMap(toCalculationVariable) : [],
        resultType: typeof raw['resultType'] === 'string' && RESULT_TYPES.has(raw['resultType'])
            ? raw['resultType']
            : DEFAULT_CALCULATED_FIELD_CONFIG.resultType,
        fractionDigits: typeof fractionDigits === 'number' && Number.isInteger(fractionDigits) && fractionDigits >= 0 && fractionDigits <= 10
            ? fractionDigits
            : DEFAULT_CALCULATED_FIELD_CONFIG.fractionDigits,
        currency: typeof raw['currency'] === 'string' && raw['currency'].trim() !== ''
            ? raw['currency'].trim().toUpperCase()
            : DEFAULT_CALCULATED_FIELD_CONFIG.currency,
    };
}
function toCalculationVariable(raw) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return [];
    }
    const variable = raw;
    const name = variable['name'];
    const fieldKey = variable['fieldKey'];
    const objectSlug = variable['objectSlug'];
    const aggregate = variable['aggregate'];
    if (typeof name !== 'string' || typeof fieldKey !== 'string') {
        return [];
    }
    return [
        {
            name,
            fieldKey,
            ...(typeof objectSlug === 'string' && objectSlug.trim() !== '' ? { objectSlug: objectSlug.trim() } : {}),
            ...(typeof aggregate === 'string' && AGGREGATE_VALUES.has(aggregate)
                ? { aggregate: aggregate }
                : {}),
        },
    ];
}

/*
 * Public API Surface of velocity-core-renderer/expression
 *
 * The expression language behind calculated fields: a parser and evaluator with no Angular and no
 * PrimeNG. A secondary entry point for the same reason as `/vocabulary` — the client evaluates
 * calculations wherever a field is drawn, and the admin app checks them on the field-definition
 * screen, so neither should have to pull the renderer components in to reach it.
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CALCULATION_AGGREGATES, CALCULATION_FUNCTIONS, DEFAULT_CALCULATED_FIELD_CONFIG, MAX_CALCULATION_DEPTH, aggregateCalculationValues, calculationReferencedNames, evaluateCalculation, isCalculationVariableName, parseCalculatedFieldConfig, parseCalculation };
//# sourceMappingURL=velocity-core-renderer-expression.mjs.map
