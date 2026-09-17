export * from 'velocity-core-renderer/vocabulary';
import * as i0 from '@angular/core';
import { input, model, output, computed, ChangeDetectionStrategy, Component, signal, viewChild, effect, untracked, reflectComponentType, ViewContainerRef, inputBinding, outputBinding } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import * as i1 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputIcon } from 'primeng/inputicon';
import { InputMask } from 'primeng/inputmask';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import * as i2 from 'primeng/button';
import { ButtonModule } from 'primeng/button';
import { RadioButton } from 'primeng/radiobutton';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';

/**
 * Erases a typed descriptor for the registry.
 *
 * The casts below are the only ones in the module, and each is sound for the same reason: `K` tied
 * the component, the config and the value together on the way *in*, so a descriptor whose
 * `renderer` disagreed with its `serialize` could not have been constructed. Widening both to
 * `unknown` therefore cannot pair them wrongly.
 *
 * What the facades then do with the result is symmetric — `deserialize` feeds the renderer and
 * the renderer's emission feeds `serialize`, both through the *same* descriptor — so a value
 * never leaves the custody of the codec that understands it.
 *
 * The rule that keeps this contained: nothing above this function uses `unknown`, and nothing
 * below it uses `TConfig`.
 */
function eraseFieldRenderer(descriptor) {
    return {
        kind: descriptor.kind,
        renderer: descriptor.renderer,
        defaultConfig: descriptor.defaultConfig,
        hasPreview: descriptor.hasPreview,
        parse: (json) => descriptor.parse(json),
        serialize: (value, config) => descriptor.serialize(value, config),
        deserialize: (raw, config) => descriptor.deserialize(raw, config),
    };
}
/**
 * The input and output names the facades bind by.
 *
 * Collected here because this is the one part of the dispatch the compiler cannot check: bindings
 * are addressed by string, so a typo surfaces as a dev-mode "Can't set value of the 'x' input"
 * warning at runtime rather than as a build error. Naming them once means eight renderers and two
 * facades cannot disagree about the spelling, and `FieldRenderer` above is the declaration they
 * are checked against by eye.
 */
const RENDERER_BINDINGS = {
    config: 'config',
    value: 'value',
    /** The output half of `value`'s `model()` — Angular's own naming convention. */
    valueChange: 'valueChange',
    fieldKey: 'fieldKey',
    required: 'required',
    disabled: 'disabled',
    invalid: 'invalid',
    /** See {@link FieldRenderer.blurred}. Optional on the interface, so binding it is conditional. */
    blurred: 'blurred',
};

/**
 * The config members more than one field-input renderer shares.
 *
 * Its own file rather than part of `field-definition-type.model.ts` because that file imports
 * all eight config shapes to build its maps, and the eight need these: putting both halves
 * together would make the import cycle a runtime one, and a `const` read during a cyclic module
 * init is undefined rather than an error you can see.
 *
 * Nothing here is Angular- or PrimeNG-aware, matching `field-definition.model.ts`.
 */
/**
 * How large the rendered control is drawn.
 *
 * `''` means "whatever the theme's default is" and is not the same as `'small'` — PrimeNG's own
 * input is `'small' | 'large' | undefined`, so the empty string is translated to `undefined` at
 * the binding rather than being passed through.
 */
const FIELD_INPUT_SIZES = ['', 'small', 'large'];
const FIELD_INPUT_SIZE_OPTIONS = [
    { label: 'Default', value: '' },
    { label: 'Small', value: 'small' },
    { label: 'Large', value: 'large' },
];
/** Whether the choices stack or sit in a row. Shared by every options-based field. */
const CHOICE_ORIENTATIONS = ['vertical', 'horizontal'];
const CHOICE_ORIENTATION_OPTIONS = [
    { label: 'Vertical', value: 'vertical' },
    { label: 'Horizontal', value: 'horizontal' },
];
/**
 * What order the choices are drawn in. Shared by every options-based field.
 *
 * `'none'` is the authored order — the rows as they sit in the options editor, which is the only
 * order that can express a deliberate one (Small, Medium, Large sorts alphabetically into
 * nonsense). The two sorts are for the lists where the author's order is incidental and a reader
 * scans for a known entry: countries, departments, a few dozen tags.
 */
const CHOICE_SORTS = ['none', 'asc', 'desc'];
const CHOICE_SORT_OPTIONS = [
    { label: 'None (Default)', value: 'none' },
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
];
/**
 * The choices in the order the field draws them.
 *
 * Sorted by `label`, not `value`: the label is what a reader is scanning, and the two can differ
 * wildly — a list labelled by country name and valued by ISO code would otherwise sort in an order
 * with no visible logic to it.
 *
 * Applied at render time rather than by reordering the saved `options`, so `'none'` restores the
 * authored order intact and a sort is never a destructive edit. `numeric` keeps `Option 10` after
 * `Option 2`, and `sensitivity: 'base'` keeps a stray capital from shuffling an entry out of place.
 * Returns the array unchanged when there is nothing to do, which keeps the caller's `computed`
 * identity stable.
 */
function sortChoiceOptions(options, sort) {
    if (sort === 'none' || options.length < 2) {
        return options;
    }
    const direction = sort === 'asc' ? 1 : -1;
    // Copied first: `sort` is in-place, and the array being ordered is the one held in the config.
    return [...options].sort((left, right) => direction *
        left.label.localeCompare(right.label, undefined, { numeric: true, sensitivity: 'base' }));
}
/**
 * The choices in a saved config, dropping every entry that is not usable.
 *
 * An entry needs a non-empty `value`, since that is what a selection stores; one missing a `label`
 * falls back to showing its value, which is more useful than hiding the choice entirely. Unusable
 * entries are dropped rather than defaulted — there is no sensible default for "a choice somebody
 * meant to offer" — and duplicates by `value` are collapsed, because two choices sharing a value
 * cannot be told apart once one is selected.
 *
 * Takes the readers as arguments so this file stays free of a `shared/utils` import: it is the
 * common model the eight config shapes build on, and a cycle through the util layer would be a
 * poor trade for three parameters.
 */
function parseChoiceOptions(entries, fallback, readText, readEntry) {
    if (entries === null) {
        return fallback;
    }
    const options = [];
    const seen = new Set();
    for (const entry of entries) {
        const source = readEntry(entry);
        if (source === null) {
            continue;
        }
        const value = readText(source['value'], '').trim();
        if (value === '' || seen.has(value)) {
            continue;
        }
        seen.add(value);
        options.push({ label: readText(source['label'], '').trim() || value, value });
    }
    return options;
}
/** True when some choice has no stored value — it cannot be saved, so it is not a choice yet. */
function hasBlankChoiceValue(options) {
    return options.some((option) => option.value.trim() === '');
}
/**
 * True when two choices share a stored value.
 *
 * They could not be told apart once selected, and {@link parseChoiceOptions} silently collapses
 * them on the way back in — so the editor says so rather than letting a choice quietly vanish.
 */
function hasDuplicateChoiceValue(options) {
    const values = options.map((option) => option.value.trim()).filter((value) => value !== '');
    return new Set(values).size !== values.length;
}
/**
 * True when two choices share a label.
 *
 * Their values differ, so nothing is dropped on the way in the way {@link parseChoiceOptions}
 * drops a duplicate value — but the label is the whole of what the person choosing sees, and two
 * rows reading `Active` give them no way to tell which one they picked.
 *
 * Compared case-insensitively, matching how {@link sortChoiceOptions} already orders these with
 * `sensitivity: 'base'`: `Active` and `active` are the same word to a reader, and letting the pair
 * through because of one capital would be a distinction only the database can see.
 *
 * Unlike a duplicate value this is an editor-only rule. A config already saved with duplicate
 * labels keeps parsing and keeps rendering — both choices are still distinct and still selectable,
 * so rejecting them at parse time would delete data to enforce a presentation rule.
 */
function hasDuplicateChoiceLabel(options) {
    const labels = options
        .map((option) => option.label.trim().toLowerCase())
        .filter((label) => label !== '');
    return new Set(labels).size !== labels.length;
}

/**
 * Primitives every field-input config model parses with.
 *
 * A saved `fieldConfig` is a JSON string this app may not have written: an older version of the
 * form, a hand-edited raw-JSON textarea, or another client entirely. So reading one is not
 * `JSON.parse` plus a cast — every member has to be checked and defaulted individually, which is
 * what `toDataTableConfig` and its six neighbours in `FieldDefinitionDetailComponent` already do
 * by hand. These exist so the seven renderer configs share one copy of that work instead of
 * seven, and so the rules for "what counts as a number here" cannot drift between them.
 *
 * Dependency-free on purpose, following `general.util.ts`: no Angular, no models, so the whole
 * file stays trivially testable if a test runner is ever installed.
 */
/**
 * A saved config's members, or null when there is nothing usable to read.
 *
 * Null covers all three ways that happens — absent, unparseable, or parsed into something that
 * is not a plain object (`[1,2,3]` and `"text"` are both valid JSON and neither is a config) —
 * because every caller treats them identically: fall back to the field type's defaults. Never
 * throws, matching how `decodeBase64` treats a malformed id: a config arriving from an API is
 * data, not a contract.
 */
function readConfigSource(json) {
    if (json === null || json.trim() === '') {
        return null;
    }
    try {
        const parsed = JSON.parse(json);
        // `typeof null` is 'object' and an array's is too, so both are excluded explicitly.
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
/**
 * The members of `source` that `defaults` does not model — what {@link FieldConfigExtras} carries.
 *
 * Keyed off the defaults rather than a hand-listed set of known members, so a config that grows a
 * property cannot forget to stop treating it as foreign. `extra` itself is excluded: a config
 * that has already been through this app once carries one, and nesting it would compound on every
 * save.
 */
function collectExtras(source, defaults) {
    const extras = {};
    for (const key of Object.keys(source)) {
        if (key !== 'extra' && !Object.hasOwn(defaults, key)) {
            extras[key] = source[key];
        }
    }
    return extras;
}
/**
 * A config as the wire holds it: its own members, plus whatever {@link FieldConfigExtras} was
 * keeping for it.
 *
 * The known members are spread last so a config this app models always wins over a stale copy of
 * the same key in `extra` — which can only happen if a member was foreign when the field was last
 * saved and is modelled now.
 */
function toFieldConfigJson(config) {
    const { extra, ...known } = config;
    return JSON.stringify({ ...extra, ...known });
}
/** A saved string, or the default for anything that is not one. */
function readString(raw, fallback) {
    return typeof raw === 'string' ? raw : fallback;
}
/**
 * A saved boolean, or the default for anything that is not one.
 *
 * Deliberately strict — no truthiness, no `'true'` — because a config member that arrives as a
 * string is a sign the config was written by something that did not know the shape, and guessing
 * for it would hide that. The *value* codecs are lenient (see `parseLooseBoolean`); config is not
 * user data and does not need the same courtesy.
 */
function readBoolean(raw, fallback) {
    return typeof raw === 'boolean' ? raw : fallback;
}
/** A saved finite number, or the default. NaN and Infinity survive `JSON.parse` as `null`, but a
    hand-edited config can still hold a string, so the type is checked as well as the value. */
function readNumber(raw, fallback) {
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : fallback;
}
/**
 * A saved finite number, an explicit null, or the default.
 *
 * The null case is the point: for members like `maxLength` and `min`, null means "no limit" and
 * is a real choice a user can make, distinct from "never set". `readNumber` would overwrite it
 * with the default and quietly reimpose a cap the user had removed.
 */
function readNullableNumber(raw, fallback) {
    if (raw === null) {
        return null;
    }
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : fallback;
}
/**
 * A saved value that is one of `allowed`, or the default.
 *
 * This is what keeps a union-typed config member honest: `selectionMode` is typed
 * `'single' | 'multiple' | 'range'`, and without this check a saved `"weekly"` would be cast
 * straight into that type and handed to PrimeNG, which would then behave in a way no branch here
 * accounts for.
 */
function readOption(raw, allowed, fallback) {
    return typeof raw === 'string' && allowed.includes(raw)
        ? raw
        : fallback;
}
/** The members of a saved array, or null when the value is not one — for the list-shaped config
    members (`RadioFieldConfig.options`), which each validate their own entries. */
function readArray(raw) {
    return Array.isArray(raw) ? raw : null;
}
/** One entry of a list-shaped config member, or null when it is not a plain object. Mirrors
    {@link readConfigSource}'s exclusions for the same reason. */
function readRecord(raw) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    return raw;
}

/**
 * How a field's value crosses the wire.
 *
 * Every field value is a `string` to this API, whatever the field's declared type — see
 * `CreatePageFieldValueRequest.value` ("Always a string on the wire, whatever the field
 * definition's declared type"). These are the formats this app writes into that string and reads
 * back out of it, in one place so a renderer and the control that authored its default can never
 * disagree about what a date or a boolean looks like.
 *
 * Two rules hold throughout:
 *
 * 1. **Nothing here throws.** A stored value is data this app may not have written, so every
 *    reader answers with null rather than raising and lets the caller say so.
 * 2. **Round-trip stability.** `format(parse(s))` must equal `s` for any `s` these functions
 *    themselves produced. `FieldInputComponent` writes a renderer's own output straight back, so
 *    a codec that normalised its input differently on each pass would never settle.
 *
 * Dependency-free on purpose, following `general.util.ts`.
 */
/** A date-only value: `2026-09-11`. */
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
/**
 * A naive date and time: `2026-09-11T14:30:00`, with optional seconds and fractional seconds,
 * and a space tolerated in place of the `T`.
 *
 * Fractional seconds are accepted but never produced — the backend emits them
 * (`CustomObjectFieldValueResponse.createdDate` is documented as `"2026-08-31T15:13:26.9627647"`)
 * and a value copied from one field into another should still load. They are dropped on the way
 * in, since no renderer here edits below the second.
 */
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;
/** Two digits, for the formatters below. */
function pad(value) {
    return String(value).padStart(2, '0');
}
/**
 * `2026-09-11` — a date with no time and no timezone, built from the date's **local** parts.
 *
 * Local rather than `toISOString()`, which is UTC: a date-only field picked as the 1st in any
 * negative-offset zone would store the 31st of the previous month, and the user would watch their
 * date change on save. A date-only value has no instant to be correct about, so the only sensible
 * reading is the one the user saw in the picker.
 */
function formatLocalDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
/**
 * `2026-09-11T14:30:00` — naive, with **no offset and no `Z`**.
 *
 * Matches the shape the platform's own timestamps already use (see {@link DATE_TIME_PATTERN}) and
 * avoids the day shift described on {@link formatLocalDate}. The cost is that a value is only
 * unambiguous alongside the zone it was entered in, which is the tradeoff the backend has already
 * made for its own timestamps.
 */
function formatLocalDateTime(date) {
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    return `${formatLocalDate(date)}T${time}`;
}
/**
 * The date a stored value means, or null.
 *
 * Tries the two shapes this app writes first, constructing through `new Date(y, m - 1, d, …)` so
 * the parts are read as local — `new Date('2026-09-11')` would read the same text as UTC
 * midnight and shift the day backwards in every negative-offset zone, which is the bug
 * {@link formatLocalDate} exists to avoid.
 *
 * Anything else falls through to `new Date(raw)`, which is what loads a value carrying an offset
 * (`2026-09-11T14:30:00Z`) written by another client. That path is lenient by design: refusing to
 * display a value the platform itself stores would be worse than showing it in local time.
 */
function parseLocalDateish(raw) {
    const value = raw.trim();
    if (value === '') {
        return null;
    }
    const dateTime = DATE_TIME_PATTERN.exec(value);
    if (dateTime !== null) {
        const [, year, month, day, hour, minute, second] = dateTime;
        return toValidDate(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 
        // Absent seconds are a legal shortening of the shape, not a malformed value.
        second === undefined ? 0 : Number(second)));
    }
    const dateOnly = DATE_PATTERN.exec(value);
    if (dateOnly !== null) {
        const [, year, month, day] = dateOnly;
        return toValidDate(new Date(Number(year), Number(month) - 1, Number(day)));
    }
    return toValidDate(new Date(value));
}
/**
 * The date, or null if it is not a real one.
 *
 * Both constructors above can produce an Invalid Date from text that matched: `2026-02-31` parses
 * cleanly as digits and is not a day. An Invalid Date is worse than null downstream, because it
 * renders as "Invalid Date" in the control rather than as empty.
 */
function toValidDate(date) {
    return Number.isNaN(date.getTime()) ? null : date;
}
/**
 * The month names `p-datepicker` draws, in its own order.
 *
 * English because that is what the control itself shows: month names come from PrimeNG's global
 * translation, which `app.config.ts` does not configure — see the note on `DateFieldInputComponent`.
 * Short names are the first three letters, which is how PrimeNG's own defaults are built.
 */
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
/** A PrimeNG date format with its quoted literals removed, so a letter inside `'on the'` is not
    read as a token. */
function formatTokens(format) {
    return format.replace(/'[^']*'/g, '');
}
/**
 * Whether a PrimeNG date format names the day of the month.
 *
 * Lowercase `d` and `o` (day of year) are the only tokens that set a day — uppercase `D` is the
 * day's *name*, which PrimeNG reads past without recording. See {@link parseDaylessDate} for why
 * this question is worth asking.
 */
function dateFormatNamesDay(format) {
    return /[do]/.test(formatTokens(format));
}
/** Whether a PrimeNG date format names the month, as a number (`m`) or a name (`M`). */
function dateFormatNamesMonth(format) {
    return /[mM]/.test(formatTokens(format));
}
/**
 * A date typed under a format that names no day — `yy` ("Year") and `MM yy` ("Month Year").
 *
 * ## Why this exists
 *
 * `p-datepicker` cannot read its own dayless formats back. Its parser leaves `day` (and `month`)
 * unset, then builds `new Date(year, month - 1, day)` with those `-1`s and throws `'Invalid date'`
 * when the result does not match what it was given. It defaults them only when `view === 'year'`,
 * which is a *separate* setting a field is free not to be on — so typing `2026` into a Year-format
 * field whose view is the default `'date'` throws, the picker sets its model to null, and the text
 * is wiped the moment focus leaves. Supplying the missing parts here is what makes the format
 * usable rather than display-only.
 *
 * The day is January 1st: a field showing only a year is a field whose day nobody chose, and the
 * start of the period is the reading every other date-flooring convention takes.
 *
 * Null for anything that is not yet a complete answer, so a half-typed year commits nothing and
 * leaves the value as it was — `2`, `20` and `202` are all on the way to `2026`.
 */
function parseDaylessDate(text, format) {
    const numbers = text.trim().match(/\d+/g);
    if (numbers === null) {
        return null;
    }
    // Last rather than first: every dayless format this app offers ends with the year, and a
    // leading number in `MM yy` would be the month.
    const yearText = numbers[numbers.length - 1];
    // Exactly four, so nothing is committed while the year is still being typed. A two-digit year
    // is deliberately not expanded: `26` would have to guess a century, and guessing one silently
    // is how a field ends up holding 1926.
    if (yearText.length !== 4) {
        return null;
    }
    const month = dateFormatNamesMonth(format) ? readMonth(text, numbers) : 1;
    return month === null ? null : toValidDate(new Date(Number(yearText), month - 1, 1));
}
/** The 1-based month named in `text`, or null when it names none yet. */
function readMonth(text, numbers) {
    const lower = text.toLowerCase();
    // Longest first, so 'March' is not matched as 'Mar' with 'ch' left over — and so the name wins
    // over a bare number for a format that shows both.
    const named = [...MONTH_NAMES]
        .map((name, index) => ({ name: name.toLowerCase(), month: index + 1 }))
        .sort((left, right) => right.name.length - left.name.length)
        .find((entry) => lower.includes(entry.name) || lower.includes(entry.name.slice(0, 3)));
    if (named !== undefined) {
        return named.month;
    }
    // A numeric month, which is the first number when the year is the last.
    if (numbers.length < 2) {
        return null;
    }
    const month = Number(numbers[0]);
    return month >= 1 && month <= 12 ? month : null;
}
/**
 * `1234.5` — the number, plainly.
 *
 * No grouping, no currency symbol, no prefix or suffix: those are display config, and a stored
 * `"1,234"` or `"$1,234.00"` is a number `Number()` cannot read back. Keeping the wire value bare
 * is also what lets a currency field's ISO code change without rewriting stored amounts, and what
 * keeps the value arithmetic-ready for the backend.
 */
