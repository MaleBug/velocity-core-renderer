export * from 'velocity-core-renderer/vocabulary';
import * as i0 from '@angular/core';
import { input, model, output, computed, ChangeDetectionStrategy, Component, reflectComponentType, viewChild, ViewContainerRef, effect, inputBinding, outputBinding } from '@angular/core';
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
 * Which renderer draws which `fieldType`.
 *
 * **Spike slice** — the text kind only. The full registry in the admin app carries nine kinds
 * across nineteen wire types; this one exists to prove the packaging chain end to end, so it
 * carries the four wire types that share the text renderer and nothing else. An unregistered type
 * is not an error: {@link FieldInputComponent} falls back to a plain textarea, exactly as it does
 * in the admin today.
 *
 * Note what is absent compared with the admin's copy: `editor`. Config editors are authoring UI
 * and stay in that app — see the note in `field-renderer-contract.ts`.
 *
 * Keyed by {@link FieldDefinitionType} rather than `string`, so a key that is not a real field type
 * fails to compile — the drift this package exists to prevent, caught at the registration site.
 * `Partial` because the page-widget types are deliberately never registered here: nothing in this
 * package can draw one.
 */
const FIELD_DEFINITION_TYPE_RENDERERS = {
    Text: textFieldRenderer(),
    Email: textFieldRenderer({ inputType: 'email', placeholder: 'name@example.com' }),
    Phone: textFieldRenderer({ inputType: 'tel' }),
    Url: textFieldRenderer({ inputType: 'url', placeholder: 'https://' }),
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
        ? FIELD_DEFINITION_TYPE_RENDERERS[fieldType] ?? null
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
 * Spike slice: the text kind only. See `built-in-field-renderers.ts`.
 */
// Contract

/**
 * Generated bundle index. Do not edit.
 */

export { CHECKBOX_TYPES, CHECKBOX_TYPE_OPTIONS, CHECKBOX_VALUE_SEPARATOR, CHOICE_ORIENTATIONS, CHOICE_ORIENTATION_OPTIONS, CHOICE_SORTS, CHOICE_SORT_OPTIONS, CURRENCY_DISPLAYS, CURRENCY_DISPLAY_OPTIONS, DATE_FORMAT_OPTIONS, DATE_ICON_DISPLAYS, DATE_ICON_DISPLAY_OPTIONS, DATE_LIMITS, DATE_LIMIT_OPTIONS, DATE_SELECTION_MODES, DATE_SELECTION_MODE_OPTIONS, DATE_VIEWS, DATE_VIEW_OPTIONS, DEFAULT_CHECKBOX_FIELD_CONFIG, DEFAULT_CURRENCY_FIELD_CONFIG, DEFAULT_DATE_FIELD_CONFIG, DEFAULT_MEDIA_FIELD_CONFIG, DEFAULT_NUMBER_FIELD_CONFIG, DEFAULT_RADIO_FIELD_CONFIG, DEFAULT_SELECT_FIELD_CONFIG, DEFAULT_TEXTAREA_FIELD_CONFIG, DEFAULT_TEXT_FIELD_CONFIG, FIELD_DEFINITION_TYPE_RENDERERS, FIELD_INPUT_SIZES, FIELD_INPUT_SIZE_OPTIONS, FieldInputComponent, HOUR_FORMATS, HOUR_FORMAT_OPTIONS, LABEL_POSITIONS, LABEL_POSITION_OPTIONS, MEDIA_FILE_EXTENSIONS, MEDIA_FILE_EXTENSION_OPTIONS, MEDIA_PREVIEW_SIZES, MEDIA_PREVIEW_SIZE_OPTIONS, NUMBER_BUTTON_LAYOUTS, NUMBER_BUTTON_LAYOUT_OPTIONS, NUMBER_NEGATIVE_FORMATS, NUMBER_NEGATIVE_FORMAT_OPTIONS, NUMBER_ROUNDING_RULES, NUMBER_ROUNDING_RULE_OPTIONS, RENDERER_BINDINGS, RETIRED_TEXT_INPUT_TYPE_LABELS, SELECT_MODES, SELECT_MODE_OPTIONS, SELECT_VALUE_SEPARATOR, TEXT_AFFIX_MODES, TEXT_AFFIX_MODE_OPTIONS, TEXT_INPUT_TYPES, TEXT_INPUT_TYPE_OPTIONS, TextFieldInputComponent, clearedCheckboxModeSettings, collectExtras, eraseFieldRenderer, findFieldRenderer, hasBlankChoiceValue, hasDuplicateChoiceValue, isCurrencyCodeShaped, isFieldRendererRegistered, parseCheckboxFieldConfig, parseChoiceOptions, parseCurrencyFieldConfig, parseDateFieldConfig, parseMediaFieldConfig, parseNumberFieldConfig, parseRadioFieldConfig, parseSelectFieldConfig, parseTextFieldConfig, parseTextareaFieldConfig, readArray, readBoolean, readConfigSource, readNullableNumber, readNumber, readOption, readRecord, readString, sortChoiceOptions, textFieldRenderer, toFieldConfigJson };
//# sourceMappingURL=velocity-core-renderer.mjs.map
