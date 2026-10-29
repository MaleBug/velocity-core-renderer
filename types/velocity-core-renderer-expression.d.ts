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
 */
type CalculationValue = number | null;
type CalculationNode = {
    kind: 'number';
    value: number;
    position: number;
} | {
    kind: 'name';
    name: string;
    position: number;
} | {
    kind: 'unary';
    operator: '-' | '+' | 'NOT';
    operand: CalculationNode;
    position: number;
} | {
    kind: 'binary';
    operator: CalculationBinaryOperator;
    left: CalculationNode;
    right: CalculationNode;
    position: number;
} | {
    kind: 'call';
    name: CalculationFunctionName;
    args: CalculationNode[];
    position: number;
};
type CalculationBinaryOperator = '+' | '-' | '*' | '/' | '%' | '=' | '!=' | '<' | '<=' | '>' | '>=' | 'AND' | 'OR';
/** A problem with the expression's text. `position` is the 0-based offset it was found at. */
interface CalculationError {
    message: string;
    position: number;
}
type CalculationParseResult = {
    ok: true;
    ast: CalculationNode;
} | {
    ok: false;
    errors: CalculationError[];
};
/** Each function with the fewest and most arguments it takes; `null` for no upper bound. */
declare const CALCULATION_FUNCTIONS: {
    readonly ABS: {
        readonly min: 1;
        readonly max: 1;
    };
    readonly COALESCE: {
        readonly min: 1;
        readonly max: null;
    };
    readonly IF: {
        readonly min: 3;
        readonly max: 3;
    };
    readonly MAX: {
        readonly min: 1;
        readonly max: null;
    };
    readonly MIN: {
        readonly min: 1;
        readonly max: null;
    };
    readonly ROUND: {
        readonly min: 1;
        readonly max: 2;
    };
};
type CalculationFunctionName = keyof typeof CALCULATION_FUNCTIONS;
/**
 * Whether `name` can be used as a variable: an identifier that is not a keyword or a function
 * name, either of which would read as something else inside an expression.
 */
declare function isCalculationVariableName(name: string): boolean;
/** Parses an expression, or reports the first problem with its text. Blank text is an error. */
declare function parseCalculation(source: string): CalculationParseResult;
/** Every variable name the expression reads, once each, in the order they first appear. */
declare function calculationReferencedNames(ast: CalculationNode): string[];
/**
 * Evaluates a parsed expression. A name with no entry in `values` reads as null, the same as a
 * field with nothing entered — callers that need to refuse unknown names check them at parse time
 * with {@link calculationReferencedNames}.
 */
declare function evaluateCalculation(ast: CalculationNode, values: Readonly<Record<string, CalculationValue>>): CalculationValue;
/**
 * How a variable folds the values of many related records into one. `first` is the first record's
 * value, the record a data-point panel shows. `count` counts the records that have a value; the
 * others skip records with none, and are null when no record has one.
 */
type CalculationAggregate = 'first' | 'sum' | 'avg' | 'min' | 'max' | 'count';
declare const CALCULATION_AGGREGATES: readonly {
    label: string;
    value: CalculationAggregate;
}[];
/** Folds one variable's values — one per related record, in record order — into its value. */
declare function aggregateCalculationValues(values: readonly CalculationValue[], aggregate: CalculationAggregate): CalculationValue;
/** One name the expression reads, and the field it stands for. */
interface CalculationVariable {
    /** The identifier the expression uses. */
    name: string;
    /** `fieldKey` of the field this variable reads. */
    fieldKey: string;
    /** Slug of the custom object the field belongs to; omitted means the record being calculated. */
    objectSlug?: string;
    /** How the related records' values fold into one. Required with `objectSlug`, absent without. */
    aggregate?: CalculationAggregate;
}
/** How the result is shown: like a `Number`, a `Decimal` or a `Currency` field. */
type CalculatedResultType = 'number' | 'decimal' | 'currency';
/**
 * The `fieldConfig` of a `Calculated` field.
 *
 * The saved JSON also carries `isReadOnly: true`, which the admin always writes so code that only
 * knows the generic flag still refuses to edit the value; it is not read back here.
 */
interface CalculatedFieldConfig {
    expression: string;
    variables: CalculationVariable[];
    resultType: CalculatedResultType;
    /** Digits after the decimal point, shown and no more. */
    fractionDigits: number;
    /** ISO 4217 code, used only when `resultType` is `currency`. */
    currency: string;
}
declare const DEFAULT_CALCULATED_FIELD_CONFIG: CalculatedFieldConfig;
/**
 * Reads a `Calculated` field's stored `fieldConfig`. Anything missing or malformed falls back to
 * {@link DEFAULT_CALCULATED_FIELD_CONFIG}, and a variable that is not the shape the admin writes
 * is dropped — a hand-edited config still opens, and still evaluates what it can.
 */
declare function parseCalculatedFieldConfig(json: string | null): CalculatedFieldConfig;

export { CALCULATION_AGGREGATES, CALCULATION_FUNCTIONS, DEFAULT_CALCULATED_FIELD_CONFIG, aggregateCalculationValues, calculationReferencedNames, evaluateCalculation, isCalculationVariableName, parseCalculatedFieldConfig, parseCalculation };
export type { CalculatedFieldConfig, CalculatedResultType, CalculationAggregate, CalculationBinaryOperator, CalculationError, CalculationFunctionName, CalculationNode, CalculationParseResult, CalculationValue, CalculationVariable };