function formatPlainNumber(value) {
    return value === null ? '' : String(value);
}
/**
 * The number a stored value means, or null.
 *
 * `Number` rather than `parseFloat`, so trailing junk is rejected outright instead of quietly
 * yielding a prefix — `parseFloat('12abc')` is 12, which is not what the field holds.
 * `Number('')` is 0, so the empty case is handled before the conversion.
 */
function parseFiniteNumber(raw) {
    const value = raw.trim();
    if (value === '') {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}
/**
 * Spellings of true and false accepted in addition to a checkbox field's own configured text.
 *
 * A courtesy, not a contract: a boolean value in this platform may have been written by a form
 * that spelled it `1`, an import that spelled it `Yes`, or a developer testing with `on`. Reading
 * all of them costs nothing and is much better than showing an unchecked box for a value that
 * plainly says yes. Writing always uses the field's configured text, so a value only ever moves
 * *towards* the configured spelling.
 */
const TRUE_SPELLINGS = ['true', '1', 'yes', 'y', 'on', 'checked'];
const FALSE_SPELLINGS = ['false', '0', 'no', 'n', 'off', 'unchecked'];
/**
 * The boolean a stored value means, or null for one that says neither.
 *
 * The field's own `trueText`/`falseText` are checked first so a field configured with, say,
 * `Active`/`Inactive` reads its own values back even if they collide with nothing in the courtesy
 * lists. Comparison is case-insensitive on both: a value differing only in case is the same
 * answer, and treating it as unreadable would be pedantry the user pays for.
 *
 * Null rather than false for an unreadable value, so a tri-state field can show "not set" and a
 * binary one can decide for itself (see `CheckboxFieldConfig.triState`). A binary renderer that
 * mapped an unreadable value to false would be asserting an answer nobody gave.
 */
function parseLooseBoolean(raw, trueText, falseText) {
    const value = raw.trim().toLowerCase();
    if (value === '') {
        return null;
    }
    if (trueText.trim() !== '' && value === trueText.trim().toLowerCase()) {
        return true;
    }
    if (falseText.trim() !== '' && value === falseText.trim().toLowerCase()) {
        return false;
    }
    if (TRUE_SPELLINGS.includes(value)) {
        return true;
    }
    if (FALSE_SPELLINGS.includes(value)) {
        return false;
    }
    return null;
}

/**
 * What the browser should treat the input as.
 *
 * This is the one config member that earns four `fieldType`s from one renderer: `Text`, `Email`,
 * `Phone` and `Url` are all a text box, differing only in the keyboard a phone shows and the
 * validation the browser volunteers. The registry seeds each with a different default here rather
 * than shipping four near-identical components.
 *
 * `'password'` is offered for completeness and is not a security measure: the value is stored and
 * returned in clear text like every other field value, and only the rendered characters are
 * hidden. The config editor's hint says so.
 */
const TEXT_INPUT_TYPES = ['text', 'email', 'tel', 'url', 'password'];
/**
 * What the Input Type menu offers.
 *
 * `'email'` is a valid {@link TextInputType} and deliberately not on this list: the `Email` field
 * type seeds it, so for such a field it is a fact about what the field *is* rather than a setting
 * to pick — and picking it on a `Text` field only duplicated a type the dropdown one tab over
 * already offers.
 *
 * A saved config still holds it, and `TextFieldConfigComponent` adds it back to the menu for the
 * field that holds it — see {@link RETIRED_TEXT_INPUT_TYPE_LABELS}.
 */
const TEXT_INPUT_TYPE_OPTIONS = [
    { label: 'Text', value: 'text' },
    { label: 'Phone', value: 'tel' },
    { label: 'URL', value: 'url' },
    { label: 'Password', value: 'password' },
];
/**
 * Names for the input types no longer on the menu above.
 *
 * A `p-select` renders nothing for a value none of its options carry, so without this an `Email`
 * field would open showing an empty Input Type. The value was never at risk — only the user
 * seeing a blank where their field's type should be. Mirrors `RETIRED_FIELD_TYPE_LABELS`, which
 * does the same for the Type menu on the Metadata tab.
 */
const RETIRED_TEXT_INPUT_TYPE_LABELS = {
    email: 'Email',
};
/**
 * What a text field carries on one of its edges.
 *
 * `'none'` is the default and the reason the value member beside it can be ignored entirely:
 * an affix that is switched off keeps whatever was last typed into it, so flipping Text → None →
 * Text does not cost the user their wording. Only the mode decides what is drawn.
 */
const TEXT_AFFIX_MODES = ['none', 'text', 'icon'];
const TEXT_AFFIX_MODE_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Text', value: 'text' },
    { label: 'Icon', value: 'icon' },
];
const DEFAULT_TEXT_FIELD_CONFIG = {
    inputType: 'text',
    placeholder: '',
    maxLength: null,
    prefixMode: 'none',
    prefix: '',
    suffixMode: 'none',
    suffix: '',
    showToggleVisibility: true,
    mask: '',
    size: '',
    extra: {},
};
/**
 * A saved text-field config, defaulting every member it cannot read.
 *
 * `defaults` is a parameter rather than the constant above because the registry seeds a different
 * starting config per `fieldType` — an `Email` field's default `inputType` is `'email'`, not
 * `'text'` — and a saved config missing a member should fall back to *that type's* default, not
 * the kind's. Never throws; see `readConfigSource`.
 */
function parseTextFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    const prefix = readAffix(source, 'prefix', defaults.prefixMode, defaults.prefix);
    const suffix = readAffix(source, 'suffix', defaults.suffixMode, defaults.suffix);
    const extra = collectExtras(source, defaults);
    // The two members `readAffix` migrates from are foreign to the shape above, so `collectExtras`
    // would otherwise carry them forever and write them back beside the members that replaced them.
    // Dropped here rather than left to custody: their meaning has been read, not discarded.
    delete extra['prefixIcon'];
    delete extra['suffixIcon'];
    return {
        inputType: readOption(source['inputType'], TEXT_INPUT_TYPES, defaults.inputType),
        placeholder: readString(source['placeholder'], defaults.placeholder),
        maxLength: readNullableNumber(source['maxLength'], defaults.maxLength),
        prefixMode: prefix.mode,
        prefix: prefix.value,
        suffixMode: suffix.mode,
        suffix: suffix.value,
        showToggleVisibility: readBoolean(source['showToggleVisibility'], defaults.showToggleVisibility),
        mask: readString(source['mask'], defaults.mask),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra,
    };
}
/**
 * One edge's mode and value, reading a config written before either member existed.
 *
 * Until this pair replaced them, an edge was a single `prefixIcon`/`suffixIcon` string holding a
 * PrimeIcons class, with empty meaning none. Such a config has no `prefixMode` for `readOption` to
 * find, so a plain default would silently blank an icon a user had set and saved. The legacy
 * string is therefore read as what it was: a non-empty one means `'icon'` with that class as its
 * value.
 *
 * Only consulted where the new members are absent, so a config this app has saved since is
 * unaffected — including one that deliberately sets an edge back to `'none'`.
 */
function readAffix(source, edge, defaultMode, defaultValue) {
    const legacyIcon = readString(source[`${edge}Icon`], '').trim();
    return {
        mode: readOption(source[`${edge}Mode`], TEXT_AFFIX_MODES, legacyIcon === '' ? defaultMode : 'icon'),
        value: readString(source[edge], legacyIcon === '' ? defaultValue : legacyIcon),
    };
}

/** Matches the `rows="5"` the raw-JSON textarea this renderer replaces has always used. */
const DEFAULT_TEXTAREA_FIELD_CONFIG = {
    placeholder: '',
    rows: 5,
    maxLength: null,
    autoResize: false,
    size: '',
    extra: {},
};
/** A saved textarea config, defaulting every member it cannot read. See `parseTextFieldConfig`
    for why `defaults` is a parameter. */
function parseTextareaFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        placeholder: readString(source['placeholder'], defaults.placeholder),
        rows: readNumber(source['rows'], defaults.rows),
        maxLength: readNullableNumber(source['maxLength'], defaults.maxLength),
        autoResize: readBoolean(source['autoResize'], defaults.autoResize),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra: collectExtras(source, defaults),
    };
}

/** Where `p-inputnumber` puts its spinner buttons when `showButtons` is on. */
const NUMBER_BUTTON_LAYOUTS = ['stacked', 'horizontal', 'vertical'];
const NUMBER_BUTTON_LAYOUT_OPTIONS = [
    { label: 'Stacked', value: 'stacked' },
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
];
/**
 * What happens to a value that has more precision than the field displays.
 *
 * `'none'` is the default and leaves the value exactly as typed — which is what every field did
 * before this setting existed, so adding it changes nothing until it is chosen. The other two
 * round at the field's `maxFractionDigits`, and unlike the display settings beside them they
 * change what is **stored**: a `Round up` field with no decimal places commits `3` for a typed
 * `2.4`.
 */
const NUMBER_ROUNDING_RULES = ['none', 'up', 'down'];
const NUMBER_ROUNDING_RULE_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Round up', value: 'up' },
    { label: 'Round down', value: 'down' },
];
/**
 * How a negative value is written.
 *
 * `'negative'` is the ordinary leading minus. `'parenthesis'` is the accounting convention —
 * `(1,234.00)` rather than `-1,234.00` — which is what finance-facing fields are usually expected
 * to use.
 */
const NUMBER_NEGATIVE_FORMATS = ['negative', 'parenthesis'];
const NUMBER_NEGATIVE_FORMAT_OPTIONS = [
    { label: 'Negative', value: 'negative' },
    { label: 'Parenthesis', value: 'parenthesis' },
];
const DEFAULT_NUMBER_FIELD_CONFIG = {
    min: null,
    max: null,
    step: 1,
    showButtons: false,
    buttonLayout: 'stacked',
    useGrouping: true,
    minFractionDigits: null,
    maxFractionDigits: null,
    roundingRule: 'none',
    prefix: '',
    suffix: '',
    placeholder: '',
    showClear: false,
    allowEmpty: true,
    locale: '',
    negativeFormat: 'negative',
    showNegativeInRed: false,
    size: '',
    extra: {},
};
/** A saved number config, defaulting every member it cannot read. See `parseTextFieldConfig` for
    why `defaults` is a parameter — it is what separates `Number` from `Decimal`. */
function parseNumberFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        min: readNullableNumber(source['min'], defaults.min),
        max: readNullableNumber(source['max'], defaults.max),
        step: readNumber(source['step'], defaults.step),
        showButtons: readBoolean(source['showButtons'], defaults.showButtons),
        buttonLayout: readOption(source['buttonLayout'], NUMBER_BUTTON_LAYOUTS, defaults.buttonLayout),
        useGrouping: readBoolean(source['useGrouping'], defaults.useGrouping),
        minFractionDigits: readNullableNumber(source['minFractionDigits'], defaults.minFractionDigits),
        maxFractionDigits: readNullableNumber(source['maxFractionDigits'], defaults.maxFractionDigits),
        roundingRule: readOption(source['roundingRule'], NUMBER_ROUNDING_RULES, defaults.roundingRule),
        prefix: readString(source['prefix'], defaults.prefix),
        suffix: readString(source['suffix'], defaults.suffix),
        placeholder: readString(source['placeholder'], defaults.placeholder),
        showClear: readBoolean(source['showClear'], defaults.showClear),
        allowEmpty: readBoolean(source['allowEmpty'], defaults.allowEmpty),
        locale: readString(source['locale'], defaults.locale),
        negativeFormat: readOption(source['negativeFormat'], NUMBER_NEGATIVE_FORMATS, defaults.negativeFormat),
        showNegativeInRed: readBoolean(source['showNegativeInRed'], defaults.showNegativeInRed),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra: collectExtras(source, defaults),
    };
}

/** How the currency is named alongside the amount. */
const CURRENCY_DISPLAYS = ['symbol', 'code', 'name'];
const CURRENCY_DISPLAY_OPTIONS = [
    { label: 'Symbol ($)', value: 'symbol' },
    { label: 'Code (USD)', value: 'code' },
    { label: 'Name (US dollars)', value: 'name' },
];
const DEFAULT_CURRENCY_FIELD_CONFIG = {
    currency: 'USD',
    currencyDisplay: 'symbol',
    locale: '',
    min: null,
    max: null,
    step: 1,
    useGrouping: true,
    minFractionDigits: null,
    maxFractionDigits: null,
    showButtons: false,
    buttonLayout: 'stacked',
    placeholder: '',
    showClear: false,
    allowEmpty: true,
    size: '',
    extra: {},
};
/**
 * True for a well-formed ISO 4217 code.
 *
 * Shape only — three letters — not membership of the real list: `Intl` knows codes this check
 * cannot enumerate, and a hardcoded list would be this app refusing a currency the browser is
 * perfectly willing to format. The config editor uses it to warn, and
 * `CurrencyFieldInputComponent` uses it to fall back rather than let `p-inputnumber` throw on a
 * code `Intl.NumberFormat` rejects.
 */
function isCurrencyCodeShaped(code) {
    return /^[A-Za-z]{3}$/.test(code.trim());
}
/** A saved currency config, defaulting every member it cannot read. */
function parseCurrencyFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        currency: readString(source['currency'], defaults.currency),
        currencyDisplay: readOption(source['currencyDisplay'], CURRENCY_DISPLAYS, defaults.currencyDisplay),
        locale: readString(source['locale'], defaults.locale),
        min: readNullableNumber(source['min'], defaults.min),
        max: readNullableNumber(source['max'], defaults.max),
        step: readNumber(source['step'], defaults.step),
        useGrouping: readBoolean(source['useGrouping'], defaults.useGrouping),
        minFractionDigits: readNullableNumber(source['minFractionDigits'], defaults.minFractionDigits),
        maxFractionDigits: readNullableNumber(source['maxFractionDigits'], defaults.maxFractionDigits),
        showButtons: readBoolean(source['showButtons'], defaults.showButtons),
        buttonLayout: readOption(source['buttonLayout'], NUMBER_BUTTON_LAYOUTS, defaults.buttonLayout),
        placeholder: readString(source['placeholder'], defaults.placeholder),
        showClear: readBoolean(source['showClear'], defaults.showClear),
        allowEmpty: readBoolean(source['allowEmpty'], defaults.allowEmpty),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra: collectExtras(source, defaults),
    };
}

/**
 * Which of the two controls a `Checkbox` field draws.
 *
 * One field type rather than two, because to an author they are the same question asked at
 * different widths — "tick this" and "tick any of these". The cost is that the two modes hold
 * different *shapes* of value, so this member is read by the codec as well as by the control: see
 * `CheckboxFieldValue` and the branching in `checkboxFieldRenderer`.
 */
const CHECKBOX_TYPES = ['single', 'group'];
const CHECKBOX_TYPE_OPTIONS = [
    { label: 'Single (Default)', value: 'single' },
    { label: 'Group', value: 'group' },
];
/** Which side of the box its caption sits on, in `'single'` mode. */
const LABEL_POSITIONS = ['right', 'left'];
const LABEL_POSITION_OPTIONS = [
    { label: 'After the box', value: 'right' },
    { label: 'Before the box', value: 'left' },
];
/**
 * What separates the ticked values in `'group'` mode.
 *
 * A field value is one string, so a group has to join its selections. The comma matches the date
 * renderer's `'multiple'` mode — and is why `CheckboxFieldConfigComponent` rejects an option value
 * containing one: the join would be unreadable on the way back.
 */
const CHECKBOX_VALUE_SEPARATOR = ',';
const DEFAULT_CHECKBOX_FIELD_CONFIG = {
    checkboxType: 'single',
    label: '',
    labelPosition: 'right',
    triState: false,
    trueText: 'true',
    falseText: 'false',
    readonly: false,
    checkboxIcon: '',
    options: [],
    orientation: 'vertical',
    sortChoices: 'none',
    minSelected: 0,
    maxSelected: 0,
    size: '',
    extra: {},
};
/**
 * The members belonging to whichever mode is *not* active, back at their defaults.
 *
 * Used by the editor when the author switches mode: the settings of the mode being left behind
 * are cleared rather than carried, so a group cannot be saved holding a stale `trueText` and a
 * single box cannot be saved holding options nothing renders.
 */
function clearedCheckboxModeSettings(checkboxType) {
    const { label, labelPosition, triState, trueText, falseText, readonly, checkboxIcon, options, orientation, sortChoices, minSelected, maxSelected, } = DEFAULT_CHECKBOX_FIELD_CONFIG;
    return checkboxType === 'group'
        ? { options, orientation, sortChoices, minSelected, maxSelected }
        : { label, labelPosition, triState, trueText, falseText, readonly, checkboxIcon };
}
/** A saved checkbox config, defaulting every member it cannot read. */
function parseCheckboxFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        checkboxType: readOption(source['checkboxType'], CHECKBOX_TYPES, defaults.checkboxType),
        label: readString(source['label'], defaults.label),
        labelPosition: readOption(source['labelPosition'], LABEL_POSITIONS, defaults.labelPosition),
        triState: readBoolean(source['triState'], defaults.triState),
        trueText: readString(source['trueText'], defaults.trueText),
        falseText: readString(source['falseText'], defaults.falseText),
        readonly: readBoolean(source['readonly'], defaults.readonly),
        checkboxIcon: readString(source['checkboxIcon'], defaults.checkboxIcon),
        options: parseChoiceOptions(readArray(source['options']), defaults.options, readString, readRecord),
        orientation: readOption(source['orientation'], CHOICE_ORIENTATIONS, defaults.orientation),
        sortChoices: readOption(source['sortChoices'], CHOICE_SORTS, defaults.sortChoices),
        minSelected: readCount(source['minSelected'], defaults.minSelected),
        maxSelected: readCount(source['maxSelected'], defaults.maxSelected),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra: collectExtras(source, defaults),
    };
}
/** A whole count of zero or more, or the default. A negative or fractional bound is not a bound
    anyone meant, and letting one through would mark every value invalid with no way to see why. */
function readCount(raw, fallback) {
    return typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 ? raw : fallback;
}

const DEFAULT_RADIO_FIELD_CONFIG = {
    options: [],
    orientation: 'vertical',
    sortChoices: 'none',
    allowClear: false,
    size: '',
    extra: {},
};
/** A saved radio config, defaulting every member it cannot read. */
function parseRadioFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        options: parseChoiceOptions(readArray(source['options']), defaults.options, readString, readRecord),
        orientation: readOption(source['orientation'], CHOICE_ORIENTATIONS, defaults.orientation),
        sortChoices: readOption(source['sortChoices'], CHOICE_SORTS, defaults.sortChoices),
        allowClear: readBoolean(source['allowClear'], defaults.allowClear),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra: collectExtras(source, defaults),
    };
}

/**
 * How many of its options a `Dropdown` field lets a user pick.
 *
 * One field type rather than two, for the same reason `Checkbox` covers both a single box and a
 * group: to an author they are the same question asked with a different ceiling — "pick one of
 * these" and "pick any of these". The cost is the same too — the two modes hold different *shapes*
 * of value, so this member is read by the codec as well as by the control. See `SelectFieldValue`
 * and the branching in `selectFieldRenderer`.
 *
 * The two modes also draw different PrimeNG components, `p-select` and `p-multiselect`, which is
 * why {@link SelectFieldConfig} carries one display member for each.
 */
const SELECT_MODES = ['single', 'multiple'];
const SELECT_MODE_OPTIONS = [
    { label: 'Single (Default)', value: 'single' },
    { label: 'Multiple', value: 'multiple' },
];
/**
 * What separates the picked values in `'multiple'` mode.
 *
 * A field value is one string, so a multi-pick has to join its selections. The comma matches
 * `CHECKBOX_VALUE_SEPARATOR` and the date renderer's `'multiple'` mode — and is why
 * `SelectFieldConfigComponent` rejects an option value containing one: the join would be
 * unreadable on the way back.
 */
const SELECT_VALUE_SEPARATOR = ',';
/** Defaults match PrimeNG's own for {@link SelectFieldConfig.checkmark} and
    {@link SelectFieldConfig.highlightOnSelect}, so an unconfigured field looks like a stock
    control rather than a deliberately restyled one. */
const DEFAULT_SELECT_FIELD_CONFIG = {
    selectionMode: 'single',
    options: [],
    sortChoices: 'none',
    placeholder: '',
    showClear: false,
    filter: false,
    filterPlaceholder: '',
    checkmark: false,
    highlightOnSelect: true,
    size: '',
    extra: {},
};
/** A saved select config, defaulting every member it cannot read. */
function parseSelectFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        selectionMode: readOption(source['selectionMode'], SELECT_MODES, defaults.selectionMode),
        options: parseChoiceOptions(readArray(source['options']), defaults.options, readString, readRecord),
        sortChoices: readOption(source['sortChoices'], CHOICE_SORTS, defaults.sortChoices),
        placeholder: readString(source['placeholder'], defaults.placeholder),
        showClear: readBoolean(source['showClear'], defaults.showClear),
        filter: readBoolean(source['filter'], defaults.filter),
        filterPlaceholder: readString(source['filterPlaceholder'], defaults.filterPlaceholder),
        checkmark: readBoolean(source['checkmark'], defaults.checkmark),
        highlightOnSelect: readBoolean(source['highlightOnSelect'], defaults.highlightOnSelect),
        size: readOption(source['size'], FIELD_INPUT_SIZES, defaults.size),
        extra: collectExtras(source, defaults),
    };
}

/**
 * How many dates one value holds.
 *
 * This is the only config member that changes the *shape* of the value — `'single'` stores one
 * date, `'multiple'` a comma-separated list, `'range'` a `start/end` pair — so changing it on a
 * field that already holds data leaves stored values in a shape the new mode does not read. The
 * config editor warns about that, and `FieldDefinitionDetailComponent` locks `fieldType` on an
 * edit for the same family of reasons.
 */
const DATE_SELECTION_MODES = ['single', 'multiple', 'range'];
const DATE_SELECTION_MODE_OPTIONS = [
    { label: 'Single date', value: 'single' },
    { label: 'Multiple dates', value: 'multiple' },
    { label: 'Date range', value: 'range' },
];
/**
 * The date formats the config editor offers, as PrimeNG tokens.
 *
 * A closed list rather than the free-text box this replaced: every format below reads
 * unambiguously to a user picking one, where a typed token string reads as an invitation to
 * invent `DD-MMM-YY` and discover at render time that PrimeNG spells it differently. A saved
 * config holding a format that is not here still opens with it — see
 * `DateFieldConfigComponent.dateFormatOptions`.
 *
 * PrimeNG's tokens are not Angular's: `MM` is the month's full name, `yy` a 4-digit year.
 */
const DATE_FORMAT_OPTIONS = [
    { label: 'MM/DD/YYYY', value: 'mm/dd/yy' },
    { label: 'DD/MM/YYYY', value: 'dd/mm/yy' },
    { label: 'Month Day, Year', value: 'MM d, yy' },
    { label: 'Month Year', value: 'MM yy' },
    { label: 'Year', value: 'yy' },
];
/**
 * A limit on the calendar relative to the day it is opened, rather than to a fixed date.
 *
 * The two are the cases a fixed bound cannot express: a date of birth is always in the past and
 * an appointment always ahead, whatever day the form is filled in. Both include today — a field
 * that refuses the current date is a rarer thing to want than one that accepts it, and `minDate`
 * or `maxDate` can still say so. Applied on top of the fixed bounds, never instead of them: see
 * `DateFieldInputComponent.minDate`.
 */
const DATE_LIMITS = ['none', 'future', 'past'];
const DATE_LIMIT_OPTIONS = [
    { label: 'No limit', value: 'none' },
    { label: 'Future Dates Only', value: 'future' },
    { label: 'Past Dates Only', value: 'past' },
];
/** Which panel the picker opens on — `'month'` and `'year'` skip straight to those. */
const DATE_VIEWS = ['date', 'month', 'year'];
const DATE_VIEW_OPTIONS = [
    { label: 'Date', value: 'date' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
];
const HOUR_FORMATS = ['12', '24'];
const HOUR_FORMAT_OPTIONS = [
    { label: '12 hour', value: '12' },
    { label: '24 hour', value: '24' },
];
/** Whether the calendar icon sits inside the input or as a button beside it. */
const DATE_ICON_DISPLAYS = ['input', 'button'];
const DATE_ICON_DISPLAY_OPTIONS = [
    { label: 'Inside the input', value: 'input' },
    { label: 'As a button', value: 'button' },
];
const DEFAULT_DATE_FIELD_CONFIG = {
    dateFormat: 'mm/dd/yy',
    showTime: false,
    hourFormat: '12',
    showSeconds: false,
    stepMinute: 1,
    showIcon: true,
    iconDisplay: 'input',
    selectionMode: 'single',
    dateLimit: 'none',
    restrictDateRange: false,
    minDate: '',
    maxDate: '',
    numberOfMonths: 1,
    showButtonBar: false,
    showClear: false,
    readonlyInput: false,
    inline: false,
    view: 'date',
    placeholder: '',
    extra: {},
};
/** A saved date config, defaulting every member it cannot read. See `parseTextFieldConfig` for
    why `defaults` is a parameter — it is what lets the retired `DateTime` type still open with
    time switched on. */
function parseDateFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    const minDate = readString(source['minDate'], defaults.minDate);
    const maxDate = readString(source['maxDate'], defaults.maxDate);
    return {
        dateFormat: readString(source['dateFormat'], defaults.dateFormat),
        showTime: readBoolean(source['showTime'], defaults.showTime),
        hourFormat: readOption(source['hourFormat'], HOUR_FORMATS, defaults.hourFormat),
        showSeconds: readBoolean(source['showSeconds'], defaults.showSeconds),
        stepMinute: readNumber(source['stepMinute'], defaults.stepMinute),
        showIcon: readBoolean(source['showIcon'], defaults.showIcon),
        iconDisplay: readOption(source['iconDisplay'], DATE_ICON_DISPLAYS, defaults.iconDisplay),
        selectionMode: readOption(source['selectionMode'], DATE_SELECTION_MODES, defaults.selectionMode),
        dateLimit: readOption(source['dateLimit'], DATE_LIMITS, defaults.dateLimit),
        // A config saved before this member existed has none to read, and defaulting it to off would
        // quietly widen every calendar already limited. So a bound in the saved config is taken as
        // proof the range was meant to apply.
        restrictDateRange: readBoolean(source['restrictDateRange'], defaults.restrictDateRange || minDate.trim() !== '' || maxDate.trim() !== ''),
        minDate,
        maxDate,
        numberOfMonths: readNumber(source['numberOfMonths'], defaults.numberOfMonths),
        showButtonBar: readBoolean(source['showButtonBar'], defaults.showButtonBar),
        showClear: readBoolean(source['showClear'], defaults.showClear),
        readonlyInput: readBoolean(source['readonlyInput'], defaults.readonlyInput),
        inline: readBoolean(source['inline'], defaults.inline),
        view: readOption(source['view'], DATE_VIEWS, defaults.view),
        placeholder: readString(source['placeholder'], defaults.placeholder),
        extra: collectExtras(source, defaults),
    };
}

/**
 * Every extension a `Media` field can accept, grouped as the dropdown heads them.
 *
 * A set rather than one at a time: the slot declares which extensions it takes, and "any of
 * these" is the normal answer. There is no `'all'` entry — "everything" is every extension
 * selected, which `p-multiselect`'s own toggle-all checkbox says in one click and which
 * {@link DEFAULT_MEDIA_FIELD_CONFIG} starts a new field on. A sentinel value would have to be
 * kept exclusive of every real one by hand, and would read as a 94th extension in a list of 93.
 *
 * Extensions are stored with their leading dot and upper-cased, exactly as supplied — `.TAR.GZ`
 * genuinely carries two dots and is not a typo. The source list had `JPG` and `XAPK` without the
 * leading dot alone among ninety-odd entries; both are written with one here so a stored value is
 * the same shape whichever extension it names.
 *
 * The single source of truth: {@link MEDIA_FILE_EXTENSIONS} and
 * {@link MEDIA_FILE_EXTENSION_OPTIONS} are both derived from it, so a list that grows cannot grow
 * in one place and not the other.
 */
const MEDIA_FILE_EXTENSION_GROUPS = [
    {
        label: 'Text Files',
        items: ['.DOC', '.DOCX', '.EML', '.MSG', '.ODT', '.PAGES', '.RTF', '.TEX', '.TXT', '.WPD'].map(toExtensionOption),
    },
    {
        label: 'Data Files',
        items: [
            '.AAE',
            '.BIN',
            '.CSV',
            '.DAT',
            '.KEY',
            '.LOG',
            '.MPP',
            '.OBB',
            '.PPT',
            '.PPTX',
            '.RPT',
            '.TAR',
            '.VCF',
            '.XML',
        ].map(toExtensionOption),
    },
    {
        label: 'Audio Files',
        items: ['.AIF', '.FLAC', '.M3U', '.M4A', '.MID', '.MP3', '.OGG', '.WAV', '.WMA'].map(toExtensionOption),
    },
    {
        label: 'Video Files',
        items: [
            '.3GP',
            '.ASF',
            '.AVI',
            '.FLV',
            '.M4V',
            '.MOV',
            '.MP4',
            '.MPG',
            '.SWF',
            '.TS',
            '.VOB',
            '.WMV',
        ].map(toExtensionOption),
    },
    {
        label: 'Raster Image Files',
        items: [
            '.BMP',
            '.DCM',
            '.DDS',
            '.DJVU',
            '.GIF',
            '.HEIC',
            '.JPG',
            '.PNG',
            '.PSD',
            '.TGA',
            '.TIF',
        ].map(toExtensionOption),
    },
    {
        label: 'Vector Image Files',
        items: ['.AI', '.CDR', '.EMF', '.EPS', '.PS', '.SKETCH', '.SVG', '.VSDX'].map(toExtensionOption),
    },
    {
        label: 'Page Layout Files',
        items: ['.INDD', '.OXPS', '.PDF', '.PMD', '.PUB', '.QXP', '.XPS'].map(toExtensionOption),
    },
    {
        label: 'Spreadsheet Files',
        items: ['.NUMBERS', '.ODS', '.XLR', '.XLS', '.XLSX'].map(toExtensionOption),
    },
    {
        label: 'CAD Files',
        items: ['.DGN', '.DWG', '.DXF', '.STEP', '.STL', '.STP'].map(toExtensionOption),
    },
    {
        label: 'Compressed Files',
        items: [
            '.7Z',
            '.CBR',
            '.DEB',
            '.GZ',
            '.PKG',
            '.RAR',
            '.RPM',
            '.TAR.GZ',
            '.XAPK',
            '.ZIP',
            '.ZIPX',
        ].map(toExtensionOption),
    },
];
/** An extension as one dropdown entry. Label and value are the same text: the extension is what
    an admin is choosing and what gets stored, and a prettier caption would only be the same
    string with the dot filed off. */
function toExtensionOption(extension) {
    return { label: extension, value: extension };
}
/**
 * Every offered extension, flattened and in menu order — what a saved value is validated against,
 * and what "all of them" means.
 *
 * The order matters beyond display: {@link parseFileExtensions} answers in it, so a stored
 * selection reads back grouped the way the menu presents it however it was written.
 */
const MEDIA_FILE_EXTENSIONS = MEDIA_FILE_EXTENSION_GROUPS.flatMap((group) => group.items.map((item) => item.value));
/** The dropdown's own shape, grouped. Mutable arrays because `p-select`'s `options` input is. */
const MEDIA_FILE_EXTENSION_OPTIONS = MEDIA_FILE_EXTENSION_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.map(({ label, value }) => ({ label, value })),
}));
/**
 * How large the placeholder is drawn.
 *
 * Deliberately **not** `FIELD_INPUT_SIZES` from `field-definition-type-common.model.ts`, which the
 * six other configs share. That one is `'' | 'small' | 'large'` because it is handed straight to a
 * PrimeNG control's `size` input, and its empty member means "whatever the theme's default is".
 * A `Media` field draws an icon rather than a PrimeNG control, so there is no control default to
 * defer to — every value here names a size, and the middle one is a real choice rather than an
 * absent one.
 */
const MEDIA_PREVIEW_SIZES = ['small', 'medium', 'large'];
const MEDIA_PREVIEW_SIZE_OPTIONS = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
];
const DEFAULT_MEDIA_FIELD_CONFIG = {
    // Everything, so a new field accepts any file until someone narrows it — the permissive default
    // is the one that cannot silently reject a file an admin never thought to allow.
    fileExtensions: [...MEDIA_FILE_EXTENSIONS],
    maxFileSizeMb: 5,
    previewSize: 'medium',
    fieldTypeOptions: [],
    extra: {},
};
/** A saved media config, defaulting every member it cannot read. See `parseTextFieldConfig` for
    why `defaults` is a parameter. */
function parseMediaFieldConfig(json, defaults) {
    const source = readConfigSource(json);
    if (source === null) {
        return defaults;
    }
    return {
        fileExtensions: parseFileExtensions(source['fileExtensions'], defaults.fileExtensions),
        // Not range-checked here. A saved zero is a fact about data this app may not have written, and
        // defaulting it away would hide the bad config rather than surface it — the editor flags it,
        // with the offending number still in the box to be fixed.
        maxFileSizeMb: readNumber(source['maxFileSizeMb'], defaults.maxFileSizeMb),
        previewSize: readOption(source['previewSize'], MEDIA_PREVIEW_SIZES, defaults.previewSize),
        fieldTypeOptions: parseChoiceOptions(readArray(source['fieldTypeOptions']), defaults.fieldTypeOptions, readString, readRecord),
        extra: collectExtras(source, defaults),
    };
}
/**
 * The extensions a saved config names, dropping every entry the list no longer offers.
 *
 * Answers in {@link MEDIA_FILE_EXTENSIONS} order rather than the stored order, which also
 * collapses duplicates — the same move `checkboxFieldRenderer`'s group codec makes, and for the
 * same reason: the selection is a set, so its stored order carries no information and letting it
 * vary would make two identical configs serialise differently.
 *
 * An absent member means a config written before this one existed, and takes the caller's default
 * — every extension. An explicitly empty array is honoured as empty, not repaired: it is a
 * deliberate state the editor then reports as invalid, and quietly turning it back into "accepts
 * everything" would be this app deciding a field's contract on the admin's behalf.
 */
function parseFileExtensions(raw, fallback) {
    const entries = readArray(raw);
    if (entries === null) {
        return [...fallback];
    }
    const stored = new Set(entries.filter((entry) => typeof entry === 'string'));
    return MEDIA_FILE_EXTENSIONS.filter((extension) => stored.has(extension));
}

/**
 * Draws a single-line text field.
 *
 * Serves four wire types — `Text`, `Email`, `Phone` and `Url` — which differ only in the
 * `inputType` the registry seeds and therefore in the keyboard a phone offers and the validation
 * the browser volunteers. See `FIELD_DEFINITION_TYPE_RENDERERS`.
 *
 * The control has three wrappers and three inner controls, decided independently: `shape` picks
 * the wrapper and `innerControl` the input inside it — see each for the order and why it is that
 * order. The inner control is a `p-inputmask` for a masked phone field, a `p-password` for a
 * password field drawing its reveal eye, and a `pInputText` otherwise; each is declared once in a
 * template and outlet-ed into every wrapper, so a change to their bindings cannot apply to one
 * arrangement and not the rest — which is what lets a masked field carry a prefix and a suffix
 * like any other.
 *
 * No label: `FieldInputComponent` draws that once for all eight renderers — see `FieldRenderer`.
 */
class TextFieldInputComponent {
    config = input.required(...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    value = model('', ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    /** Fires once the user leaves the control. Text codecs are identity, so `value` is already
        settled by the time this emits — there is no rounding or repainting to wait for here. */
    blurred = output();
    /** The control's `id`, which `FieldInputComponent`'s label points at. Falls back to a constant
        only so the attribute is never empty; a field with no key is a create in progress. */
    inputId = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    /** A mask applies to `Phone` alone, whatever a config saved before that rule holds — see
        `TextFieldConfig.mask`. */
    hasMask = computed(() => this.config().inputType === 'tel' && this.config().mask.trim() !== '', ...(ngDevMode ? [{ debugName: "hasMask" }] : /* istanbul ignore next */ []));
    /** Whether this is a password field drawing the eye that reveals what has been typed. */
    hasPasswordToggle = computed(() => this.config().inputType === 'password' && this.config().showToggleVisibility, ...(ngDevMode ? [{ debugName: "hasPasswordToggle" }] : /* istanbul ignore next */ []));
    /** The prefix as a PrimeIcons class, or '' when that edge carries a word or nothing. */
    prefixIcon = computed(() => this.affix('prefix', 'icon'), ...(ngDevMode ? [{ debugName: "prefixIcon" }] : /* istanbul ignore next */ []));
    suffixIcon = computed(() => this.affix('suffix', 'icon'), ...(ngDevMode ? [{ debugName: "suffixIcon" }] : /* istanbul ignore next */ []));
    /** The prefix as literal text, or '' when that edge carries an icon or nothing. */
    prefixText = computed(() => this.affix('prefix', 'text'), ...(ngDevMode ? [{ debugName: "prefixText" }] : /* istanbul ignore next */ []));
    suffixText = computed(() => this.affix('suffix', 'text'), ...(ngDevMode ? [{ debugName: "suffixText" }] : /* istanbul ignore next */ []));
    hasIcons = computed(() => this.prefixIcon() !== '' || this.suffixIcon() !== '', ...(ngDevMode ? [{ debugName: "hasIcons" }] : /* istanbul ignore next */ []));
    /** Whether either edge carries a word. */
    hasText = computed(() => this.prefixText() !== '' || this.suffixText() !== '', ...(ngDevMode ? [{ debugName: "hasText" }] : /* istanbul ignore next */ []));
    /**
     * Which control draws the value itself, inside whichever wrapper {@link shape} picks.
     *
     * The two special controls cannot collide: a mask applies to `'tel'` alone and the reveal eye to
     * `'password'` alone, so at most one of them is ever asked for.
     *
     * Separate from {@link shape} because the two answer different questions — which input, and what
     * sits beside it. Deciding both at once is what previously dropped a masked field's affixes
     * entirely: the mask short-circuited the wrapper as well as the control.
     */
    innerControl = computed(() => {
        if (this.hasMask()) {
            return 'mask';
        }
        return this.hasPasswordToggle() ? 'password' : 'plain';
    }, ...(ngDevMode ? [{ debugName: "innerControl" }] : /* istanbul ignore next */ []));
    /**
     * Which of the three arrangements wraps this field.
     *
     * A computed rather than a chain of `@if`s in the template because the order is the reasoning:
     *
     * - `group` first, for anything that cannot sit *inside* the input. A word never can. An icon
     *   cannot either once the inner control is one that wraps the real input in a host element of
     *   its own — `p-password` and `p-inputmask` both do, which puts the input a level deeper than
     *   `p-iconfield`'s padding reaches. `p-inputgroup` has no such limit (PrimeNG ships an explicit
     *   `.p-inputgroup > p-inputmask > .p-inputtext` rule), so its attached boxes are the one
     *   arrangement that can hold every combination — and a field mixing a word and an icon draws
     *   both that way.
     * - `iconfield` for the plain icon case, which keeps icons inside the input as before.
     * - `bare` otherwise.
     */
    shape = computed(() => {
        if (this.hasText() || (this.hasIcons() && this.innerControl() !== 'plain')) {
            return 'group';
        }
        return this.hasIcons() ? 'iconfield' : 'bare';
    }, ...(ngDevMode ? [{ debugName: "shape" }] : /* istanbul ignore next */ []));
    /**
     * Which edge `p-iconfield` pads for.
     *
     * It takes one position, so a config setting both icons gets the prefix's padding and a
     * best-effort suffix. Both at once is an unusual arrangement and not worth a second wrapper.
     */
    iconPosition = computed(() => this.prefixIcon() !== '' ? 'left' : 'right', ...(ngDevMode ? [{ debugName: "iconPosition" }] : /* istanbul ignore next */ []));
    /**
     * The soft keyboard to ask for, which is most of the point of `inputType` on a phone.
     *
     * Null for `text` and `password` rather than `'text'`: leaving the attribute off lets the
     * browser decide, and for a password field naming an input mode would be second-guessing it.
     */
    inputMode = computed(() => {
        switch (this.config().inputType) {
            case 'email':
                return 'email';
            case 'tel':
                return 'tel';
            case 'url':
                return 'url';
            default:
                return null;
        }
    }, ...(ngDevMode ? [{ debugName: "inputMode" }] : /* istanbul ignore next */ []));
    /** `''` means "theme default", which PrimeNG spells as `undefined`. */
    primeSize = computed(() => this.config().size || undefined, ...(ngDevMode ? [{ debugName: "primeSize" }] : /* istanbul ignore next */ []));
    /** `p-inputmask` emits null for a cleared control; the wire value for text is `''`. */
    onValueChange(next) {
        this.value.set(next ?? '');
    }
    /**
     * One edge's value, but only when that edge is in the mode asked for.
     *
     * The mode is what decides — a config keeps the last word typed into an edge that is now
     * switched off, so a non-empty value means nothing on its own.
     */
    affix(edge, mode) {
        const config = this.config();
        // The eye takes the suffix's edge, so nothing else is drawn there. Enforced here rather than
        // left to the editor's own hiding of the setting: a config saved before that rule, or by
        // another client, would otherwise put two things in one place.
        if (edge === 'suffix' && this.hasPasswordToggle()) {
            return '';
        }
        return config[`${edge}Mode`] === mode ? config[edge].trim() : '';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: TextFieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: TextFieldInputComponent, isStandalone: true, selector: "vcr-text-field-input", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange", blurred: "blurred" }, ngImport: i0, template: "<!-- Declared once and outlet-ed below, so the grouped, icon-wrapped and bare shapes cannot drift\n     apart in their bindings. -->\n<ng-template #plainInput>\n  <input\n    pInputText\n    [id]=\"inputId()\"\n    [type]=\"config().inputType\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onValueChange($event)\"\n    (blur)=\"blurred.emit()\"\n    [placeholder]=\"config().placeholder\"\n    [attr.maxlength]=\"config().maxLength\"\n    [attr.inputmode]=\"inputMode()\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [pSize]=\"primeSize()\"\n  />\n</ng-template>\n\n<!-- The password shape. `p-password` is what draws the eye, and `feedback` is off because a\n     strength meter is advice about a password being chosen \u2014 this control edits a stored field\n     value, which is not the same thing. -->\n<ng-template #passwordInput>\n  <p-password\n    [inputId]=\"inputId()\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onValueChange($event)\"\n    (onBlur)=\"blurred.emit()\"\n    [placeholder]=\"config().placeholder\"\n    [maxLength]=\"config().maxLength ?? undefined\"\n    [toggleMask]=\"true\"\n    [feedback]=\"false\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n  />\n</ng-template>\n\n<!-- The masked shape. Its own control rather than an attribute on the plain input, and like\n     `p-password` it wraps the real input in a host element of its own \u2014 which is why an affix\n     beside it has to be an input-group addon rather than an icon inside the field. See `shape`. -->\n<ng-template #maskInput>\n  <p-inputmask\n    [inputId]=\"inputId()\"\n    [mask]=\"config().mask\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onValueChange($event)\"\n    (onBlur)=\"blurred.emit()\"\n    [placeholder]=\"config().placeholder\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n  />\n</ng-template>\n\n<!-- Which of the three the wrappers below draw. See `innerControl`. -->\n<ng-template #control>\n  @switch (innerControl()) {\n    @case ('mask') {\n      <ng-container [ngTemplateOutlet]=\"maskInput\" />\n    }\n    @case ('password') {\n      <ng-container [ngTemplateOutlet]=\"passwordInput\" />\n    }\n    @default {\n      <ng-container [ngTemplateOutlet]=\"plainInput\" />\n    }\n  }\n</ng-template>\n\n@switch (shape()) {\n  @case ('group') {\n    <p-inputgroup>\n      @if (prefixText() !== '') {\n        <p-inputgroup-addon>{{ prefixText() }}</p-inputgroup-addon>\n      } @else if (prefixIcon() !== '') {\n        <p-inputgroup-addon><i [class]=\"prefixIcon()\" aria-hidden=\"true\"></i></p-inputgroup-addon>\n      }\n      <ng-container [ngTemplateOutlet]=\"control\" />\n      @if (suffixText() !== '') {\n        <p-inputgroup-addon>{{ suffixText() }}</p-inputgroup-addon>\n      } @else if (suffixIcon() !== '') {\n        <p-inputgroup-addon><i [class]=\"suffixIcon()\" aria-hidden=\"true\"></i></p-inputgroup-addon>\n      }\n    </p-inputgroup>\n  }\n  @case ('iconfield') {\n    <p-iconfield [iconPosition]=\"iconPosition()\">\n      @if (prefixIcon() !== '') {\n        <p-inputicon [styleClass]=\"prefixIcon()\" />\n      }\n      <ng-container [ngTemplateOutlet]=\"control\" />\n      @if (suffixIcon() !== '') {\n        <p-inputicon [styleClass]=\"suffixIcon()\" />\n      }\n    </p-iconfield>\n  }\n  @default {\n    <ng-container [ngTemplateOutlet]=\"control\" />\n  }\n}\n", styles: ["@charset \"UTF-8\";:host{display:block;min-width:0}:host ::ng-deep input,:host ::ng-deep .p-iconfield,:host ::ng-deep .p-inputmask,:host ::ng-deep .p-password{width:100%}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: IconField, selector: "p-iconfield, p-iconField, p-icon-field", inputs: ["hostName", "iconPosition", "styleClass"] }, { kind: "component", type: InputGroup, selector: "p-inputgroup, p-inputGroup, p-input-group", inputs: ["styleClass"] }, { kind: "component", type: InputGroupAddon, selector: "p-inputgroup-addon, p-inputGroupAddon", inputs: ["style", "styleClass"] }, { kind: "component", type: InputIcon, selector: "p-inputicon, p-inputIcon", inputs: ["hostName", "styleClass"] }, { kind: "component", type: InputMask, selector: "p-inputmask, p-inputMask, p-input-mask", inputs: ["type", "slotChar", "autoClear", "showClear", "style", "inputId", "styleClass", "placeholder", "tabindex", "title", "ariaLabel", "ariaLabelledBy", "ariaRequired", "readonly", "unmask", "characterPattern", "autofocus", "autocomplete", "keepBuffer", "mask"], outputs: ["onComplete", "onFocus", "onBlur", "onInput", "onKeydown", "onClear"] }, { kind: "directive", type: InputText, selector: "[pInputText]", inputs: ["hostName", "ptInputText", "pInputTextPT", "pInputTextUnstyled", "pSize", "variant", "fluid", "invalid"] }, { kind: "component", type: Password, selector: "p-password", inputs: ["ariaLabel", "ariaLabelledBy", "label", "promptLabel", "mediumRegex", "strongRegex", "weakLabel", "mediumLabel", "maxLength", "strongLabel", "inputId", "feedback", "toggleMask", "inputStyleClass", "styleClass", "inputStyle", "showTransitionOptions", "hideTransitionOptions", "autocomplete", "placeholder", "showClear", "autofocus", "tabindex", "appendTo", "motionOptions", "overlayOptions"], outputs: ["onFocus", "onBlur", "onClear"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: TextFieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-text-field-input', standalone: true, imports: [
                        FormsModule,
                        NgTemplateOutlet,
                        IconField,
                        InputGroup,
                        InputGroupAddon,
                        InputIcon,
                        InputMask,
                        InputText,
                        Password,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- Declared once and outlet-ed below, so the grouped, icon-wrapped and bare shapes cannot drift\n     apart in their bindings. -->\n<ng-template #plainInput>\n  <input\n    pInputText\n    [id]=\"inputId()\"\n    [type]=\"config().inputType\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onValueChange($event)\"\n    (blur)=\"blurred.emit()\"\n    [placeholder]=\"config().placeholder\"\n    [attr.maxlength]=\"config().maxLength\"\n    [attr.inputmode]=\"inputMode()\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [pSize]=\"primeSize()\"\n  />\n</ng-template>\n\n<!-- The password shape. `p-password` is what draws the eye, and `feedback` is off because a\n     strength meter is advice about a password being chosen \u2014 this control edits a stored field\n     value, which is not the same thing. -->\n<ng-template #passwordInput>\n  <p-password\n    [inputId]=\"inputId()\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onValueChange($event)\"\n    (onBlur)=\"blurred.emit()\"\n    [placeholder]=\"config().placeholder\"\n    [maxLength]=\"config().maxLength ?? undefined\"\n    [toggleMask]=\"true\"\n    [feedback]=\"false\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n  />\n</ng-template>\n\n<!-- The masked shape. Its own control rather than an attribute on the plain input, and like\n     `p-password` it wraps the real input in a host element of its own \u2014 which is why an affix\n     beside it has to be an input-group addon rather than an icon inside the field. See `shape`. -->\n<ng-template #maskInput>\n  <p-inputmask\n    [inputId]=\"inputId()\"\n    [mask]=\"config().mask\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onValueChange($event)\"\n    (onBlur)=\"blurred.emit()\"\n    [placeholder]=\"config().placeholder\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n  />\n</ng-template>\n\n<!-- Which of the three the wrappers below draw. See `innerControl`. -->\n<ng-template #control>\n  @switch (innerControl()) {\n    @case ('mask') {\n      <ng-container [ngTemplateOutlet]=\"maskInput\" />\n    }\n    @case ('password') {\n      <ng-container [ngTemplateOutlet]=\"passwordInput\" />\n    }\n    @default {\n      <ng-container [ngTemplateOutlet]=\"plainInput\" />\n    }\n  }\n</ng-template>\n\n@switch (shape()) {\n  @case ('group') {\n    <p-inputgroup>\n      @if (prefixText() !== '') {\n        <p-inputgroup-addon>{{ prefixText() }}</p-inputgroup-addon>\n      } @else if (prefixIcon() !== '') {\n        <p-inputgroup-addon><i [class]=\"prefixIcon()\" aria-hidden=\"true\"></i></p-inputgroup-addon>\n      }\n      <ng-container [ngTemplateOutlet]=\"control\" />\n      @if (suffixText() !== '') {\n        <p-inputgroup-addon>{{ suffixText() }}</p-inputgroup-addon>\n      } @else if (suffixIcon() !== '') {\n        <p-inputgroup-addon><i [class]=\"suffixIcon()\" aria-hidden=\"true\"></i></p-inputgroup-addon>\n      }\n    </p-inputgroup>\n  }\n  @case ('iconfield') {\n    <p-iconfield [iconPosition]=\"iconPosition()\">\n      @if (prefixIcon() !== '') {\n        <p-inputicon [styleClass]=\"prefixIcon()\" />\n      }\n      <ng-container [ngTemplateOutlet]=\"control\" />\n      @if (suffixIcon() !== '') {\n        <p-inputicon [styleClass]=\"suffixIcon()\" />\n      }\n    </p-iconfield>\n  }\n  @default {\n    <ng-container [ngTemplateOutlet]=\"control\" />\n  }\n}\n", styles: ["@charset \"UTF-8\";:host{display:block;min-width:0}:host ::ng-deep input,:host ::ng-deep .p-iconfield,:host ::ng-deep .p-inputmask,:host ::ng-deep .p-password{width:100%}\n"] }]
        }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], blurred: [{ type: i0.Output, args: ["blurred"] }] } });

/**
 * As many fraction digits as the control will hold, for the case where its own rounding must not
 * run before the field's. Twenty is `Intl.NumberFormat`'s ceiling for `minimumFractionDigits` and
 * past the precision a JavaScript number carries, so half-up rounding at it cannot bite.
 */
const FULL_PRECISION_FRACTION_DIGITS = 20;
/**
 * Draws a numeric field.
 *
 * Serves `Number` and `Decimal`, which differ only in the fraction digits and step the registry
 * seeds — not in what they accept, since the backend stores both as strings and this app should
 * not invent a constraint the contract does not state.
 *
 * `min`, `max` and `step` are passed through as-is: PrimeNG's own inputs are typed
 * `number | null | undefined`, so the config's nulls mean "no bound" without translation. Only
 * the fraction digits and `size` need mapping, since those are `undefined`-shaped there and
 * `null`-shaped here.
 *
 * The two negative-value settings are the exception to that pass-through, because `p-inputnumber`
 * has neither: red is a class on this host, and the accounting brackets are an overlay drawn while
 * the control is not focused. See `showsParenthesised`.
 */
class NumberFieldInputComponent {
    config = input.required(...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    /** Fires once the user leaves the control, *after* the field's rounding rule has been applied —
        see {@link onBlur}. Enter also rounds, but does not emit: the caret is still in the box. */
    blurred = output();
    inputId = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    /** `number | undefined` on `p-inputnumber`, where this config uses null for "leave it to the
        locale". */
    minFractionDigits = computed(() => this.config().minFractionDigits ?? undefined, ...(ngDevMode ? [{ debugName: "minFractionDigits" }] : /* istanbul ignore next */ []));
    /**
     * The fraction digits the *control* is given — not the config's, while a rounding rule is set.
     *
     * `p-inputnumber` passes this to `Intl.NumberFormat` and parses the typed text back through it,
     * so the cap is not display-only: the value it emits has already been rounded **half-up** at
     * that precision, and at zero it refuses the decimal separator altogether. Leaving the cap in
     * place therefore left `applyRounding` nothing to round — `Math.ceil` of a value Intl had
     * already rounded is that same value, so `2.4` stayed `2` and only `2.5` and up ever moved.
     * That is not the rule the field is configured for.
     *
     * So while a rule is active the control keeps every digit typed, and the precision is imposed
     * once, on blur, by the rule itself.
     *
     * `FULL_PRECISION_FRACTION_DIGITS` rather than `undefined`: left unset, `Intl` applies its own
     * default of three fraction digits for decimal style, so a field configured to round at four
     * places would have a fourth digit no one could type.
     */
    maxFractionDigits = computed(() => {
        const config = this.config();
        return config.roundingRule === 'none'
            ? (config.maxFractionDigits ?? undefined)
            : FULL_PRECISION_FRACTION_DIGITS;
    }, ...(ngDevMode ? [{ debugName: "maxFractionDigits" }] : /* istanbul ignore next */ []));
    /** `''` means "follow the browser", which `p-inputnumber` spells as `undefined`. */
    locale = computed(() => this.config().locale || undefined, ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    primeSize = computed(() => this.config().size || undefined, ...(ngDevMode ? [{ debugName: "primeSize" }] : /* istanbul ignore next */ []));
    /** Zero is not negative, and neither is an empty control — `-0 < 0` is false, which is the
        answer wanted here. */
    isNegative = computed(() => {
        const value = this.value();
        return value !== null && value < 0;
    }, ...(ngDevMode ? [{ debugName: "isNegative" }] : /* istanbul ignore next */ []));
    showsNegativeInRed = computed(() => this.config().showNegativeInRed && this.isNegative(), ...(ngDevMode ? [{ debugName: "showsNegativeInRed" }] : /* istanbul ignore next */ []));
    /** Whether the control has the caret. Tracked only so the accounting form can stand down while
        the number is being edited — see `showsParenthesised`. */
    focused = signal(false, ...(ngDevMode ? [{ debugName: "focused" }] : /* istanbul ignore next */ []));
    /**
     * Whether to draw the accounting form over the control.
     *
     * `p-inputnumber` has no parenthesis format of its own — `Intl.NumberFormat`'s accounting sign
     * belongs to currency style, which this control is not in — so the form is drawn as an overlay
     * rather than configured. Not while focused: what is under the overlay is the editable number,
     * and `(1,234.00)` is not something that can be typed back.
     */
    showsParenthesised = computed(() => this.config().negativeFormat === 'parenthesis' && this.isNegative() && !this.focused(), ...(ngDevMode ? [{ debugName: "showsParenthesised" }] : /* istanbul ignore next */ []));
    /**
     * The value in accounting form, matching what `p-inputnumber` would have drawn.
     *
     * Formatted from the same config members the control is given — locale, grouping and fraction
     * digits — so the overlay cannot disagree with the number beneath it. Prefix and suffix go
     * inside the brackets, which is where accounting puts them: `($1,234.00)`.
     *
     * `Intl.NumberFormat` throws on a fraction-digit range that runs backwards. The config editor
     * rejects one, but a config written by hand or by another client can still hold it, so the
     * plain form is the fallback rather than an exception the renderer cannot recover from.
     */
    parenthesisedValue = computed(() => {
        const config = this.config();
        const value = this.value();
        if (value === null) {
            return '';
        }
        try {
            const body = new Intl.NumberFormat(config.locale || undefined, {
                useGrouping: config.useGrouping,
                minimumFractionDigits: config.minFractionDigits ?? undefined,
                maximumFractionDigits: config.maxFractionDigits ?? undefined,
            }).format(Math.abs(value));
            return `(${config.prefix}${body}${config.suffix})`;
        }
        catch {
            return `(${config.prefix}${Math.abs(value)}${config.suffix})`;
        }
    }, ...(ngDevMode ? [{ debugName: "parenthesisedValue" }] : /* istanbul ignore next */ []));
    setFocused(next) {
        this.focused.set(next);
    }
    /**
     * Leaves the control, applying the field's rounding rule.
     *
     * On blur rather than on every keystroke: rounding as the number is typed rewrites the box under
     * the caret — a `Round up` field with no decimal places would turn `2.4` into `3` before the `4`
     * had settled, and there would be no way to type `2.4` at all on the way to `2.45`.
     */
    onBlur() {
        this.focused.set(false);
        this.commitRounding();
        // After `commitRounding`, never before: a consumer saving on this signal must see the rounded
        // value. Emitting first would persist the number as typed and then round it only in the box,
        // leaving the stored value and the displayed one disagreeing.
        this.blurred.emit();
    }
    /**
     * Rounds on Enter as well as on blur.
     *
     * Without it the rule looks broken to anyone who types a value and reads the box without
     * clicking away — which is how it is naturally tested, and how it was in fact reported. Enter is
     * already "I am done with this field" everywhere else in these forms.
     */
    onKeyDown(event) {
        if (event.key === 'Enter') {
            this.commitRounding();
        }
    }
    commitRounding() {
        const rounded = this.applyRounding(this.value());
        // Guarded so a field with no rule, or a value already at the right precision, does not emit a
        // change and mark the form dirty for nothing.
        if (rounded !== this.value()) {
            this.value.set(rounded);
        }
    }
    /** `p-inputnumber` emits `undefined` as well as null for a cleared control, and the wire value
        for a number is null either way. */
    onValueChange(next) {
        this.value.set(next ?? null);
    }
    /**
     * The value rounded the way the config asks, clamped back into the field's own range.
     *
     * The clamp is not belt-and-braces: rounding `9.4` up in a field capped at `9.5` would otherwise
     * produce `10`, a value the same config declares out of bounds — a setting inventing data its
     * neighbour rejects.
     */
    applyRounding(value) {
        const config = this.config();
        if (value === null || config.roundingRule === 'none') {
            return value;
        }
        const places = config.maxFractionDigits ?? 0;
        const scaled = shiftDecimal(value, places);
        const rounded = config.roundingRule === 'up' ? Math.ceil(scaled) : Math.floor(scaled);
        let result = shiftDecimal(rounded, -places);
        if (config.min !== null && result < config.min) {
            result = config.min;
        }
        if (config.max !== null && result > config.max) {
            result = config.max;
        }
        return result;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: NumberFieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: NumberFieldInputComponent, isStandalone: true, selector: "vcr-number-field-input", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange", blurred: "blurred" }, host: { properties: { "class.number-field-input--negative": "showsNegativeInRed()", "class.number-field-input--parenthesised": "showsParenthesised()" } }, ngImport: i0, template: "<p-inputnumber\n  mode=\"decimal\"\n  [inputId]=\"inputId()\"\n  [ngModel]=\"value()\"\n  [ngModelOptions]=\"{ standalone: true }\"\n  (ngModelChange)=\"onValueChange($event)\"\n  (onFocus)=\"setFocused(true)\"\n  (onBlur)=\"onBlur()\"\n  (onKeyDown)=\"onKeyDown($event)\"\n  [min]=\"config().min\"\n  [max]=\"config().max\"\n  [step]=\"config().step\"\n  [showButtons]=\"config().showButtons\"\n  [buttonLayout]=\"config().buttonLayout\"\n  [useGrouping]=\"config().useGrouping\"\n  [minFractionDigits]=\"minFractionDigits()\"\n  [maxFractionDigits]=\"maxFractionDigits()\"\n  [prefix]=\"config().prefix\"\n  [suffix]=\"config().suffix\"\n  [placeholder]=\"config().placeholder\"\n  [showClear]=\"config().showClear\"\n  [allowEmpty]=\"config().allowEmpty\"\n  [locale]=\"locale()\"\n  [required]=\"required()\"\n  [disabled]=\"disabled()\"\n  [invalid]=\"invalid()\"\n  [size]=\"primeSize()\"\n/>\n\n@if (showsParenthesised()) {\n  <!-- Drawn over the control rather than instead of it, so focus, tab order and the value the\n       screen reader announces all stay with the real input \u2014 which is hidden underneath by the\n       stylesheet, not unmounted. `aria-hidden` and `pointer-events: none` keep this from being a\n       second thing to read or to click. -->\n  <span class=\"number-field-input__accounting\" aria-hidden=\"true\">{{ parenthesisedValue() }}</span>\n}\n", styles: ["@charset \"UTF-8\";:host{display:block;position:relative;min-width:0}:host ::ng-deep .p-inputnumber,:host ::ng-deep input{width:100%}:host(.number-field-input--negative) ::ng-deep input{color:var(--error-color)}:host(.number-field-input--parenthesised) ::ng-deep input{color:transparent}.number-field-input__accounting{position:absolute;inset:0;display:flex;align-items:center;padding-inline:var(--p-inputtext-padding-x, .75rem);color:var(--content-color);font:inherit;pointer-events:none;overflow:hidden;white-space:nowrap}:host(.number-field-input--negative) .number-field-input__accounting{color:var(--error-color)}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: InputNumber, selector: "p-inputNumber, p-inputnumber, p-input-number", inputs: ["showButtons", "format", "buttonLayout", "inputId", "styleClass", "placeholder", "tabindex", "title", "ariaLabelledBy", "ariaDescribedBy", "ariaLabel", "ariaRequired", "autocomplete", "incrementButtonClass", "decrementButtonClass", "incrementButtonIcon", "decrementButtonIcon", "readonly", "allowEmpty", "locale", "localeMatcher", "mode", "currency", "currencyDisplay", "useGrouping", "minFractionDigits", "maxFractionDigits", "prefix", "suffix", "inputStyle", "inputStyleClass", "showClear", "autofocus"], outputs: ["onInput", "onFocus", "onBlur", "onKeyDown", "onClear"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: NumberFieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-number-field-input', standalone: true, imports: [FormsModule, InputNumber], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class.number-field-input--negative]': 'showsNegativeInRed()',
                        '[class.number-field-input--parenthesised]': 'showsParenthesised()',
                    }, template: "<p-inputnumber\n  mode=\"decimal\"\n  [inputId]=\"inputId()\"\n  [ngModel]=\"value()\"\n  [ngModelOptions]=\"{ standalone: true }\"\n  (ngModelChange)=\"onValueChange($event)\"\n  (onFocus)=\"setFocused(true)\"\n  (onBlur)=\"onBlur()\"\n  (onKeyDown)=\"onKeyDown($event)\"\n  [min]=\"config().min\"\n  [max]=\"config().max\"\n  [step]=\"config().step\"\n  [showButtons]=\"config().showButtons\"\n  [buttonLayout]=\"config().buttonLayout\"\n  [useGrouping]=\"config().useGrouping\"\n  [minFractionDigits]=\"minFractionDigits()\"\n  [maxFractionDigits]=\"maxFractionDigits()\"\n  [prefix]=\"config().prefix\"\n  [suffix]=\"config().suffix\"\n  [placeholder]=\"config().placeholder\"\n  [showClear]=\"config().showClear\"\n  [allowEmpty]=\"config().allowEmpty\"\n  [locale]=\"locale()\"\n  [required]=\"required()\"\n  [disabled]=\"disabled()\"\n  [invalid]=\"invalid()\"\n  [size]=\"primeSize()\"\n/>\n\n@if (showsParenthesised()) {\n  <!-- Drawn over the control rather than instead of it, so focus, tab order and the value the\n       screen reader announces all stay with the real input \u2014 which is hidden underneath by the\n       stylesheet, not unmounted. `aria-hidden` and `pointer-events: none` keep this from being a\n       second thing to read or to click. -->\n  <span class=\"number-field-input__accounting\" aria-hidden=\"true\">{{ parenthesisedValue() }}</span>\n}\n", styles: ["@charset \"UTF-8\";:host{display:block;position:relative;min-width:0}:host ::ng-deep .p-inputnumber,:host ::ng-deep input{width:100%}:host(.number-field-input--negative) ::ng-deep input{color:var(--error-color)}:host(.number-field-input--parenthesised) ::ng-deep input{color:transparent}.number-field-input__accounting{position:absolute;inset:0;display:flex;align-items:center;padding-inline:var(--p-inputtext-padding-x, .75rem);color:var(--content-color);font:inherit;pointer-events:none;overflow:hidden;white-space:nowrap}:host(.number-field-input--negative) .number-field-input__accounting{color:var(--error-color)}\n"] }]
        }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], blurred: [{ type: i0.Output, args: ["blurred"] }] } });
/**
 * `value` with its decimal point moved `places` to the right, without the error a multiply brings.
 *
 * `0.07 * 100` is `7.000000000000001` in binary floating point, and `Math.ceil` of that is `8` — so
 * the obvious implementation rounds an already-exact `0.07` up to `0.08`, and every "why did it
 * add a cent" bug follows from there. It is not a rare corner either: sweeping `0.001` to `200`
 * at nought to three decimal places, the multiply disagrees with this on 2611 values.
 *
 * Moving the exponent in the decimal-string form leaves the digits alone, so only the rounding
 * step can change the value.
 */
function shiftDecimal(value, places) {
    if (places === 0 || !Number.isFinite(value)) {
        return value;
    }
    const [mantissa, exponent] = value.toExponential().split('e');
    return Number(`${mantissa}e${Number(exponent) + places}`);
}

/**
 * Draws a checkbox field — one box, or a group of them.
 *
 * Which it draws comes from `CheckboxFieldConfig.checkboxType`, since `Checkbox` is a single field
 * type an author flips between modes rather than two types to choose between. The two markups
 * share nothing but the element, so the template branches once at the top rather than trying to
 * parameterise one into the other.
 *
 * ## The tri-state cycle (`'single'`)
 *
 * PrimeNG 21 has no `TriStateCheckbox`, so the third state is built here. The box is bound as an
 * ordinary binary one and its emitted boolean is **ignored**: {@link onSingleChange} advances this
 * renderer's own `null -> true -> false -> null` cycle instead, and `indeterminate` is bound back
 * from the value. That works because the bound value genuinely changes at each step — `Checkbox`
 * clears its internal indeterminate flag on the first click and re-reads the input only when it
 * changes, which every step of the cycle does.
 *
 * ## The array model (`'group'`)
 *
 * Each box is a `p-checkbox` in its **non-binary** mode, where PrimeNG treats the bound model as
 * the list of ticked values and adds to or filters it on each click. That is why
 * {@link groupValue} never yields null: the filter runs against the current model before anything
 * else, so a null would throw rather than begin a fresh selection.
 */
class CheckboxFieldInputComponent {
    config = input.required(...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    isGroup = computed(() => this.config().checkboxType === 'group', ...(ngDevMode ? [{ debugName: "isGroup" }] : /* istanbul ignore next */ []));
    /** The control's `id` in single mode, and the stem of each box's id in group mode. */
    inputId = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    primeSize = computed(() => this.config().size || undefined, ...(ngDevMode ? [{ debugName: "primeSize" }] : /* istanbul ignore next */ []));
    /** The boxes in the order `sortChoices` asks for, in group mode. Only the drawing order changes:
        a stored selection is a set of values and does not depend on it. */
    options = computed(() => sortChoiceOptions(this.config().options, this.config().sortChoices), ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    /**
     * The value read as this mode expects it.
     *
     * Both narrow defensively rather than casting. The facade always decodes through the codec, so
     * the shape should match the mode — but an author flipping `checkboxType` changes what the
     * config means without changing what is stored, and a renderer that threw on that would take the
     * config form down with it.
     */
    singleValue = computed(() => {
        const current = this.value();
        return typeof current === 'boolean' ? current : null;
    }, ...(ngDevMode ? [{ debugName: "singleValue" }] : /* istanbul ignore next */ []));
    groupValue = computed(() => {
        const current = this.value();
        return Array.isArray(current) ? current : [];
    }, ...(ngDevMode ? [{ debugName: "groupValue" }] : /* istanbul ignore next */ []));
    isChecked = computed(() => this.singleValue() === true, ...(ngDevMode ? [{ debugName: "isChecked" }] : /* istanbul ignore next */ []));
    /** Only ever true on a tri-state single box: a group has no third state to show. */
    isIndeterminate = computed(() => !this.isGroup() && this.config().triState && this.singleValue() === null, ...(ngDevMode ? [{ debugName: "isIndeterminate" }] : /* istanbul ignore next */ []));
    checkboxIcon = computed(() => this.config().checkboxIcon || undefined, ...(ngDevMode ? [{ debugName: "checkboxIcon" }] : /* istanbul ignore next */ []));
    /**
     * Whether the selection breaks the configured bounds, in group mode.
     *
     * Shown rather than enforced — the bounds are advisory (see `CheckboxFieldConfig`), and a control
     * that silently refused a click would be a worse way to say so than a message.
     */
    boundsError = computed(() => {
        if (!this.isGroup()) {
            return '';
        }
        const { minSelected, maxSelected } = this.config();
        const count = this.groupValue().length;
        if (minSelected > 0 && count < minSelected) {
            return `Choose at least ${minSelected}.`;
        }
        if (maxSelected > 0 && count > maxSelected) {
            return `Choose no more than ${maxSelected}.`;
        }
        return '';
    }, ...(ngDevMode ? [{ debugName: "boundsError" }] : /* istanbul ignore next */ []));
    optionId(value) {
        return `${this.inputId()}-${value}`;
    }
    /**
     * Advances the single box's value.
     *
     * The event is deliberately unused. For a tri-state field the checkbox can only report two
     * states, so its boolean would collapse the cycle; for a binary one the cycle below reduces to
     * the same two values anyway, so one path serves both and there is no branch to get wrong.
     */
    onSingleChange() {
        const current = this.singleValue();
        if (this.config().triState) {
            this.value.set(current === null ? true : current ? false : null);
            return;
        }
        this.value.set(current !== true);
    }
    /** PrimeNG hands back the new array; the empty list is what "nothing ticked" means. */
    onGroupChange(next) {
        this.value.set(next ?? []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: CheckboxFieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: CheckboxFieldInputComponent, isStandalone: true, selector: "vcr-checkbox-field-input", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, ngImport: i0, template: "@if (isGroup()) {\n  @if (options().length === 0) {\n    <!-- Only reachable through a hand-edited config: the editor requires at least one option in\n         this mode, and the host's submit guard blocks a save without one. -->\n    <p class=\"checkbox-field__empty\">This field has no options to choose from yet.</p>\n  } @else {\n    <div\n      class=\"checkbox-field__options\"\n      [class.checkbox-field__options--horizontal]=\"config().orientation === 'horizontal'\"\n      role=\"group\"\n      [attr.aria-label]=\"inputId()\"\n    >\n      @for (option of options(); track option.value) {\n        <div class=\"checkbox-field__option\">\n          <p-checkbox\n            [inputId]=\"optionId(option.value)\"\n            [name]=\"inputId()\"\n            [value]=\"option.value\"\n            [ngModel]=\"groupValue()\"\n            [ngModelOptions]=\"{ standalone: true }\"\n            (ngModelChange)=\"onGroupChange($event)\"\n            [required]=\"required()\"\n            [disabled]=\"disabled()\"\n            [invalid]=\"invalid() || boundsError() !== ''\"\n            [size]=\"primeSize()\"\n          />\n          <label class=\"checkbox-field__label\" [attr.for]=\"optionId(option.value)\">\n            {{ option.label }}\n          </label>\n        </div>\n      }\n    </div>\n\n    @if (boundsError() !== '') {\n      <small class=\"checkbox-field__hint\">{{ boundsError() }}</small>\n    }\n  }\n} @else {\n  <div\n    class=\"checkbox-field__row\"\n    [class.checkbox-field__row--label-left]=\"config().labelPosition === 'left'\"\n  >\n    <p-checkbox\n      [inputId]=\"inputId()\"\n      [binary]=\"true\"\n      [ngModel]=\"isChecked()\"\n      [ngModelOptions]=\"{ standalone: true }\"\n      (ngModelChange)=\"onSingleChange()\"\n      [indeterminate]=\"isIndeterminate()\"\n      [checkboxIcon]=\"checkboxIcon()\"\n      [readonly]=\"config().readonly\"\n      [required]=\"required()\"\n      [disabled]=\"disabled()\"\n      [invalid]=\"invalid()\"\n      [size]=\"primeSize()\"\n    />\n\n    @if (config().label !== '') {\n      <label class=\"checkbox-field__label\" [attr.for]=\"inputId()\">{{ config().label }}</label>\n    }\n  </div>\n\n  @if (config().triState && singleValue() === null) {\n    <small class=\"checkbox-field__note\">\n      Not set \u2014 click to cycle through yes, no and not set.\n    </small>\n  }\n}\n", styles: ["@charset \"UTF-8\";:host{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0}.checkbox-field__row{display:flex;flex-direction:row;align-items:center;gap:8px}.checkbox-field__row--label-left{flex-direction:row-reverse;justify-content:flex-end}.checkbox-field__options{display:flex;flex-direction:column;gap:8px}.checkbox-field__options--horizontal{flex-direction:row;flex-wrap:wrap;gap:16px}.checkbox-field__option{display:flex;flex-direction:row;align-items:center;gap:8px}.checkbox-field__label{color:var(--content-color);font-size:13px;cursor:pointer}.checkbox-field__note{color:var(--surface-500);font-size:12px}.checkbox-field__hint{color:var(--error-color);font-size:12px}.checkbox-field__empty{margin:0;padding:16px;border:1px dashed var(--content-border-color);border-radius:var(--border-radius-sm);color:var(--surface-500);font-size:13px}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: Checkbox, selector: "p-checkbox, p-checkBox, p-check-box", inputs: ["hostName", "value", "binary", "ariaLabelledBy", "ariaLabel", "tabindex", "inputId", "inputStyle", "styleClass", "inputClass", "indeterminate", "formControl", "checkboxIcon", "readonly", "autofocus", "trueValue", "falseValue", "variant", "size"], outputs: ["onChange", "onFocus", "onBlur"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: CheckboxFieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-checkbox-field-input', standalone: true, imports: [FormsModule, Checkbox], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (isGroup()) {\n  @if (options().length === 0) {\n    <!-- Only reachable through a hand-edited config: the editor requires at least one option in\n         this mode, and the host's submit guard blocks a save without one. -->\n    <p class=\"checkbox-field__empty\">This field has no options to choose from yet.</p>\n  } @else {\n    <div\n      class=\"checkbox-field__options\"\n      [class.checkbox-field__options--horizontal]=\"config().orientation === 'horizontal'\"\n      role=\"group\"\n      [attr.aria-label]=\"inputId()\"\n    >\n      @for (option of options(); track option.value) {\n        <div class=\"checkbox-field__option\">\n          <p-checkbox\n            [inputId]=\"optionId(option.value)\"\n            [name]=\"inputId()\"\n            [value]=\"option.value\"\n            [ngModel]=\"groupValue()\"\n            [ngModelOptions]=\"{ standalone: true }\"\n            (ngModelChange)=\"onGroupChange($event)\"\n            [required]=\"required()\"\n            [disabled]=\"disabled()\"\n            [invalid]=\"invalid() || boundsError() !== ''\"\n            [size]=\"primeSize()\"\n          />\n          <label class=\"checkbox-field__label\" [attr.for]=\"optionId(option.value)\">\n            {{ option.label }}\n          </label>\n        </div>\n      }\n    </div>\n\n    @if (boundsError() !== '') {\n      <small class=\"checkbox-field__hint\">{{ boundsError() }}</small>\n    }\n  }\n} @else {\n  <div\n    class=\"checkbox-field__row\"\n    [class.checkbox-field__row--label-left]=\"config().labelPosition === 'left'\"\n  >\n    <p-checkbox\n      [inputId]=\"inputId()\"\n      [binary]=\"true\"\n      [ngModel]=\"isChecked()\"\n      [ngModelOptions]=\"{ standalone: true }\"\n      (ngModelChange)=\"onSingleChange()\"\n      [indeterminate]=\"isIndeterminate()\"\n      [checkboxIcon]=\"checkboxIcon()\"\n      [readonly]=\"config().readonly\"\n      [required]=\"required()\"\n      [disabled]=\"disabled()\"\n      [invalid]=\"invalid()\"\n      [size]=\"primeSize()\"\n    />\n\n    @if (config().label !== '') {\n      <label class=\"checkbox-field__label\" [attr.for]=\"inputId()\">{{ config().label }}</label>\n    }\n  </div>\n\n  @if (config().triState && singleValue() === null) {\n    <small class=\"checkbox-field__note\">\n      Not set \u2014 click to cycle through yes, no and not set.\n    </small>\n  }\n}\n", styles: ["@charset \"UTF-8\";:host{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0}.checkbox-field__row{display:flex;flex-direction:row;align-items:center;gap:8px}.checkbox-field__row--label-left{flex-direction:row-reverse;justify-content:flex-end}.checkbox-field__options{display:flex;flex-direction:column;gap:8px}.checkbox-field__options--horizontal{flex-direction:row;flex-wrap:wrap;gap:16px}.checkbox-field__option{display:flex;flex-direction:row;align-items:center;gap:8px}.checkbox-field__label{color:var(--content-color);font-size:13px;cursor:pointer}.checkbox-field__note{color:var(--surface-500);font-size:12px}.checkbox-field__hint{color:var(--error-color);font-size:12px}.checkbox-field__empty{margin:0;padding:16px;border:1px dashed var(--content-border-color);border-radius:var(--border-radius-sm);color:var(--surface-500);font-size:13px}\n"] }]
        }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }] } });

/**
 * Draws a group of radio buttons, for the `RadioButton` type.
 *
 * `[name]` is bound to the field key on every button so two radio groups on one page — a
 * realistic arrangement on the page-content screen — do not share browser-level exclusivity and
 * silently deselect each other.
 *
 * The Clear button exists because radio buttons have no native way to deselect: without it a user
 * who picks a value by mistake cannot undo it, and the field goes from empty to permanently
 * answered on the first click. Offered only when `allowClear` is set — see `RadioFieldConfig`.
 */
class RadioFieldInputComponent {
    config = input.required(...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    /** The group's shared `name`, and the stem of each button's own id. */
    groupName = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "groupName" }] : /* istanbul ignore next */ []));
    /** The choices in the order `sortChoices` asks for. Computed rather than sorted in the template,
        so the array identity only changes when the config does. */
    options = computed(() => sortChoiceOptions(this.config().options, this.config().sortChoices), ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    primeSize = computed(() => this.config().size || undefined, ...(ngDevMode ? [{ debugName: "primeSize" }] : /* istanbul ignore next */ []));
    canClear = computed(() => this.config().allowClear && this.value() !== null, ...(ngDevMode ? [{ debugName: "canClear" }] : /* istanbul ignore next */ []));
    optionId(value) {
        return `${this.groupName()}-${value}`;
    }
    onValueChange(next) {
        this.value.set(next ?? null);
    }
    clear() {
        this.value.set(null);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: RadioFieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: RadioFieldInputComponent, isStandalone: true, selector: "vcr-radio-field-input", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, ngImport: i0, template: "@if (options().length === 0) {\n  <!-- Only reachable through a hand-edited config: the config editor requires at least one\n       option, and the host's submit guard blocks a save without one. -->\n  <p class=\"radio-field__empty\">This field has no options to choose from yet.</p>\n} @else {\n  <div\n    class=\"radio-field__options\"\n    [class.radio-field__options--horizontal]=\"config().orientation === 'horizontal'\"\n    role=\"radiogroup\"\n    [attr.aria-label]=\"groupName()\"\n  >\n    @for (option of options(); track option.value) {\n      <div class=\"radio-field__option\">\n        <p-radiobutton\n          [inputId]=\"optionId(option.value)\"\n          [name]=\"groupName()\"\n          [value]=\"option.value\"\n          [ngModel]=\"value()\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (ngModelChange)=\"onValueChange($event)\"\n          [required]=\"required()\"\n          [disabled]=\"disabled()\"\n          [invalid]=\"invalid()\"\n          [size]=\"primeSize()\"\n        />\n        <label class=\"radio-field__label\" [attr.for]=\"optionId(option.value)\">\n          {{ option.label }}\n        </label>\n      </div>\n    }\n  </div>\n\n  @if (canClear()) {\n    <p-button\n      label=\"Clear\"\n      icon=\"pi pi-times\"\n      severity=\"secondary\"\n      [text]=\"true\"\n      type=\"button\"\n      [disabled]=\"disabled()\"\n      (onClick)=\"clear()\"\n    />\n  }\n}\n", styles: [":host{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-width:0}.radio-field__options{display:flex;flex-direction:column;gap:8px}.radio-field__options--horizontal{flex-direction:row;flex-wrap:wrap;gap:16px}.radio-field__option{display:flex;flex-direction:row;align-items:center;gap:8px}.radio-field__label{color:var(--content-color);font-size:13px;cursor:pointer}.radio-field__empty{margin:0;padding:16px;border:1px dashed var(--content-border-color);border-radius:var(--border-radius-sm);color:var(--surface-500);font-size:13px}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "component", type: i2.Button, selector: "p-button", inputs: ["hostName", "type", "badge", "disabled", "raised", "rounded", "text", "plain", "outlined", "link", "tabindex", "size", "variant", "style", "styleClass", "badgeClass", "badgeSeverity", "ariaLabel", "autofocus", "iconPos", "icon", "label", "loading", "loadingIcon", "severity", "buttonProps", "fluid"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: RadioButton, selector: "p-radioButton, p-radiobutton, p-radio-button", inputs: ["value", "tabindex", "inputId", "ariaLabelledBy", "ariaLabel", "styleClass", "autofocus", "binary", "variant", "size"], outputs: ["onClick", "onFocus", "onBlur"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: RadioFieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-radio-field-input', standalone: true, imports: [FormsModule, ButtonModule, RadioButton], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (options().length === 0) {\n  <!-- Only reachable through a hand-edited config: the config editor requires at least one\n       option, and the host's submit guard blocks a save without one. -->\n  <p class=\"radio-field__empty\">This field has no options to choose from yet.</p>\n} @else {\n  <div\n    class=\"radio-field__options\"\n    [class.radio-field__options--horizontal]=\"config().orientation === 'horizontal'\"\n    role=\"radiogroup\"\n    [attr.aria-label]=\"groupName()\"\n  >\n    @for (option of options(); track option.value) {\n      <div class=\"radio-field__option\">\n        <p-radiobutton\n          [inputId]=\"optionId(option.value)\"\n          [name]=\"groupName()\"\n          [value]=\"option.value\"\n          [ngModel]=\"value()\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (ngModelChange)=\"onValueChange($event)\"\n          [required]=\"required()\"\n          [disabled]=\"disabled()\"\n          [invalid]=\"invalid()\"\n          [size]=\"primeSize()\"\n        />\n        <label class=\"radio-field__label\" [attr.for]=\"optionId(option.value)\">\n          {{ option.label }}\n        </label>\n      </div>\n    }\n  </div>\n\n  @if (canClear()) {\n    <p-button\n      label=\"Clear\"\n      icon=\"pi pi-times\"\n      severity=\"secondary\"\n      [text]=\"true\"\n      type=\"button\"\n      [disabled]=\"disabled()\"\n      (onClick)=\"clear()\"\n    />\n  }\n}\n", styles: [":host{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-width:0}.radio-field__options{display:flex;flex-direction:column;gap:8px}.radio-field__options--horizontal{flex-direction:row;flex-wrap:wrap;gap:16px}.radio-field__option{display:flex;flex-direction:row;align-items:center;gap:8px}.radio-field__label{color:var(--content-color);font-size:13px;cursor:pointer}.radio-field__empty{margin:0;padding:16px;border:1px dashed var(--content-border-color);border-radius:var(--border-radius-sm);color:var(--surface-500);font-size:13px}\n"] }]
        }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }] } });

/**
 * Draws a dropdown, for the `Dropdown` type — `p-select` for one pick, `p-multiselect` for many.
 *
 * The options-based counterpart to `RadioFieldInputComponent`, for the lists radio buttons cannot
 * carry: fifty countries drawn as fifty radio buttons is the case this exists for. Which of the
 * two controls is drawn is `SelectFieldConfig.selectionMode`, and because the two hold different
 * *shapes* of value the codec in `selectFieldRenderer` reads that member too.
 *
 * No Clear button of its own, unlike the radio renderer: both controls have a native clear icon,
 * offered by `SelectFieldConfig.showClear`.
 */
class SelectFieldInputComponent {
    config = input.required(...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    /** The control's own id, so the facade's `<label for>` points at it. Same derivation as every
        other renderer of a single control. */
    inputId = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    /**
     * The choices in the order `sortChoices` asks for.
     *
     * Computed rather than sorted in the template, so the array identity only changes when the
     * config does — a fresh array per read would be a new input value on every change-detection
     * pass, which for an `OnPush` child is an endless re-render.
     *
     * Copied because `sortChoiceOptions` answers `readonly`, which both PrimeNG controls reject:
     * their `options` input is a mutable `any[]`. The copy costs nothing here since the `computed`
     * memoises it, and it is the honest place to drop the guarantee — `RadioFieldInputComponent`
     * never needs to, because it iterates the array itself rather than handing it to a control.
     */
    options = computed(() => [
        ...sortChoiceOptions(this.config().options, this.config().sortChoices),
    ], ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    isMultiple = computed(() => this.config().selectionMode === 'multiple', ...(ngDevMode ? [{ debugName: "isMultiple" }] : /* istanbul ignore next */ []));
    primeSize = computed(() => this.config().size || undefined, ...(ngDevMode ? [{ debugName: "primeSize" }] : /* istanbul ignore next */ []));
    /** `''` means "leave PrimeNG's own default", which an empty string would instead overwrite with
        a blank. Same translation `primeSize` makes. */
    placeholder = computed(() => this.config().placeholder || undefined, ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    filterPlaceholder = computed(() => this.config().filterPlaceholder || undefined, ...(ngDevMode ? [{ debugName: "filterPlaceholder" }] : /* istanbul ignore next */ []));
    /** The `'single'` value, ignoring an array left by a mode switch under stored data. */
    singleValue = computed(() => {
        const value = this.value();
        return typeof value === 'string' ? value : null;
    }, ...(ngDevMode ? [{ debugName: "singleValue" }] : /* istanbul ignore next */ []));
    /**
     * The `'multiple'` value — **never null**.
     *
     * `p-multiselect` derives its next value as `modelValue().filter(...)`, so deselecting an option
     * against a null model throws. The empty array is the honest reading of "nothing picked" here
     * anyway, exactly as it is for the checkbox group.
     *
     * The array is passed through rather than copied: the control builds a fresh array on every
     * change (`filter`, or a spread) and never writes into the one it was given, so sharing the
     * reference with `FieldInputComponent.decoded` cannot corrupt that computed's cached value.
     */
    multipleValue = computed(() => {
        const value = this.value();
        return Array.isArray(value) ? value : [];
    }, ...(ngDevMode ? [{ debugName: "multipleValue" }] : /* istanbul ignore next */ []));
    onSingleChange(next) {
        this.value.set(next ?? null);
    }
    onMultipleChange(next) {
        this.value.set(next ?? []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: SelectFieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: SelectFieldInputComponent, isStandalone: true, selector: "vcr-select-field-input", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, ngImport: i0, template: "@if (options().length === 0) {\n  <!-- Only reachable through a hand-edited config: the config editor requires at least one\n       option, and the host's submit guard blocks a save without one. -->\n  <p class=\"select-field__empty\">This field has no options to choose from yet.</p>\n} @else if (isMultiple()) {\n  <!-- `filterPlaceHolder` is PrimeNG's own spelling on this component \u2014 `p-select` below takes\n       the same setting as `filterPlaceholder`. -->\n  <p-multiselect\n    [inputId]=\"inputId()\"\n    [options]=\"options()\"\n    optionLabel=\"label\"\n    optionValue=\"value\"\n    [ngModel]=\"multipleValue()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onMultipleChange($event)\"\n    [placeholder]=\"placeholder()\"\n    [showClear]=\"config().showClear\"\n    [filter]=\"config().filter\"\n    [filterPlaceHolder]=\"filterPlaceholder()\"\n    [highlightOnSelect]=\"config().highlightOnSelect\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n    appendTo=\"body\"\n  />\n} @else {\n  <p-select\n    [inputId]=\"inputId()\"\n    [options]=\"options()\"\n    optionLabel=\"label\"\n    optionValue=\"value\"\n    [ngModel]=\"singleValue()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onSingleChange($event)\"\n    [placeholder]=\"placeholder()\"\n    [showClear]=\"config().showClear\"\n    [filter]=\"config().filter\"\n    [filterPlaceholder]=\"filterPlaceholder()\"\n    [checkmark]=\"config().checkmark\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n    appendTo=\"body\"\n  />\n}\n", styles: [":host{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0}p-select,p-multiselect{width:100%;min-width:0}.select-field__empty{margin:0;padding:16px;border:1px dashed var(--content-border-color);border-radius:var(--border-radius-sm);color:var(--surface-500);font-size:13px}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: MultiSelect, selector: "p-multiSelect, p-multiselect, p-multi-select", inputs: ["id", "ariaLabel", "styleClass", "panelStyle", "panelStyleClass", "inputId", "readonly", "group", "filter", "filterPlaceHolder", "filterLocale", "overlayVisible", "tabindex", "dataKey", "ariaLabelledBy", "displaySelectedLabel", "maxSelectedLabels", "selectionLimit", "selectedItemsLabel", "showToggleAll", "emptyFilterMessage", "emptyMessage", "resetFilterOnHide", "dropdownIcon", "chipIcon", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "showHeader", "filterBy", "scrollHeight", "lazy", "virtualScroll", "loading", "virtualScrollItemSize", "loadingIcon", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "filterMatchMode", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "autofocusFilter", "display", "autocomplete", "showClear", "autofocus", "placeholder", "options", "filterValue", "selectAll", "focusOnHover", "filterFields", "selectOnFocus", "autoOptionFocus", "highlightOnSelect", "size", "variant", "fluid", "appendTo", "motionOptions"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onClear", "onPanelShow", "onPanelHide", "onLazyLoad", "onRemove", "onSelectAllChange"] }, { kind: "component", type: Select, selector: "p-select", inputs: ["id", "scrollHeight", "filter", "panelStyle", "styleClass", "panelStyleClass", "readonly", "editable", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "filterValue", "options", "appendTo", "motionOptions"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: SelectFieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-select-field-input', standalone: true, imports: [FormsModule, MultiSelect, Select], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (options().length === 0) {\n  <!-- Only reachable through a hand-edited config: the config editor requires at least one\n       option, and the host's submit guard blocks a save without one. -->\n  <p class=\"select-field__empty\">This field has no options to choose from yet.</p>\n} @else if (isMultiple()) {\n  <!-- `filterPlaceHolder` is PrimeNG's own spelling on this component \u2014 `p-select` below takes\n       the same setting as `filterPlaceholder`. -->\n  <p-multiselect\n    [inputId]=\"inputId()\"\n    [options]=\"options()\"\n    optionLabel=\"label\"\n    optionValue=\"value\"\n    [ngModel]=\"multipleValue()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onMultipleChange($event)\"\n    [placeholder]=\"placeholder()\"\n    [showClear]=\"config().showClear\"\n    [filter]=\"config().filter\"\n    [filterPlaceHolder]=\"filterPlaceholder()\"\n    [highlightOnSelect]=\"config().highlightOnSelect\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n    appendTo=\"body\"\n  />\n} @else {\n  <p-select\n    [inputId]=\"inputId()\"\n    [options]=\"options()\"\n    optionLabel=\"label\"\n    optionValue=\"value\"\n    [ngModel]=\"singleValue()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"onSingleChange($event)\"\n    [placeholder]=\"placeholder()\"\n    [showClear]=\"config().showClear\"\n    [filter]=\"config().filter\"\n    [filterPlaceholder]=\"filterPlaceholder()\"\n    [checkmark]=\"config().checkmark\"\n    [required]=\"required()\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n    [size]=\"primeSize()\"\n    appendTo=\"body\"\n  />\n}\n", styles: [":host{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0}p-select,p-multiselect{width:100%;min-width:0}.select-field__empty{margin:0;padding:16px;border:1px dashed var(--content-border-color);border-radius:var(--border-radius-sm);color:var(--surface-500);font-size:13px}\n"] }]
        }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }] } });

/**
 * Draws a date, or a date and time, for the `DatePicker` type — `showTime` decides which.
 *
 * `appendTo="body"` because this renderer is used inside `p-dialog` on the page-content screen,
 * where an in-flow overlay would be clipped by the dialog — the same binding every `p-select` in
 * this app uses.
 *
 * Note there is no locale setting: `p-datepicker` has no `locale` input, and month and day names
 * come from PrimeNG's global translation, which `app.config.ts` does not configure. The config
 * editor deliberately does not offer one.
 */
class DateFieldInputComponent {
    config = input.required(...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    inputId = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    /** Whether the caret is in the picker's own text input. See {@link displayValue}. */
    editing = signal(false, ...(ngDevMode ? [{ debugName: "editing" }] : /* istanbul ignore next */ []));
    /** The picker itself, so {@link onTextInput} can correct the value it parsed. */
    picker = viewChild(DatePicker, ...(ngDevMode ? [{ debugName: "picker" }] : /* istanbul ignore next */ []));
    /** Whether the configured format names a day, and so is one `p-datepicker` can parse back from
        typed text on its own. See {@link onTextInput}. */
    namesDay = computed(() => dateFormatNamesDay(this.config().dateFormat), ...(ngDevMode ? [{ debugName: "namesDay" }] : /* istanbul ignore next */ []));
    /**
     * What `p-datepicker` is actually bound to: {@link value}, except while the user is typing.
     *
     * ## The problem this solves
     *
     * `p-datepicker` re-renders its input from the model on *every* write it receives —
     * `writeControlValue` calls `updateInputfield()` unconditionally — and it parses what has been
     * typed on every keystroke, pushing the result out through `ngModelChange`. Binding `value()`
     * straight back in therefore feeds the user's own half-typed date back at them, reformatted.
     *
     * Typing a four-digit year is where that bites. At `12/25/20` the picker parses a real date in
     * the year 20, emits it, and the echo repaints the input as `12/25/0020` — moving the caret and
     * leaving the remaining `26` to land in the middle of a year the user never typed. Whatever that
     * produces is then parsed on blur, where `onInputBlur` repaints the input from the model one last
     * time and the value appears to have been erased.
     *
     * ## Why holding the value back is the fix
     *
     * The picker keeps its own parse of the text while it is focused, so suppressing the echo costs
     * nothing: `ngModelChange` still fires on every keystroke and {@link value} still tracks it, so
     * the wire value is never stale. Only the *input's text* is left alone, which is the one thing
     * the user is editing.
     *
     * Re-synced on blur so a value the field itself normalises — or one changed from elsewhere while
     * the input happened to be focused — still reaches the control.
     */
    displayValue = signal(null, ...(ngDevMode ? [{ debugName: "displayValue" }] : /* istanbul ignore next */ []));
    constructor() {
        // `untracked` on the flag, so this runs for a change to `value` and never merely because focus
        // moved: the blur handler is what re-syncs, and re-running here on focus *change* would repaint
        // the input at the moment the caret arrives in it.
        effect(() => {
            const next = this.value();
            if (untracked(this.editing)) {
                return;
            }
            this.displayValue.set(next);
        });
    }
    onFocus() {
        this.editing.set(true);
    }
    onBlur() {
        this.editing.set(false);
        this.displayValue.set(this.value());
    }
    /**
     * Reads a date the picker's own parser cannot, for the formats that name no day.
     *
     * `p-datepicker` throws on its own `yy` and `MM yy` formats unless `view` is `'year'` — see
     * {@link parseDaylessDate} — and answers a throw by setting its model to null, which is what
     * emptied the field on blur. This runs after that: `onUserInput` emits `onInput` as its last
     * step, so whatever it decided has already happened and can be corrected here.
     *
     * Corrected through the picker's own {@link DatePicker.updateModel} rather than by setting
     * {@link value} directly, because both halves have to agree. `updateModel` sets the control's
     * internal value *and* emits through `ngModelChange`, so the value this renderer publishes and
     * the value the control repaints its input from on blur end up the same date. Writing only ours
     * would leave the control still holding null, and blur would blank the text all over again.
     *
     * It deliberately does not touch the input's text, so the caret stays where the user put it.
     */
    onTextInput(event) {
        if (this.namesDay()) {
            return;
        }
        const picker = this.picker();
        const text = event.target.value;
        const parsed = parseDaylessDate(text, this.config().dateFormat);
        // Null means "not a complete answer yet" — a year still being typed — so the value is left
        // alone rather than cleared. An emptied input is the exception: that is the user removing the
        // value, and the picker has already set it to null itself.
        if (picker === undefined || parsed === null) {
            return;
        }
        picker.updateModel(parsed);
    }
    /**
     * The bounds as `Date`s, or undefined for "no bound".
     *
     * Each edge is the tighter of the two settings that can bound it: the fixed date from
     * `minDate`/`maxDate`, and today from `dateLimit`. They narrow rather than override — a field
     * limited to future dates and also bounded at `2027-01-01` means both, and taking whichever was
     * set last would silently let one of the two through.
     *
     * Computed rather than built inline so the identity is stable across change-detection passes —
     * a fresh `Date` per read would be a new input value every pass, and `p-datepicker` re-renders
     * its whole panel when `minDate` changes. That also fixes "today" for as long as the config is
     * unchanged, which is what a calendar left open across midnight should do.
     */
    minDate = computed(() => {
        const fixed = this.fixedBound('minDate');
        const limit = this.config().dateLimit === 'future' ? startOfToday() : null;
        return laterOf(fixed, limit) ?? undefined;
    }, ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
    maxDate = computed(() => {
        const fixed = this.fixedBound('maxDate');
        // The end of today rather than its start: a past-only field with a time on it should still
        // accept this afternoon, which a bound at midnight would refuse.
        const limit = this.config().dateLimit === 'past' ? endOfToday() : null;
        return earlierOf(fixed, limit) ?? undefined;
    }, ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
    /** A fixed bound, or null when the config has none — or when the Date Range switch is off, which
        is what makes that switch a setting rather than a way of hiding two inputs. */
    fixedBound(member) {
        const config = this.config();
        return config.restrictDateRange ? parseLocalDateish(config[member]) : null;
    }
    /** `p-datepicker` emits undefined when cleared; null is this field's "no value". */
    onValueChange(next) {
        this.value.set(next ?? null);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: DateFieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "21.2.23", type: DateFieldInputComponent, isStandalone: true, selector: "vcr-date-field-input", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, viewQueries: [{ propertyName: "picker", first: true, predicate: DatePicker, descendants: true, isSignal: true }], ngImport: i0, template: "<!-- Bound to `displayValue` rather than to `value` so the control's own text is not repainted\n     under the user while they are typing a date \u2014 see its doc. `ngModelChange` still reports\n     every keystroke, so the value this renderer publishes is unaffected. -->\n<p-datepicker\n  [inputId]=\"inputId()\"\n  [ngModel]=\"displayValue()\"\n  [ngModelOptions]=\"{ standalone: true }\"\n  (ngModelChange)=\"onValueChange($event)\"\n  (onFocus)=\"onFocus()\"\n  (onBlur)=\"onBlur()\"\n  (onInput)=\"onTextInput($event)\"\n  [dateFormat]=\"config().dateFormat\"\n  [selectionMode]=\"config().selectionMode\"\n  [showTime]=\"config().showTime\"\n  [hourFormat]=\"config().hourFormat\"\n  [showSeconds]=\"config().showSeconds\"\n  [stepMinute]=\"config().stepMinute\"\n  [showIcon]=\"config().showIcon\"\n  [iconDisplay]=\"config().iconDisplay\"\n  [minDate]=\"minDate()\"\n  [maxDate]=\"maxDate()\"\n  [numberOfMonths]=\"config().numberOfMonths\"\n  [showButtonBar]=\"config().showButtonBar\"\n  [showClear]=\"config().showClear\"\n  [readonlyInput]=\"config().readonlyInput\"\n  [inline]=\"config().inline\"\n  [view]=\"config().view\"\n  [placeholder]=\"config().placeholder\"\n  [required]=\"required()\"\n  [disabled]=\"disabled()\"\n  [invalid]=\"invalid()\"\n  appendTo=\"body\"\n/>\n", styles: [":host{display:block;min-width:0}:host ::ng-deep .p-datepicker,:host ::ng-deep input{width:100%}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: DatePicker, selector: "p-datePicker, p-datepicker, p-date-picker", inputs: ["iconDisplay", "styleClass", "inputStyle", "inputId", "inputStyleClass", "placeholder", "ariaLabelledBy", "ariaLabel", "iconAriaLabel", "dateFormat", "multipleSeparator", "rangeSeparator", "inline", "showOtherMonths", "selectOtherMonths", "showIcon", "icon", "readonlyInput", "shortYearCutoff", "hourFormat", "timeOnly", "stepHour", "stepMinute", "stepSecond", "showSeconds", "showOnFocus", "showWeek", "startWeekFromFirstDayOfYear", "showClear", "dataType", "selectionMode", "maxDateCount", "showButtonBar", "todayButtonStyleClass", "clearButtonStyleClass", "autofocus", "autoZIndex", "baseZIndex", "panelStyleClass", "panelStyle", "keepInvalid", "hideOnDateTimeSelect", "touchUI", "timeSeparator", "focusTrap", "showTransitionOptions", "hideTransitionOptions", "tabindex", "minDate", "maxDate", "disabledDates", "disabledDays", "showTime", "responsiveOptions", "numberOfMonths", "firstDayOfWeek", "view", "defaultDate", "appendTo", "motionOptions"], outputs: ["onFocus", "onBlur", "onClose", "onSelect", "onClear", "onInput", "onTodayClick", "onClearClick", "onMonthChange", "onYearChange", "onClickOutside", "onShow"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: DateFieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-date-field-input', standalone: true, imports: [FormsModule, DatePicker], changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- Bound to `displayValue` rather than to `value` so the control's own text is not repainted\n     under the user while they are typing a date \u2014 see its doc. `ngModelChange` still reports\n     every keystroke, so the value this renderer publishes is unaffected. -->\n<p-datepicker\n  [inputId]=\"inputId()\"\n  [ngModel]=\"displayValue()\"\n  [ngModelOptions]=\"{ standalone: true }\"\n  (ngModelChange)=\"onValueChange($event)\"\n  (onFocus)=\"onFocus()\"\n  (onBlur)=\"onBlur()\"\n  (onInput)=\"onTextInput($event)\"\n  [dateFormat]=\"config().dateFormat\"\n  [selectionMode]=\"config().selectionMode\"\n  [showTime]=\"config().showTime\"\n  [hourFormat]=\"config().hourFormat\"\n  [showSeconds]=\"config().showSeconds\"\n  [stepMinute]=\"config().stepMinute\"\n  [showIcon]=\"config().showIcon\"\n  [iconDisplay]=\"config().iconDisplay\"\n  [minDate]=\"minDate()\"\n  [maxDate]=\"maxDate()\"\n  [numberOfMonths]=\"config().numberOfMonths\"\n  [showButtonBar]=\"config().showButtonBar\"\n  [showClear]=\"config().showClear\"\n  [readonlyInput]=\"config().readonlyInput\"\n  [inline]=\"config().inline\"\n  [view]=\"config().view\"\n  [placeholder]=\"config().placeholder\"\n  [required]=\"required()\"\n  [disabled]=\"disabled()\"\n  [invalid]=\"invalid()\"\n  appendTo=\"body\"\n/>\n", styles: [":host{display:block;min-width:0}:host ::ng-deep .p-datepicker,:host ::ng-deep input{width:100%}\n"] }]
        }], ctorParameters: () => [], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], picker: [{ type: i0.ViewChild, args: [i0.forwardRef(() => DatePicker), { isSignal: true }] }] } });
/** Local midnight today. Built from the parts rather than by zeroing a timestamp, for the reason
    `formatLocalDate` gives: a date-only bound has to mean the local day, not a UTC one. */
function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
/** The last second of today, so a past-only field with a time on it still accepts the hours that
    have already passed. */
function endOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
}
/** The tighter of two lower bounds, either of which may be absent. */
function laterOf(left, right) {
    if (left === null || right === null) {
        return left ?? right;
    }
    return left.getTime() >= right.getTime() ? left : right;
}
/** The tighter of two upper bounds, either of which may be absent. */
function earlierOf(left, right) {
    if (left === null || right === null) {
        return left ?? right;
    }
    return left.getTime() <= right.getTime() ? left : right;
}

/** Separates the dates of a `selectionMode: 'multiple'` value. */
const MULTIPLE_DATE_SEPARATOR = ',';
/** Separates the two ends of a `selectionMode: 'range'` value. Either side may be empty, so a
    half-picked range still round-trips rather than being discarded. */
const DATE_RANGE_SEPARATOR = '/';
/**
 * Which renderer draws which `fieldType`.
 *
 * Six of the nine kinds, across sixteen wire types. Still absent, and each for its own reason:
 * `textarea` and `currency` have not been extracted from the admin app yet, and `media` draws a
 * placeholder that edits nothing, so it is worth nothing to a consumer until the media picker
 * itself moves. An unregistered type is not an error: {@link FieldInputComponent} falls back to a
 * plain textarea, exactly as it does in the admin today.
 *
 * Note what is absent compared with the admin's copy: `editor`. Config editors are authoring UI
 * and stay in that app — see the note in `field-renderer-contract.ts`.
 *
 * Keyed by {@link FieldDefinitionType} rather than `string`, so a key that is not a real field type
 * fails to compile — the drift this package exists to prevent, caught at the registration site.
 * `Partial` because the page-widget types are deliberately never registered here: nothing in this
 * package can draw one.
 *
 * Several types deliberately share one renderer, differing only in the config seeded below —
 * `Text`/`Email`/`Phone`/`Url`, `Number`/`Decimal`, and `DatePicker` with the two retired date
 * types at the end of the map. See `FieldRendererKind`.
 */
const FIELD_DEFINITION_TYPE_RENDERERS = {
    Text: textFieldRenderer(),
    Email: textFieldRenderer({ inputType: 'email', placeholder: 'name@example.com' }),
    Phone: textFieldRenderer({ inputType: 'tel' }),
    Url: textFieldRenderer({ inputType: 'url', placeholder: 'https://' }),
    Number: numberFieldRenderer({ maxFractionDigits: 0, step: 1 }),
    Decimal: numberFieldRenderer({ minFractionDigits: 2, maxFractionDigits: 2, step: 0.01 }),
    Checkbox: checkboxFieldRenderer(),
    DatePicker: dateFieldRenderer(),
    RadioButton: radioFieldRenderer(),
    Dropdown: selectFieldRenderer(),
    // Retired from the dropdown, kept readable here. Each was replaced by a type above that does
    // the same job — `Date`/`DateTime` by `DatePicker`, `Select` by `RadioButton`, `MultiSelect` by
    // `CheckboxGroup`. These are not aliases for convenience: a saved field's type can never be
    // changed (`fieldType` is disabled on edit), so without them every field already in an account
    // of one of these types would fall through to the raw-JSON textarea for good. `DateTime` keeps
    // its old seed so such a field still opens with time switched on.
    //
    // `Select` stays pointed at the radio renderer even now that `Dropdown` exists: repointing it
    // would change what every field already saved as a `Select` draws, which is the one thing
    // keeping these entries is meant to prevent. `Dropdown` is where a new field of that shape goes.
    Date: dateFieldRenderer(),
    DateTime: dateFieldRenderer({ showTime: true, hourFormat: '12' }),
    Select: radioFieldRenderer(),
    Boolean: checkboxFieldRenderer({ checkboxType: 'single' }),
    MultiSelect: checkboxFieldRenderer({ checkboxType: 'group' }),
    CheckboxGroup: checkboxFieldRenderer({ checkboxType: 'group' }),
};
/**
 * The descriptor for `fieldType`, or null for a type with no renderer.
 *
 * `Object.hasOwn` rather than a truthiness check, so a field type spelled `constructor` or
 * `toString` cannot borrow a prototype member and be mistaken for a registration.
 */
function findFieldRenderer(fieldType) {
    // `fieldType` stays a plain `string`: it arrives as free-form API data, and narrowing the
    // parameter would push the unchecked cast out to every caller instead of containing it here,
    // where `Object.hasOwn` is the check that makes it true.
    return Object.hasOwn(FIELD_DEFINITION_TYPE_RENDERERS, fieldType)
        ? (FIELD_DEFINITION_TYPE_RENDERERS[fieldType] ?? null)
        : null;
}
/** Whether `fieldType` has a typed renderer. */
function isFieldRendererRegistered(fieldType) {
    return findFieldRenderer(fieldType) !== null;
}
/**
 * One factory per kind.
 *
 * `overrides` is what makes `Email` a text renderer with an email keyboard rather than a fourth
 * component. It is merged into the kind's defaults *before* `parse` closes over the result, so a
 * saved config missing a member falls back to **this field type's** default and not the kind's.
 *
 * Exported on purpose: this is the package's extension seam. A consumer adds a field type by
 * calling one of these with different seed config, with no new component and no package release.
 */
function textFieldRenderer(overrides = {}) {
    const defaultConfig = { ...DEFAULT_TEXT_FIELD_CONFIG, ...overrides };
    return eraseFieldRenderer({
        kind: 'text',
        renderer: TextFieldInputComponent,
        defaultConfig,
        parse: (json) => parseTextFieldConfig(json, defaultConfig),
        // Identity both ways: the in-memory value and the wire value are the same string. No trim —
        // a trailing space can be meaningful in content, and normalising one away here would rewrite
        // a value the user did not touch.
        serialize: (value) => value,
        deserialize: (raw) => raw,
    });
}
function numberFieldRenderer(overrides = {}) {
    const defaultConfig = { ...DEFAULT_NUMBER_FIELD_CONFIG, ...overrides };
    return eraseFieldRenderer({
        kind: 'number',
        renderer: NumberFieldInputComponent,
        defaultConfig,
        parse: (json) => parseNumberFieldConfig(json, defaultConfig),
        // Config-independent on purpose: grouping, prefix and fraction digits are all display
        // settings, so the stored value stays plain digits and a config change never needs the data
        // rewritten. See `formatPlainNumber`.
        serialize: (value) => formatPlainNumber(value),
        deserialize: (raw) => parseFiniteNumber(raw),
    });
}
function checkboxFieldRenderer(overrides = {}) {
    const defaultConfig = { ...DEFAULT_CHECKBOX_FIELD_CONFIG, ...overrides };
    return eraseFieldRenderer({
        kind: 'checkbox',
        renderer: CheckboxFieldInputComponent,
        defaultConfig,
        parse: (json) => parseCheckboxFieldConfig(json, defaultConfig),
        // The one codec here that branches on its config rather than merely reading a format from it:
        // `Checkbox` is a single field type covering two controls, so `checkboxType` decides whether a
        // value is a tri-state boolean or a list of ticked values. See `CheckboxFieldValue`.
        serialize: (value, config) => {
            if (config.checkboxType === 'group') {
                return Array.isArray(value) ? value.join(CHECKBOX_VALUE_SEPARATOR) : '';
            }
            if (typeof value !== 'boolean') {
                return '';
            }
            return value ? config.trueText : config.falseText;
        },
        deserialize: (raw, config) => {
            if (config.checkboxType === 'group') {
                const stored = new Set(raw
                    .split(CHECKBOX_VALUE_SEPARATOR)
                    .map((part) => part.trim())
                    .filter((part) => part !== ''));
                // Ordered by the config rather than by the stored string, so the boxes read top to bottom
                // however the value was written. An option since removed is dropped, which
                // `FieldInputComponent` then reports as unreadable rather than silently rewriting.
                return config.options.map((option) => option.value).filter((value) => stored.has(value));
            }
            const parsed = parseLooseBoolean(raw, config.trueText, config.falseText);
            // A binary box has no third state to show, so an unreadable value has to land somewhere;
            // false is the only honest choice, and `FieldInputComponent` flags it as unreadable so the
            // stored text survives untouched. A tri-state box keeps the null.
            if (parsed === null && !config.triState && raw.trim() !== '') {
                return false;
            }
            return parsed;
        },
    });
}
function radioFieldRenderer(overrides = {}) {
    const defaultConfig = { ...DEFAULT_RADIO_FIELD_CONFIG, ...overrides };
    return eraseFieldRenderer({
        kind: 'radio',
        renderer: RadioFieldInputComponent,
        defaultConfig,
        parse: (json) => parseRadioFieldConfig(json, defaultConfig),
        serialize: (value) => value ?? '',
        // Only a value the field still offers is accepted. A stored option that has since been
        // removed comes back as null, which `FieldInputComponent` reports as unreadable rather than
        // silently clearing — the old value stays stored until someone picks a new one.
        deserialize: (raw, config) => {
            const value = raw.trim();
            return config.options.some((option) => option.value === value) ? value : null;
        },
    });
}
function selectFieldRenderer(overrides = {}) {
    const defaultConfig = { ...DEFAULT_SELECT_FIELD_CONFIG, ...overrides };
    return eraseFieldRenderer({
        kind: 'select',
        renderer: SelectFieldInputComponent,
        defaultConfig,
        parse: (json) => parseSelectFieldConfig(json, defaultConfig),
        // The second codec here that branches on its config rather than merely reading a format from
        // it, for the same reason the checkbox one does: `Dropdown` is a single field type covering
        // two controls, so `selectionMode` decides whether a value is one option or a list of them.
        // See `SelectFieldValue`.
        serialize: (value, config) => {
            if (config.selectionMode === 'multiple') {
                return Array.isArray(value) ? value.join(SELECT_VALUE_SEPARATOR) : '';
            }
            return typeof value === 'string' ? value : '';
        },
        // Only values the field still offers are accepted, in either mode. A stored option that has
        // since been removed is dropped, which `FieldInputComponent` then reports as unreadable rather
        // than silently rewriting — the old value stays stored until someone picks a new one.
        deserialize: (raw, config) => {
            if (config.selectionMode === 'multiple') {
                const stored = new Set(raw
                    .split(SELECT_VALUE_SEPARATOR)
                    .map((part) => part.trim())
                    .filter((part) => part !== ''));
                // Ordered by the config rather than by the stored string, so the picks read in the
                // authored order however the value was written. Round-trip stability survives that
                // reordering because the requirement is on this pair's *own* output:
                // `serialize(deserialize(serialize(v)))` is already in config order by the second pass.
                return config.options.map((option) => option.value).filter((value) => stored.has(value));
            }
            const value = raw.trim();
            return config.options.some((option) => option.value === value) ? value : null;
        },
    });
}
function dateFieldRenderer(overrides = {}) {
    const defaultConfig = { ...DEFAULT_DATE_FIELD_CONFIG, ...overrides };
    return eraseFieldRenderer({
        kind: 'date',
        renderer: DateFieldInputComponent,
        defaultConfig,
        parse: (json) => parseDateFieldConfig(json, defaultConfig),
        serialize: (value, config) => serializeDateValue(value, config),
        deserialize: (raw, config) => deserializeDateValue(raw, config),
    });
}
/**
 * A date value as the wire holds it.
 *
 * Always naive and local — never `toISOString()`. See `formatLocalDate` for why: a date-only
 * field picked as the 1st in any negative-offset zone would otherwise store the 31st of the
 * previous month.
 *
 * `selectionMode` decides the shape, which is why the codec needs the config at all. A range
 * keeps its separator even when half-picked, so `2026-01-01/` round-trips rather than collapsing
 * into a single date.
 */
function serializeDateValue(value, config) {
    const format = config.showTime ? formatLocalDateTime : formatLocalDate;
    if (config.selectionMode === 'range') {
        const [start, end] = Array.isArray(value) ? value : [value, null];
        const startText = start instanceof Date ? format(start) : '';
        const endText = end instanceof Date ? format(end) : '';
        return startText === '' && endText === ''
            ? ''
            : `${startText}${DATE_RANGE_SEPARATOR}${endText}`;
    }
    if (config.selectionMode === 'multiple') {
        const dates = Array.isArray(value) ? value : value === null ? [] : [value];
        return dates
            .filter((date) => date instanceof Date)
            .map((date) => format(date))
            .join(MULTIPLE_DATE_SEPARATOR);
    }
    // 'single'. An array here means the field's mode changed under stored data; the first date is
    // the most useful reading of it.
    const single = Array.isArray(value) ? (value[0] ?? null) : value;
    return single instanceof Date ? format(single) : '';
}
/** The dates a stored value means. Never throws: an unreadable value is null, which
    `FieldInputComponent` reports rather than repairing. */
function deserializeDateValue(raw, config) {
    const value = raw.trim();
    if (value === '') {
        return null;
    }
    if (config.selectionMode === 'range') {
        const [startText = '', endText = ''] = value.split(DATE_RANGE_SEPARATOR);
        const start = parseLocalDateish(startText);
        const end = parseLocalDateish(endText);
        if (start === null && end === null) {
            return null;
        }
        // Both slots, nulls kept: `p-datepicker` reads range mode as a two-slot array and fills the
        // second on the user's next click. Dropping a null end would make the control think the
        // range was complete.
        return [start, end];
    }
    if (config.selectionMode === 'multiple') {
        const dates = value
            .split(MULTIPLE_DATE_SEPARATOR)
            .map((part) => parseLocalDateish(part))
            .filter((date) => date !== null);
        return dates.length === 0 ? null : dates;
    }
    return parseLocalDateish(value);
}

/**
 * Whether a renderer component declares the optional `blurred` output.
 *
 * Read off Angular's own component metadata rather than tracked on the descriptor, so a renderer
 * cannot claim an output it does not have — the descriptor is hand-written, this is not.
 * `templateName` is the name a binding uses, which is what `outputBinding` matches on; it differs
 * from `propName` for an aliased output.
 */
function declaresBlurred(renderer) {
    return (reflectComponentType(renderer)?.outputs.some((candidate) => candidate.templateName === RENDERER_BINDINGS.blurred) ?? false);
}
/**
 * Renders the right control for a field's value, whatever its `fieldType`.
 *
 * One of two facades over `FIELD_DEFINITION_TYPE_RENDERERS` — this one draws a *value*,
 * `FieldConfigEditorComponent` authors a *config*. Consumers name a field type and hand over the
 * saved `fieldConfig` string; everything about which component that implies, and how the value
 * crosses the wire, stays inside the registry.
 *
 * ## Why the component is created imperatively
 *
 * The renderer is chosen at runtime, so it cannot be a template element. `NgComponentOutlet`
 * would be the declarative option and is the wrong tool here: it has no output half at all (its
 * only input channel is `ngComponentOutletInputs`, a `Record<string, unknown>`), so reading a
 * value back would mean subscribing to the created instance's model signal, and every value in
 * that record would have to be referentially stable or the rendered view is marked dirty on
 * every change-detection pass. `createComponent` with `bindings` gives real input bindings and a
 * real output subscription, which is exactly the shape this needs.
 *
 * ## Why it binds `value` and `valueChange` separately instead of two-way
 *
 * A `twoWayBinding` would make a renderer's reset indistinguishable from a user's edit, and this
 * component must never write on load — see {@link storedValueUnreadable}. Binding the input half
 * and listening to the output half separately means {@link commit} runs only when a renderer
 * actually emits.
 */
class FieldInputComponent {
    fieldType = input.required(...(ngDevMode ? [{ debugName: "fieldType" }] : /* istanbul ignore next */ []));
    /** The field's saved config, as the raw wire string.
     *
     * Raw rather than parsed because both consumers already hold a string — one from a
     * `FieldDefinitionResponse`, the other from a config editor's `configValue()` — and this facade
     * is the only thing that knows the `fieldType` needed to interpret it. */
    fieldConfig = input(null, ...(ngDevMode ? [{ debugName: "fieldConfig" }] : /* istanbul ignore next */ []));
    fieldKey = input('', ...(ngDevMode ? [{ debugName: "fieldKey" }] : /* istanbul ignore next */ []));
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    /** Off by default: the value-editing consumers draw their own label, and only the preview in
        the field-definition form wants one from here. */
    showLabel = input(false, ...(ngDevMode ? [{ debugName: "showLabel" }] : /* istanbul ignore next */ []));
    required = input(false, ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalid = input(false, ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    /** The wire value — a string for every field type, whatever the control works in. */
    value = model('', ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    /**
     * Re-emitted from the renderer's own `blurred`, for a consumer that wants to act once the user
     * has finished with the control rather than on every keystroke.
     *
     * By the time this fires, `value` holds the settled wire string — `number` has rounded and
     * `date` has repainted. Silent for a renderer that does not declare the output, and for an
     * unregistered field type, whose fallback textarea has no renderer to blur.
     */
    blurred = output();
    /** Where the chosen renderer is created. Absent while the field type is unregistered, since
        the anchor only exists inside that branch of the template. */
    anchor = viewChild('anchor', { ...(ngDevMode ? { debugName: "anchor" } : /* istanbul ignore next */ {}), read: ViewContainerRef });
    descriptor = computed(() => findFieldRenderer(this.fieldType()), ...(ngDevMode ? [{ debugName: "descriptor" }] : /* istanbul ignore next */ []));
    isRegistered = computed(() => this.descriptor() !== null, ...(ngDevMode ? [{ debugName: "isRegistered" }] : /* istanbul ignore next */ []));
    /**
     * The parsed config handed to the renderer.
     *
     * A `computed` so its identity is stable until `fieldType` or `fieldConfig` actually change. A
     * fresh object per read would be a new input value on every change-detection pass, which for an
     * `OnPush` child is an endless re-render.
     */
    config = computed(() => this.descriptor()?.parse(this.fieldConfig()) ?? null, ...(ngDevMode ? [{ debugName: "config" }] : /* istanbul ignore next */ []));
    /** The wire value decoded into whatever the control works in. A `computed` for the same
        identity reason as {@link config} — a `Date` rebuilt per read would never settle. */
    decoded = computed(() => {
        const descriptor = this.descriptor();
        return descriptor === null ? null : descriptor.deserialize(this.value(), this.config());
    }, ...(ngDevMode ? [{ debugName: "decoded" }] : /* istanbul ignore next */ []));
    /**
     * Whether the stored value is not something this field's renderer can represent — a number
     * field holding `"hello"`, a radio field holding an option that has since been removed.
     *
     * Shown as a note and **never repaired**. Rewriting a value this app did not author, without
     * the user touching the control, is how data quietly disappears: the value survives every save
     * until someone edits the field on purpose.
     *
     * Detected by round-tripping rather than by a per-kind check: a value that decodes to nothing
     * re-serialises to the empty string, and every codec is required to be round-trip stable. A
     * value that merely normalises — `"1.50"` becoming `1.5` — is not flagged, because it did
     * decode to something.
     */
    storedValueUnreadable = computed(() => {
        const descriptor = this.descriptor();
        if (descriptor === null || this.value() === '') {
            return false;
        }
        return descriptor.serialize(this.decoded(), this.config()) === '';
    }, ...(ngDevMode ? [{ debugName: "storedValueUnreadable" }] : /* istanbul ignore next */ []));
    /** The control's `id`, matching what each renderer derives from `fieldKey`, so the label below
        points at the right element. */
    inputId = computed(() => this.fieldKey() || 'field-input', ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    constructor() {
        // Recreates the renderer when the field type changes, and once more when the anchor query
        // resolves. Deliberately reads *only* those two signals: `config`, `value` and the flags are
        // read inside the binding callbacks instead, which Angular evaluates later and outside this
        // reactive context — so a keystroke updates the existing renderer's inputs rather than
        // destroying it and taking the user's focus with it.
        effect((onCleanup) => {
            const descriptor = this.descriptor();
            const anchor = this.anchor();
            if (descriptor === null || anchor === undefined) {
                return;
            }
            anchor.clear();
            anchor.createComponent(descriptor.renderer, {
                bindings: [
                    inputBinding(RENDERER_BINDINGS.config, () => this.config()),
                    inputBinding(RENDERER_BINDINGS.value, () => this.decoded()),
                    outputBinding(RENDERER_BINDINGS.valueChange, (next) => this.commit(next)),
                    inputBinding(RENDERER_BINDINGS.fieldKey, () => this.fieldKey()),
                    inputBinding(RENDERER_BINDINGS.required, () => this.required()),
                    inputBinding(RENDERER_BINDINGS.disabled, () => this.disabled()),
                    inputBinding(RENDERER_BINDINGS.invalid, () => this.invalid()),
                    // Conditional because `blurred` is optional on `FieldRenderer`. This is not defensive
                    // tidiness: binding an output a component does not declare throws
                    // `NG0316: ... does not have an output with a public name of "blurred"` at creation time,
                    // which takes down the whole renderer — not just its blur. Verified by removing the
                    // output and watching every rendering test fail, not assumed. A renderer registered
                    // through the extension seam with no use for focus must keep working.
                    ...(declaresBlurred(descriptor.renderer)
                        ? [outputBinding(RENDERER_BINDINGS.blurred, () => this.blurred.emit())]
                        : []),
                ],
            });
            onCleanup(() => anchor.clear());
        });
    }
    /**
     * Writes a renderer's new value back out as the wire string.
     *
     * Cannot loop. `model.set` is a no-op when the value is unchanged, and a value written *into* a
     * model from outside never emits — so the round trip costs one extra input update that Angular
     * dedupes. That holds only because every codec is round-trip stable
     * (`serialize(deserialize(s)) === s` for any `s` the pair itself produced), which is a stated
     * requirement on `FieldValueCodec` rather than an accident.
     */
    commit(next) {
        const descriptor = this.descriptor();
        if (descriptor === null) {
            return;
        }
        this.value.set(descriptor.serialize(next, this.config()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: FieldInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: FieldInputComponent, isStandalone: true, selector: "vcr-field-input", inputs: { fieldType: { classPropertyName: "fieldType", publicName: "fieldType", isSignal: true, isRequired: true, transformFunction: null }, fieldConfig: { classPropertyName: "fieldConfig", publicName: "fieldConfig", isSignal: true, isRequired: false, transformFunction: null }, fieldKey: { classPropertyName: "fieldKey", publicName: "fieldKey", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, showLabel: { classPropertyName: "showLabel", publicName: "showLabel", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange", blurred: "blurred" }, viewQueries: [{ propertyName: "anchor", first: true, predicate: ["anchor"], descendants: true, read: ViewContainerRef, isSignal: true }], ngImport: i0, template: "@if (isRegistered()) {\n  @if (showLabel() && label() !== '') {\n    <label class=\"field-input__label\" [attr.for]=\"inputId()\">\n      {{ label() }}\n      @if (required()) {\n        <span class=\"field-input__required\" aria-hidden=\"true\">*</span>\n      }\n    </label>\n  }\n\n  <!-- The chosen renderer is created here \u2014 see the effect in this component's constructor. -->\n  <ng-container #anchor />\n\n  @if (storedValueUnreadable()) {\n    <small class=\"field-input__hint\">\n      The saved value isn\u2019t something this field can show. It is left untouched until you edit this\n      control.\n    </small>\n  }\n} @else {\n  <!-- The same bare textarea every field type used before this module existed. An unregistered\n       field type is not an error: it is a type nobody has written a renderer for yet, and the\n       platform stores its value as a string like every other. -->\n  <textarea\n    pTextarea\n    rows=\"5\"\n    [id]=\"inputId()\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"value.set($event ?? '')\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n  ></textarea>\n}\n", styles: [":host{display:flex;flex-direction:column;gap:8px;min-width:0}.field-input__label{color:var(--content-color);font-size:13px;font-weight:600}.field-input__required{color:var(--error-color);margin-left:2px}.field-input__hint{color:var(--surface-500);font-size:12px;line-height:1.5}:host ::ng-deep textarea{width:100%}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: Textarea, selector: "[pTextarea], [pInputTextarea]", inputs: ["pTextareaPT", "pTextareaUnstyled", "autoResize", "pSize", "variant", "fluid", "invalid"], outputs: ["onResize"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: FieldInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-field-input', standalone: true, imports: [FormsModule, Textarea], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (isRegistered()) {\n  @if (showLabel() && label() !== '') {\n    <label class=\"field-input__label\" [attr.for]=\"inputId()\">\n      {{ label() }}\n      @if (required()) {\n        <span class=\"field-input__required\" aria-hidden=\"true\">*</span>\n      }\n    </label>\n  }\n\n  <!-- The chosen renderer is created here \u2014 see the effect in this component's constructor. -->\n  <ng-container #anchor />\n\n  @if (storedValueUnreadable()) {\n    <small class=\"field-input__hint\">\n      The saved value isn\u2019t something this field can show. It is left untouched until you edit this\n      control.\n    </small>\n  }\n} @else {\n  <!-- The same bare textarea every field type used before this module existed. An unregistered\n       field type is not an error: it is a type nobody has written a renderer for yet, and the\n       platform stores its value as a string like every other. -->\n  <textarea\n    pTextarea\n    rows=\"5\"\n    [id]=\"inputId()\"\n    [ngModel]=\"value()\"\n    [ngModelOptions]=\"{ standalone: true }\"\n    (ngModelChange)=\"value.set($event ?? '')\"\n    [disabled]=\"disabled()\"\n    [invalid]=\"invalid()\"\n  ></textarea>\n}\n", styles: [":host{display:flex;flex-direction:column;gap:8px;min-width:0}.field-input__label{color:var(--content-color);font-size:13px;font-weight:600}.field-input__required{color:var(--error-color);margin-left:2px}.field-input__hint{color:var(--surface-500);font-size:12px;line-height:1.5}:host ::ng-deep textarea{width:100%}\n"] }]
        }], ctorParameters: () => [], propDecorators: { fieldType: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldType", required: true }] }], fieldConfig: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldConfig", required: false }] }], fieldKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldKey", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], showLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "showLabel", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], blurred: [{ type: i0.Output, args: ["blurred"] }], anchor: [{ type: i0.ViewChild, args: ['anchor', { ...{ read: ViewContainerRef }, isSignal: true }] }] } });

/*
 * Public API Surface of velocity-core-renderer
 *
 * Six of the nine kinds. See `built-in-field-renderers.ts` for what is still absent and why.
 */
// Contract

/**
 * Generated bundle index. Do not edit.
 */

export { CHECKBOX_TYPES, CHECKBOX_TYPE_OPTIONS, CHECKBOX_VALUE_SEPARATOR, CHOICE_ORIENTATIONS, CHOICE_ORIENTATION_OPTIONS, CHOICE_SORTS, CHOICE_SORT_OPTIONS, CURRENCY_DISPLAYS, CURRENCY_DISPLAY_OPTIONS, CheckboxFieldInputComponent, DATE_FORMAT_OPTIONS, DATE_ICON_DISPLAYS, DATE_ICON_DISPLAY_OPTIONS, DATE_LIMITS, DATE_LIMIT_OPTIONS, DATE_SELECTION_MODES, DATE_SELECTION_MODE_OPTIONS, DATE_VIEWS, DATE_VIEW_OPTIONS, DEFAULT_CHECKBOX_FIELD_CONFIG, DEFAULT_CURRENCY_FIELD_CONFIG, DEFAULT_DATE_FIELD_CONFIG, DEFAULT_MEDIA_FIELD_CONFIG, DEFAULT_NUMBER_FIELD_CONFIG, DEFAULT_RADIO_FIELD_CONFIG, DEFAULT_SELECT_FIELD_CONFIG, DEFAULT_TEXTAREA_FIELD_CONFIG, DEFAULT_TEXT_FIELD_CONFIG, DateFieldInputComponent, FIELD_DEFINITION_TYPE_RENDERERS, FIELD_INPUT_SIZES, FIELD_INPUT_SIZE_OPTIONS, FieldInputComponent, HOUR_FORMATS, HOUR_FORMAT_OPTIONS, LABEL_POSITIONS, LABEL_POSITION_OPTIONS, MEDIA_FILE_EXTENSIONS, MEDIA_FILE_EXTENSION_OPTIONS, MEDIA_PREVIEW_SIZES, MEDIA_PREVIEW_SIZE_OPTIONS, NUMBER_BUTTON_LAYOUTS, NUMBER_BUTTON_LAYOUT_OPTIONS, NUMBER_NEGATIVE_FORMATS, NUMBER_NEGATIVE_FORMAT_OPTIONS, NUMBER_ROUNDING_RULES, NUMBER_ROUNDING_RULE_OPTIONS, NumberFieldInputComponent, RENDERER_BINDINGS, RETIRED_TEXT_INPUT_TYPE_LABELS, RadioFieldInputComponent, SELECT_MODES, SELECT_MODE_OPTIONS, SELECT_VALUE_SEPARATOR, SelectFieldInputComponent, TEXT_AFFIX_MODES, TEXT_AFFIX_MODE_OPTIONS, TEXT_INPUT_TYPES, TEXT_INPUT_TYPE_OPTIONS, TextFieldInputComponent, checkboxFieldRenderer, clearedCheckboxModeSettings, collectExtras, dateFieldRenderer, dateFormatNamesDay, eraseFieldRenderer, findFieldRenderer, formatLocalDate, formatLocalDateTime, formatPlainNumber, hasBlankChoiceValue, hasDuplicateChoiceLabel, hasDuplicateChoiceValue, isCurrencyCodeShaped, isFieldRendererRegistered, numberFieldRenderer, parseCheckboxFieldConfig, parseChoiceOptions, parseCurrencyFieldConfig, parseDateFieldConfig, parseDaylessDate, parseFiniteNumber, parseLocalDateish, parseLooseBoolean, parseMediaFieldConfig, parseNumberFieldConfig, parseRadioFieldConfig, parseSelectFieldConfig, parseTextFieldConfig, parseTextareaFieldConfig, radioFieldRenderer, readArray, readBoolean, readConfigSource, readNullableNumber, readNumber, readOption, readRecord, readString, selectFieldRenderer, sortChoiceOptions, textFieldRenderer, toFieldConfigJson };
//# sourceMappingURL=velocity-core-renderer.mjs.map
