import * as _angular_core from '@angular/core';
import { InputSignal, ModelSignal, OutputEmitterRef, Type } from '@angular/core';
import { FieldDefinitionType } from 'velocity-core-renderer/vocabulary';
export * from 'velocity-core-renderer/vocabulary';
import { CalculatedFieldConfig } from 'velocity-core-renderer/expression';
export * from 'velocity-core-renderer/expression';
import * as velocity_core_renderer from 'velocity-core-renderer';

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
 * The member every renderer config carries for the parts of a saved config its typed shape does
 * not model.
 *
 * It exists because a dedicated config editor serialises a *fresh, fully-specified* object — the
 * pattern the existing seven follow — which on its own would silently drop anything it did not
 * recognise the first time a field was saved. And because a registered type's raw-JSON textarea
 * is disabled, the user would have no way to get it back. So unknown members are carried here
 * and spread back out by {@link toFieldConfigJson}: invisible in the UI, preserved on the wire.
 *
 * Never written by an editor and never read by a renderer. It is custody, not configuration.
 */
interface FieldConfigExtras {
    extra: Record<string, unknown>;
}
/**
 * A saved config's members, or null when there is nothing usable to read.
 *
 * Null covers all three ways that happens — absent, unparseable, or parsed into something that
 * is not a plain object (`[1,2,3]` and `"text"` are both valid JSON and neither is a config) —
 * because every caller treats them identically: fall back to the field type's defaults. Never
 * throws, matching how `decodeBase64` treats a malformed id: a config arriving from an API is
 * data, not a contract.
 */
declare function readConfigSource(json: string | null): Record<string, unknown> | null;
/**
 * The members of `source` that `defaults` does not model — what {@link FieldConfigExtras} carries.
 *
 * Keyed off the defaults rather than a hand-listed set of known members, so a config that grows a
 * property cannot forget to stop treating it as foreign. `extra` itself is excluded: a config
 * that has already been through this app once carries one, and nesting it would compound on every
 * save.
 */
declare function collectExtras(source: Record<string, unknown>, defaults: object): Record<string, unknown>;
/**
 * A config as the wire holds it: its own members, plus whatever {@link FieldConfigExtras} was
 * keeping for it.
 *
 * The known members are spread last so a config this app models always wins over a stale copy of
 * the same key in `extra` — which can only happen if a member was foreign when the field was last
 * saved and is modelled now.
 */
declare function toFieldConfigJson<TConfig extends FieldConfigExtras>(config: TConfig): string;
/** A saved string, or the default for anything that is not one. */
declare function readString(raw: unknown, fallback: string): string;
/**
 * A saved boolean, or the default for anything that is not one.
 *
 * Deliberately strict — no truthiness, no `'true'` — because a config member that arrives as a
 * string is a sign the config was written by something that did not know the shape, and guessing
 * for it would hide that. The *value* codecs are lenient (see `parseLooseBoolean`); config is not
 * user data and does not need the same courtesy.
 */
declare function readBoolean(raw: unknown, fallback: boolean): boolean;
/** A saved finite number, or the default. NaN and Infinity survive `JSON.parse` as `null`, but a
    hand-edited config can still hold a string, so the type is checked as well as the value. */
declare function readNumber(raw: unknown, fallback: number): number;
/**
 * A saved finite number, an explicit null, or the default.
 *
 * The null case is the point: for members like `maxLength` and `min`, null means "no limit" and
 * is a real choice a user can make, distinct from "never set". `readNumber` would overwrite it
 * with the default and quietly reimpose a cap the user had removed.
 */
declare function readNullableNumber(raw: unknown, fallback: number | null): number | null;
/**
 * A saved value that is one of `allowed`, or the default.
 *
 * This is what keeps a union-typed config member honest: `selectionMode` is typed
 * `'single' | 'multiple' | 'range'`, and without this check a saved `"weekly"` would be cast
 * straight into that type and handed to PrimeNG, which would then behave in a way no branch here
 * accounts for.
 */
declare function readOption<T extends string>(raw: unknown, allowed: readonly T[], fallback: T): T;
/** The members of a saved array, or null when the value is not one — for the list-shaped config
    members (`RadioFieldConfig.options`), which each validate their own entries. */
declare function readArray(raw: unknown): unknown[] | null;
/** One entry of a list-shaped config member, or null when it is not a plain object. Mirrors
    {@link readConfigSource}'s exclusions for the same reason. */
declare function readRecord(raw: unknown): Record<string, unknown> | null;

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
 * One entry in a config editor's dropdown.
 *
 * Generic in the value so a `p-select` bound to a union-typed config member stays checked —
 * `FieldTypeOption` in `field-definition.model.ts` is the untyped equivalent, and is the right
 * shape there because a field type really is a free string.
 */
interface ConfigSelectOption<T extends string> {
    label: string;
    value: T;
}
/**
 * A headed run of entries in a config editor's dropdown, for the lists long enough that a flat
 * menu stops being scannable — `MediaFileExtension`'s ninety-odd extensions are the case.
 *
 * `label` is the heading and is not selectable; `items` are. The member names match what
 * `p-select` reads through `optionGroupLabel` and `optionGroupChildren`, so a grouped menu needs
 * no mapping at the binding.
 */
interface ConfigSelectOptionGroup<T extends string> {
    label: string;
    items: ConfigSelectOption<T>[];
}
/**
 * How large the rendered control is drawn.
 *
 * `'medium'` is the theme's own normal size, and PrimeNG spells that `undefined` — its `size` input
 * is `'small' | 'large' | undefined`, so each renderer translates the middle member at the binding
 * rather than passing it through. It is named here anyway because a menu reading
 * Small/Medium/Large says what the middle choice *is*, where the `''`/"Default" it replaced only
 * said what it was not.
 */
declare const FIELD_INPUT_SIZES: readonly ["small", "medium", "large"];
type FieldInputSize = (typeof FIELD_INPUT_SIZES)[number];
declare const FIELD_INPUT_SIZE_OPTIONS: ConfigSelectOption<FieldInputSize>[];
/**
 * The sizes a *saved* config may hold — the three above plus the `''` they used to include.
 *
 * Parsing has to be wider than authoring here. Every field authored before Medium existed stored
 * `''` for "the theme's normal size", and that is now spelled `'medium'`: reading those against
 * {@link FIELD_INPUT_SIZES} alone would reject the value and fall back to the default, which is
 * now `'small'` — quietly shrinking every such field the next time its config was read.
 */
declare const STORED_FIELD_INPUT_SIZES: readonly ["", "small", "medium", "large"];
type StoredFieldInputSize = (typeof STORED_FIELD_INPUT_SIZES)[number];
/**
 * A saved size in the authored vocabulary — `''` read as the `'medium'` it always meant.
 *
 * Applied at parse time rather than by rewriting saved configs, so a field keeps drawing at the
 * size it has always drawn at without anything having to migrate it. Its config is rewritten in
 * full the first time someone saves the field, at which point the `''` goes away on its own.
 */
declare function normalizeFieldInputSize(size: StoredFieldInputSize): FieldInputSize;
/**
 * One choice a field offers — a radio button, or a box in a checkbox group.
 *
 * `value` is what gets stored, `label` only what is shown. So a label can be reworded at any
 * time, while changing a `value` orphans every record already holding the old one. The config
 * editors say so out loud, because the two read as interchangeable in a form and are not.
 */
interface FieldChoiceOption {
    label: string;
    value: string;
}
/** Whether the choices stack or sit in a row. Shared by every options-based field. */
declare const CHOICE_ORIENTATIONS: readonly ["vertical", "horizontal"];
type ChoiceOrientation = (typeof CHOICE_ORIENTATIONS)[number];
declare const CHOICE_ORIENTATION_OPTIONS: ConfigSelectOption<ChoiceOrientation>[];
/**
 * What order the choices are drawn in. Shared by every options-based field.
 *
 * `'none'` is the authored order — the rows as they sit in the options editor, which is the only
 * order that can express a deliberate one (Small, Medium, Large sorts alphabetically into
 * nonsense). The two sorts are for the lists where the author's order is incidental and a reader
 * scans for a known entry: countries, departments, a few dozen tags.
 */
declare const CHOICE_SORTS: readonly ["none", "asc", "desc"];
type ChoiceSort = (typeof CHOICE_SORTS)[number];
declare const CHOICE_SORT_OPTIONS: ConfigSelectOption<ChoiceSort>[];
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
declare function sortChoiceOptions(options: readonly FieldChoiceOption[], sort: ChoiceSort): readonly FieldChoiceOption[];
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
declare function parseChoiceOptions(entries: unknown[] | null, fallback: FieldChoiceOption[], readText: (raw: unknown, fallbackText: string) => string, readEntry: (raw: unknown) => Record<string, unknown> | null): FieldChoiceOption[];
/** True when some choice has no stored value — it cannot be saved, so it is not a choice yet. */
declare function hasBlankChoiceValue(options: readonly FieldChoiceOption[]): boolean;
/** True when some choice has no label — it is what the person choosing actually reads. */
declare function hasBlankChoiceLabel(options: readonly FieldChoiceOption[]): boolean;
/**
 * True when two choices share a stored value.
 *
 * They could not be told apart once selected, and {@link parseChoiceOptions} silently collapses
 * them on the way back in — so the editor says so rather than letting a choice quietly vanish.
 */
declare function hasDuplicateChoiceValue(options: readonly FieldChoiceOption[]): boolean;
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
declare function hasDuplicateChoiceLabel(options: readonly FieldChoiceOption[]): boolean;

/**
 * Which of the two controls a `Checkbox` field draws.
 *
 * One field type rather than two, because to an author they are the same question asked at
 * different widths — "tick this" and "tick any of these". The cost is that the two modes hold
 * different *shapes* of value, so this member is read by the codec as well as by the control: see
 * `CheckboxFieldValue` and the branching in `checkboxFieldRenderer`.
 */
declare const CHECKBOX_TYPES: readonly ["single", "group"];
type CheckboxType = (typeof CHECKBOX_TYPES)[number];
declare const CHECKBOX_TYPE_OPTIONS: ConfigSelectOption<CheckboxType>[];
/** Which side of the box its caption sits on, in `'single'` mode. */
declare const LABEL_POSITIONS: readonly ["right", "left"];
type LabelPosition = (typeof LABEL_POSITIONS)[number];
declare const LABEL_POSITION_OPTIONS: ConfigSelectOption<LabelPosition>[];
/**
 * What separates the ticked values in `'group'` mode.
 *
 * A field value is one string, so a group has to join its selections. The comma matches the date
 * renderer's `'multiple'` mode — and is why `CheckboxFieldConfigComponent` rejects an option value
 * containing one: the join would be unreadable on the way back.
 */
declare const CHECKBOX_VALUE_SEPARATOR = ",";
/**
 * What a `Checkbox` field's `fieldConfig` JSON deserialises to.
 *
 * Read by `CheckboxFieldInputComponent`, written by `CheckboxFieldConfigComponent`.
 *
 * **Half of these members belong to one mode and half to the other**, which is unusual here and
 * deliberate: `Checkbox` replaced the earlier `Boolean` and `CheckboxGroup` types, and folding two
 * config shapes into one is what lets an author flip between them without creating a second field.
 * The editor only ever shows the half that applies, and {@link CheckboxType} says which.
 */
interface CheckboxFieldConfig extends FieldConfigExtras {
    checkboxType: CheckboxType;
    /** The caption beside the box. PrimeNG's `p-checkbox` has no `label` input, so this is drawn
        by the renderer's own markup. Empty draws none, leaving the field's own label to do the
        work. */
    label: string;
    labelPosition: LabelPosition;
    /**
     * Offer "not set" as a third state, cycling unset → checked → unchecked.
     *
     * Worth having when the field is not required: a plain checkbox cannot express "nobody has
     * answered", so an untouched field and a deliberate "no" look identical both here and in the
     * stored data.
     */
    triState: boolean;
    /** What a checked box stores. */
    trueText: string;
    /** What an unchecked box stores. */
    falseText: string;
    /** Draw the box but refuse interaction, for a value shown as context rather than edited. */
    readonly: boolean;
    /** A PrimeIcons class overriding the tick (e.g. `pi pi-times`). Empty keeps the default. */
    checkboxIcon: string;
    /** The boxes the field offers. Empty renders nothing selectable, which is why
        `CheckboxFieldConfigComponent.isValid` requires at least one in this mode. */
    options: FieldChoiceOption[];
    orientation: ChoiceOrientation;
    /** What order the boxes are drawn in — see {@link sortChoiceOptions}. Applied at render time,
        so `options` above stays in the order it was authored. */
    sortChoices: ChoiceSort;
    /**
     * How many boxes must be ticked for the field to be complete, and how many may be. `0` on
     * either means "no bound".
     *
     * Advisory, not enforced on save: the backend types a field value as a free string and this app
     * cannot make it reject one. The renderer marks itself invalid, which is what a consuming site
     * would act on.
     */
    minSelected: number;
    maxSelected: number;
    /** Draw a "Select all" box above the options, ticking or clearing every one of them at once. */
    showToggleAll: boolean;
    size: FieldInputSize;
}
declare const DEFAULT_CHECKBOX_FIELD_CONFIG: CheckboxFieldConfig;
/**
 * The members belonging to whichever mode is *not* active, back at their defaults.
 *
 * Used by the editor when the author switches mode: the settings of the mode being left behind
 * are cleared rather than carried, so a group cannot be saved holding a stale `trueText` and a
 * single box cannot be saved holding options nothing renders.
 */
declare function clearedCheckboxModeSettings(checkboxType: CheckboxType): Partial<CheckboxFieldConfig>;
/** A saved checkbox config, defaulting every member it cannot read. */
declare function parseCheckboxFieldConfig(json: string | null, defaults: CheckboxFieldConfig): CheckboxFieldConfig;

/** Where `p-inputnumber` puts its spinner buttons when `showButtons` is on. */
declare const NUMBER_BUTTON_LAYOUTS: readonly ["stacked", "horizontal", "vertical"];
type NumberButtonLayout = (typeof NUMBER_BUTTON_LAYOUTS)[number];
declare const NUMBER_BUTTON_LAYOUT_OPTIONS: ConfigSelectOption<NumberButtonLayout>[];
/**
 * What happens to a value that has more precision than the field displays.
 *
 * `'none'` is the default and leaves the value exactly as typed — which is what every field did
 * before this setting existed, so adding it changes nothing until it is chosen. The other two
 * round at the field's `maxFractionDigits`, and unlike the display settings beside them they
 * change what is **stored**: a `Round up` field with no decimal places commits `3` for a typed
 * `2.4`.
 */
declare const NUMBER_ROUNDING_RULES: readonly ["none", "up", "down"];
type NumberRoundingRule = (typeof NUMBER_ROUNDING_RULES)[number];
declare const NUMBER_ROUNDING_RULE_OPTIONS: ConfigSelectOption<NumberRoundingRule>[];
/**
 * How a negative value is written.
 *
 * `'negative'` is the ordinary leading minus. `'parenthesis'` is the accounting convention —
 * `(1,234.00)` rather than `-1,234.00` — which is what finance-facing fields are usually expected
 * to use.
 */
declare const NUMBER_NEGATIVE_FORMATS: readonly ["negative", "parenthesis"];
type NumberNegativeFormat = (typeof NUMBER_NEGATIVE_FORMATS)[number];
declare const NUMBER_NEGATIVE_FORMAT_OPTIONS: ConfigSelectOption<NumberNegativeFormat>[];
/**
 * What a `Number` or `Decimal` field's `fieldConfig` JSON deserialises to.
 *
 * Both types share this renderer and differ only in what the registry seeds: `Number` starts with
 * `maxFractionDigits: 0` and `step: 1`, `Decimal` with two fraction digits and `step: 0.01`.
 * Neither is enforced — a `Number` field can be configured to accept decimals, because the
 * backend stores the value as a string either way and this app should not invent a constraint the
 * contract does not state.
 *
 * Read by `NumberFieldInputComponent`, written by `NumberFieldConfigComponent`.
 */
interface NumberFieldConfig extends FieldConfigExtras {
    /** Null means no bound. Constrains what the control accepts, not what the API does. */
    min: number | null;
    max: number | null;
    /** How much the spinner buttons and arrow keys move the value. */
    step: number;
    showButtons: boolean;
    buttonLayout: NumberButtonLayout;
    /** Draw thousands separators. Display only — the stored value is always plain digits, so this
        can change without rewriting anything. See `formatPlainNumber`. */
    useGrouping: boolean;
    /** Null leaves it to the locale. Both are display-side: a value of `1.5` shown with
        `minFractionDigits: 2` reads as `1.50` and is still stored as `1.5`. */
    minFractionDigits: number | null;
    maxFractionDigits: number | null;
    /**
     * Whether a value is rounded to {@link maxFractionDigits} when the control is left, and which
     * way.
     *
     * The one member here that is *not* display-only: it rewrites the value being saved. With
     * `maxFractionDigits` unset there is no configured precision to round at, so it rounds to whole
     * numbers — the plain meaning of rounding up or down.
     */
    roundingRule: NumberRoundingRule;
    /** Drawn inside the control, before the number (e.g. `%`, `kg`). Not part of the stored
        value — a field that later drops its prefix does not need its data rewritten. */
    prefix: string;
    suffix: string;
    placeholder: string;
    /** Offer a clear button, which sets the value back to "no value" rather than to zero. */
    showClear: boolean;
    /** Whether an empty control is allowed. Off forces a number to always be present, which for a
        field the user can leave blank is usually wrong — hence the default. */
    allowEmpty: boolean;
    /** A BCP 47 tag (e.g. `en-US`, `de-DE`) deciding the decimal and grouping separators the
        control *displays*. Empty follows the browser. The stored value is unaffected. */
    locale: string;
    /** How a negative value is written. Display only — the stored value keeps its minus sign
        whatever this says, so it can change without rewriting anything. */
    negativeFormat: NumberNegativeFormat;
    /** Draw a negative value in the error colour. Display only, and off by default: red is the
        app's colour for something being wrong, and a negative number usually isn't. */
    showNegativeInRed: boolean;
    size: FieldInputSize;
}
declare const DEFAULT_NUMBER_FIELD_CONFIG: NumberFieldConfig;
/** A saved number config, defaulting every member it cannot read. See `parseTextFieldConfig` for
    why `defaults` is a parameter — it is what separates `Number` from `Decimal`. */
declare function parseNumberFieldConfig(json: string | null, defaults: NumberFieldConfig): NumberFieldConfig;

/** How the currency is named alongside the amount. */
/**
 * How the currency is named beside the amount — the four `Intl.NumberFormat` currency displays.
 *
 * `symbol` and `narrowSymbol` differ in what they optimise for, and the difference is larger
 * than it sounds. `symbol` is the *unambiguous* form for the locale, so `CAD` reads `CA$` and
 * `AUD` reads `A$` — a bare `$` in an English context means US dollars. Where CLDR has no
 * convention for a currency in that locale it falls back to the ISO code, which is why `symbol`
 * yields a distinct glyph for only about 21 of the 155 codes offered. `narrowSymbol` asks for
 * the currency's own glyph instead and manages about 98 of them — `฿`, `zł`, `₦` — at the cost
 * of rendering `CAD`, `AUD`, `SGD` and friends as a plain `$`.
 *
 * Neither is strictly better, which is why both are offered and `symbol` stays the default.
 */
declare const CURRENCY_DISPLAYS: readonly ["symbol", "narrowSymbol", "code", "name"];
type CurrencyDisplay = (typeof CURRENCY_DISPLAYS)[number];
/**
 * The three ways the currency can be named beside the amount.
 *
 * Labelled by the mode alone. These used to carry a worked example each — `Symbol ($)`,
 * `Code (USD)`, `Name (US dollars)` — which read correctly only while the field was in dollars
 * and quietly lied for every other code. The config editor appends a live example built from the
 * chosen code and locale instead; see `CurrencyFieldConfigComponent.currencyDisplayOptions`.
 */
declare const CURRENCY_DISPLAY_OPTIONS: ConfigSelectOption<CurrencyDisplay>[];
/**
 * What a `Currency` field's `fieldConfig` JSON deserialises to.
 *
 * Its own shape rather than a flag on `NumberFieldConfig`, because a currency field has three
 * settings a plain number has no use for (`currency`, `currencyDisplay`, and a locale that
 * actually changes the symbol's position) and because the two are separate `fieldType`s on the
 * wire. The renderer is `p-inputnumber` in `mode="currency"` either way.
 *
 * **The stored value is the amount alone** — no symbol, no grouping (see `formatPlainNumber`). So
 * changing `currency` re-displays every stored amount in the new currency rather than converting
 * it: this config decides how a number is *drawn*, never what it is worth. A field that genuinely
 * changes currency needs its data migrated, which is not something this form can do.
 */
interface CurrencyFieldConfig extends FieldConfigExtras {
    /** An ISO 4217 code (e.g. `USD`, `EUR`, `PHP`). Required by `p-inputnumber` in currency mode —
        an empty or unknown code makes the control throw, so the config editor validates it. */
    currency: string;
    currencyDisplay: CurrencyDisplay;
    /** A BCP 47 tag (e.g. `en-US`, `de-DE`) deciding separators *and* where the symbol sits —
        `$1,234.50` against `1.234,50 $`. Empty follows the browser. */
    locale: string;
    /** Null means no bound. */
    min: number | null;
    max: number | null;
    step: number;
    useGrouping: boolean;
    /** Null leaves it to the currency's own convention, which is nearly always what you want —
        two digits for USD, none for JPY. */
    minFractionDigits: number | null;
    maxFractionDigits: number | null;
    showButtons: boolean;
    buttonLayout: NumberButtonLayout;
    placeholder: string;
    showClear: boolean;
    allowEmpty: boolean;
    size: FieldInputSize;
}
declare const DEFAULT_CURRENCY_FIELD_CONFIG: CurrencyFieldConfig;
/**
 * True for a well-formed ISO 4217 code.
 *
 * Shape only — three letters — not membership of the real list: `Intl` knows codes this check
 * cannot enumerate, and a hardcoded list would be this app refusing a currency the browser is
 * perfectly willing to format. The config editor uses it to warn, and
 * `CurrencyFieldInputComponent` uses it to fall back rather than let `p-inputnumber` throw on a
 * code `Intl.NumberFormat` rejects.
 */
declare function isCurrencyCodeShaped(code: string): boolean;
/** A saved currency config, defaulting every member it cannot read. */
declare function parseCurrencyFieldConfig(json: string | null, defaults: CurrencyFieldConfig): CurrencyFieldConfig;

/**
 * How many dates one value holds.
 *
 * This is the only config member that changes the *shape* of the value — `'single'` stores one
 * date, `'multiple'` a comma-separated list, `'range'` a `start/end` pair — so changing it on a
 * field that already holds data leaves stored values in a shape the new mode does not read. The
 * config editor warns about that, and `FieldDefinitionDetailComponent` locks `fieldType` on an
 * edit for the same family of reasons.
 */
declare const DATE_SELECTION_MODES: readonly ["single", "multiple", "range"];
type DateSelectionMode = (typeof DATE_SELECTION_MODES)[number];
declare const DATE_SELECTION_MODE_OPTIONS: ConfigSelectOption<DateSelectionMode>[];
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
declare const DATE_FORMAT_OPTIONS: ConfigSelectOption<string>[];
/**
 * A limit on the calendar relative to the day it is opened, rather than to a fixed date.
 *
 * The two are the cases a fixed bound cannot express: a date of birth is always in the past and
 * an appointment always ahead, whatever day the form is filled in. Both include today — a field
 * that refuses the current date is a rarer thing to want than one that accepts it, and `minDate`
 * or `maxDate` can still say so. Applied on top of the fixed bounds, never instead of them: see
 * `DateFieldInputComponent.minDate`.
 */
declare const DATE_LIMITS: readonly ["none", "future", "past"];
type DateLimit = (typeof DATE_LIMITS)[number];
declare const DATE_LIMIT_OPTIONS: ConfigSelectOption<DateLimit>[];
/** Which panel the picker opens on — `'month'` and `'year'` skip straight to those. */
declare const DATE_VIEWS: readonly ["date", "month", "year"];
type DateView = (typeof DATE_VIEWS)[number];
declare const DATE_VIEW_OPTIONS: ConfigSelectOption<DateView>[];
declare const HOUR_FORMATS: readonly ["12", "24"];
type HourFormat = (typeof HOUR_FORMATS)[number];
declare const HOUR_FORMAT_OPTIONS: ConfigSelectOption<HourFormat>[];
/** Whether the calendar icon sits inside the input or as a button beside it. */
declare const DATE_ICON_DISPLAYS: readonly ["input", "button"];
type DateIconDisplay = (typeof DATE_ICON_DISPLAYS)[number];
declare const DATE_ICON_DISPLAY_OPTIONS: ConfigSelectOption<DateIconDisplay>[];
/**
 * What a `DatePicker` field's `fieldConfig` JSON deserialises to.
 *
 * One shape for a date with or without a time: `showTime` is what separates them, which is why
 * the earlier `Date` and `DateTime` field types collapsed into this one. `showTime` also
 * decides the stored format — `2026-09-11` against `2026-09-11T14:30:00` — so it is read by the
 * codec as well as by the control. See `formatLocalDate` for why neither carries a timezone.
 *
 * Read by `DateFieldInputComponent`, written by `DateFieldConfigComponent`.
 */
interface DateFieldConfig extends FieldConfigExtras {
    /**
     * How the selected date is written in the input.
     *
     * **PrimeNG's tokens, not Angular's `DatePipe` tokens**: `mm/dd/yy` means a 2-digit month, a
     * 2-digit day and a 4-digit year, where `DatePipe` would read `yy` as 2 digits. Display only —
     * it never affects the stored value, which is always ISO-shaped.
     *
     * Typed as a free string rather than a union of {@link DATE_FORMAT_OPTIONS}: the editor offers
     * that list alone, but configs written before it existed hold formats that are not on it and
     * are kept rather than rewritten.
     */
    dateFormat: string;
    /** Also selects the stored format, so changing it on a field with data leaves the old values
        readable but truncated to midnight. */
    showTime: boolean;
    hourFormat: HourFormat;
    showSeconds: boolean;
    /** How many minutes the time spinner moves per step. */
    stepMinute: number;
    showIcon: boolean;
    iconDisplay: DateIconDisplay;
    selectionMode: DateSelectionMode;
    /** Bounds the calendar against the day it is opened — see {@link DATE_LIMITS}. */
    dateLimit: DateLimit;
    /**
     * Whether the fixed bounds below apply at all.
     *
     * Off by default, and the renderer ignores `minDate`/`maxDate` while it is — so the two keep
     * whatever was typed into them and come back unchanged when it is switched on again, the same
     * bargain `TextFieldConfig.prefix` strikes with its mode.
     */
    restrictDateRange: boolean;
    /** `YYYY-MM-DD`, or empty for no bound. Stored as text rather than a `Date` so the config
        round-trips through JSON unchanged; converted to a `Date` at the binding. */
    minDate: string;
    maxDate: string;
    /** How many months the panel shows side by side. Most useful with `selectionMode: 'range'`. */
    numberOfMonths: number;
    /** Show the Today and Clear buttons under the calendar. */
    showButtonBar: boolean;
    showClear: boolean;
    /** Force the date to be chosen from the calendar rather than typed. */
    readonlyInput: boolean;
    /** Draw the calendar always-open, in place, instead of as an overlay. */
    inline: boolean;
    view: DateView;
    placeholder: string;
}
declare const DEFAULT_DATE_FIELD_CONFIG: DateFieldConfig;
/** A saved date config, defaulting every member it cannot read. See `parseTextFieldConfig` for
    why `defaults` is a parameter — it is what lets the retired `DateTime` type still open with
    time switched on. */
declare function parseDateFieldConfig(json: string | null, defaults: DateFieldConfig): DateFieldConfig;

/**
 * Every offered extension, flattened and in menu order — what a saved value is validated against,
 * and what "all of them" means.
 *
 * The order matters beyond display: {@link parseFileExtensions} answers in it, so a stored
 * selection reads back grouped the way the menu presents it however it was written.
 */
declare const MEDIA_FILE_EXTENSIONS: readonly string[];
/**
 * A `Media` field's extension.
 *
 * `string` rather than a union of ninety-odd literals, unlike every other option-typed config
 * member here. The list is data an admin will keep adding to — it already changed once — and a
 * literal union would turn each addition into a type that every `switch` and comparison has to be
 * rechecked against, for a guarantee {@link parseFileExtensions} already enforces at the only
 * point a value enters. See {@link MEDIA_FILE_EXTENSIONS}.
 */
type MediaFileExtension = string;
/** The dropdown's own shape, grouped. Mutable arrays because `p-select`'s `options` input is. */
declare const MEDIA_FILE_EXTENSION_OPTIONS: ConfigSelectOptionGroup<MediaFileExtension>[];
/**
 * How large the placeholder is drawn.
 *
 * Deliberately **not** `FIELD_INPUT_SIZES` from `field-definition-type-common.model.ts`, which the
 * six other configs share — even though the two now spell the same three values. That one is
 * handed to a PrimeNG control's `size` input, whose vocabulary is `'small' | 'large' | undefined`,
 * so its `'medium'` is translated away at the binding and exists to give the theme's own size a
 * name. A `Media` field draws an icon rather than a PrimeNG control: every value here is applied
 * as a CSS class of its own, and `'medium'` is a size this file defines rather than one it defers
 * on. Sharing the constant would tie a glyph scale to whatever PrimeNG's control scale does next.
 */
declare const MEDIA_PREVIEW_SIZES: readonly ["small", "medium", "large"];
type MediaPreviewSize = (typeof MEDIA_PREVIEW_SIZES)[number];
declare const MEDIA_PREVIEW_SIZE_OPTIONS: ConfigSelectOption<MediaPreviewSize>[];
/**
 * What a `Media` field's `fieldConfig` JSON deserialises to.
 *
 * Read by `MediaFieldInputComponent`, written by `MediaFieldConfigComponent`.
 *
 * Every member here is a *declaration about the slot* rather than a display setting, which is what
 * separates this config from its neighbours: `MediaFieldInputComponent` draws a placeholder and
 * accepts no file, so nothing below is enforced by this app yet. They are recorded so the field
 * definition states its own contract, and so whatever eventually uploads against it has the answer
 * already saved.
 */
interface MediaFieldConfig extends FieldConfigExtras {
    /**
     * The extensions this slot accepts.
     *
     * Always held in {@link MEDIA_FILE_EXTENSIONS} order, never in the order they were ticked, so
     * two fields accepting the same set store the same string. Every extension selected is how a
     * slot says "any file" — see {@link MEDIA_FILE_EXTENSION_GROUPS} for why there is no `'all'`
     * sentinel. Empty is rejected by the editor: a slot that accepts nothing is not a slot.
     */
    fileExtensions: MediaFileExtension[];
    /** The cap, in megabytes. Always a number — unlike `NumberFieldConfig.max` there is no "no
        limit" here, since an uncapped upload slot is not something a field should be able to
        declare by leaving a box empty. `MediaFieldConfigComponent` rejects zero and below. */
    maxFileSizeMb: number;
    previewSize: MediaPreviewSize;
    /**
     * The kinds of media this slot is for, authored as label/value pairs.
     *
     * Authored rather than picked from a fixed list, because what counts as a "type" here is the
     * account's own vocabulary — Hero Image, Floor Plan, Walkthrough — not something this app can
     * enumerate ahead of time. That is why the editor reuses `FieldOptionsEditorComponent` and the
     * validity rules `RadioFieldConfigComponent` and `SelectFieldConfigComponent` already apply to
     * their own choices: at least one entry, every entry with a stored value, no two sharing one.
     *
     * `value` is what gets stored and `label` only what is shown — see {@link FieldChoiceOption}.
     */
    fieldTypeOptions: FieldChoiceOption[];
}
declare const DEFAULT_MEDIA_FIELD_CONFIG: MediaFieldConfig;
/** A saved media config, defaulting every member it cannot read. See `parseTextFieldConfig` for
    why `defaults` is a parameter. */
declare function parseMediaFieldConfig(json: string | null, defaults: MediaFieldConfig): MediaFieldConfig;

/**
 * What a `RadioButton` field's `fieldConfig` JSON deserialises to.
 *
 * Read by `RadioFieldInputComponent`, written by `RadioFieldConfigComponent`. This is the one
 * config of the seven that can be *empty in a way that matters*: a radio field with no options
 * renders nothing a user can pick, so `RadioFieldConfigComponent.isValid` requires at least one
 * and the host's submit guard blocks the save.
 */
interface RadioFieldConfig extends FieldConfigExtras {
    options: FieldChoiceOption[];
    orientation: ChoiceOrientation;
    /** What order the buttons are drawn in — see {@link sortChoiceOptions}. Applied at render time,
        so `options` above stays in the order it was authored. */
    sortChoices: ChoiceSort;
    /**
     * Offer a way back to "nothing selected".
     *
     * Radio buttons have no native way to deselect, so without this a user who picks a value by
     * mistake cannot undo it — the field goes from empty to permanently answered on the first
     * click. Worth having on any field that is not required.
     */
    allowClear: boolean;
    /**
     * Draw the choices as buttons on one track instead of radio buttons. The selected choice is a
     * filled button; the others stay as labels beside it. Always side by side, so `orientation` is
     * ignored while this is on.
     */
    buttonType: boolean;
    size: FieldInputSize;
}
declare const DEFAULT_RADIO_FIELD_CONFIG: RadioFieldConfig;
/** A saved radio config, defaulting every member it cannot read. */
declare function parseRadioFieldConfig(json: string | null, defaults: RadioFieldConfig): RadioFieldConfig;

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
declare const SELECT_MODES: readonly ["single", "multiple"];
type SelectMode = (typeof SELECT_MODES)[number];
declare const SELECT_MODE_OPTIONS: ConfigSelectOption<SelectMode>[];
/**
 * What separates the picked values in `'multiple'` mode.
 *
 * A field value is one string, so a multi-pick has to join its selections. The comma matches
 * `CHECKBOX_VALUE_SEPARATOR` and the date renderer's `'multiple'` mode — and is why
 * `SelectFieldConfigComponent` rejects an option value containing one: the join would be
 * unreadable on the way back.
 */
declare const SELECT_VALUE_SEPARATOR = ",";
/**
 * What a `Dropdown` field's `fieldConfig` JSON deserialises to.
 *
 * Read by `SelectFieldInputComponent`, written by `SelectFieldConfigComponent`. Like
 * `RadioFieldConfig` it can be *empty in a way that matters*: a dropdown with no options opens on
 * an empty panel, so `SelectFieldConfigComponent.isValid` requires at least one and the host's
 * submit guard blocks the save.
 *
 * No `orientation`, unlike the other two options-based configs — a dropdown has no layout axis to
 * choose. Everything here applies to both modes except the two noted below, which exist because
 * PrimeNG puts the same idea on a different input in each component.
 */
interface SelectFieldConfig extends FieldConfigExtras {
    selectionMode: SelectMode;
    /** The choices this field offers. Empty renders an empty panel, which is why
        `SelectFieldConfigComponent.isValid` requires at least one. */
    options: FieldChoiceOption[];
    /** What order the choices are listed in — see {@link sortChoiceOptions}. Applied at render time,
        so `options` above stays in the order it was authored. */
    sortChoices: ChoiceSort;
    /** What the closed control reads when nothing is picked. Empty leaves PrimeNG's own default. */
    placeholder: string;
    /**
     * Offer the built-in clear icon.
     *
     * The dropdown equivalent of `RadioFieldConfig.allowClear`, and needed for the same reason: a
     * user who picks by mistake otherwise cannot get back to "nothing selected". Native to both
     * controls here, so no extra button is drawn.
     */
    showClear: boolean;
    /** Offer a type-ahead box in the panel. The reason a dropdown beats radio buttons on a long
        list, and pointless on a short one. */
    filter: boolean;
    /** What the type-ahead box reads when empty. Only drawn when {@link filter} is set. */
    filterPlaceholder: string;
    /** Mark the picked option with a tick in the panel. `p-select` only — `p-multiselect` shows a
        checkbox per row and has no such input. */
    checkmark: boolean;
    /** Tint the picked rows in the panel. `p-multiselect` only — `p-select` has no such input. */
    highlightOnSelect: boolean;
    size: FieldInputSize;
}
/** Defaults match PrimeNG's own for {@link SelectFieldConfig.checkmark} and
    {@link SelectFieldConfig.highlightOnSelect}, so an unconfigured field looks like a stock
    control rather than a deliberately restyled one. */
declare const DEFAULT_SELECT_FIELD_CONFIG: SelectFieldConfig;
/** A saved select config, defaulting every member it cannot read. */
declare function parseSelectFieldConfig(json: string | null, defaults: SelectFieldConfig): SelectFieldConfig;

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
declare const TEXT_INPUT_TYPES: readonly ["text", "email", "tel", "url", "password"];
type TextInputType = (typeof TEXT_INPUT_TYPES)[number];
/**
 * What the Input Type menu offers.
 *
 * `'email'` and `'url'` also turn on format validation — see `textValueFormatError`. Email was
 * once left off this list as a duplicate of the `Email` field type; with that type retired in
 * favour of `Text`, this menu is the only way to ask for an email field, so it is back.
 */
declare const TEXT_INPUT_TYPE_OPTIONS: ConfigSelectOption<TextInputType>[];
/**
 * Names for input types no longer on the menu above, so a saved config holding one still shows it.
 *
 * A `p-select` renders nothing for a value none of its options carry, so without this a field
 * holding a retired input type would open showing an empty Input Type. Empty while every type is
 * offered; kept as the place to put one if a type is retired again. Mirrors
 * `RETIRED_FIELD_TYPE_LABELS`, which does the same for the Type menu on the Metadata tab.
 */
declare const RETIRED_TEXT_INPUT_TYPE_LABELS: Partial<Record<TextInputType, string>>;
/**
 * What a text field carries on one of its edges.
 *
 * `'none'` is the default and the reason the value member beside it can be ignored entirely:
 * an affix that is switched off keeps whatever was last typed into it, so flipping Text → None →
 * Text does not cost the user their wording. Only the mode decides what is drawn.
 */
declare const TEXT_AFFIX_MODES: readonly ["none", "text", "icon"];
type TextAffixMode = (typeof TEXT_AFFIX_MODES)[number];
declare const TEXT_AFFIX_MODE_OPTIONS: ConfigSelectOption<TextAffixMode>[];
/**
 * What a text field's `fieldConfig` JSON deserialises to.
 *
 * Read by `TextFieldInputComponent` (which draws the control) and written by
 * `TextFieldConfigComponent` (which authors the settings). A model rather than part of either
 * component, following the same convention as the older `esri-map-field-config.model.ts` and its
 * neighbours one directory up: a field type's config shape outlives the form that edits it.
 */
interface TextFieldConfig extends FieldConfigExtras {
    inputType: TextInputType;
    placeholder: string;
    /** Null means no limit. Enforced by the browser as `maxlength`, so it cannot reject a value
        the API would have accepted — it only stops one being typed. */
    maxLength: number | null;
    /** Whether the left edge carries nothing, a word, or an icon. */
    prefixMode: TextAffixMode;
    /**
     * What that edge carries: literal text when `prefixMode` is `'text'`, a PrimeIcons class (e.g.
     * `pi pi-user`) when it is `'icon'`, and ignored when it is `'none'`.
     *
     * One member for both because they are the same slot — a currency marker and a magnifier are
     * alternatives, not things a field has at once — and because two members would let a saved
     * config disagree with itself about which is showing.
     */
    prefix: string;
    /** As {@link prefixMode}, on the right edge. */
    suffixMode: TextAffixMode;
    /** As {@link prefix}, on the right edge. */
    suffix: string;
    /**
     * Whether a `'password'` field draws the eye that reveals what has been typed.
     *
     * Ignored for every other `inputType`, where there is nothing to reveal. True by default: a
     * field whose characters are hidden and cannot be checked is one users mistype, and hiding them
     * was never a security measure here anyway — see {@link TEXT_INPUT_TYPES}.
     *
     * The eye sits where a suffix would, so it takes that edge: with this on, {@link suffixMode} is
     * not drawn and not offered. Turning it off gives the edge back.
     */
    showToggleVisibility: boolean;
    /**
     * A PrimeNG input mask (e.g. `(999) 999-9999`), which swaps the plain input for a
     * `p-inputmask`. Empty — the default — keeps the plain input.
     *
     * **Only applied when `inputType` is `'tel'`**, which is the one type it was ever useful on: a
     * mask over an email address or a URL fights the browser's own validation, and one over a
     * password stops it being typed at all. A config saved with both keeps its mask — the member is
     * read and written as always — but the mask lies dormant until the type is `'tel'` again, and
     * the editor only offers it there.
     *
     * Worth knowing before setting one: a mask constrains what can be typed but the *value* is
     * still stored as a plain string, so a field whose mask changes later does not rewrite what is
     * already stored.
     */
    mask: string;
    /** Whether a Clear button is drawn beside the control once it holds a value — this renderer's
        own affordance rather than a native one, since `pInputText` is a directive over a plain
        `<input>` with nothing built in. See `TextFieldInputComponent`. */
    showClear: boolean;
    size: FieldInputSize;
}
declare const DEFAULT_TEXT_FIELD_CONFIG: TextFieldConfig;
/**
 * A saved text-field config, defaulting every member it cannot read.
 *
 * `defaults` is a parameter rather than the constant above because the registry seeds a different
 * starting config per `fieldType` — an `Email` field's default `inputType` is `'email'`, not
 * `'text'` — and a saved config missing a member should fall back to *that type's* default, not
 * the kind's. Never throws; see `readConfigSource`.
 */
declare function parseTextFieldConfig(json: string | null, defaults: TextFieldConfig): TextFieldConfig;

/**
 * What a `TextArea` field's `fieldConfig` JSON deserialises to.
 *
 * Read by `TextareaFieldInputComponent` and written by `TextareaFieldConfigComponent`. Kept
 * separate from `TextFieldConfig` despite the overlap: a textarea has no input type, no icons and
 * no mask, and has `rows` and `autoResize` instead. Sharing one shape would mean six members that
 * do nothing on one of the two renderers, which is how a config UI starts lying about what it
 * controls.
 */
interface TextareaFieldConfig extends FieldConfigExtras {
    placeholder: string;
    /** Visible height in lines, before any scrolling or auto-resizing. */
    rows: number;
    /** Null means no limit. Browser-enforced as `maxlength`. */
    maxLength: number | null;
    /** Grow to fit the content as the user types, rather than scrolling within `rows`. */
    autoResize: boolean;
    /** Whether a Clear button is drawn beneath the control once it holds a value — this renderer's
        own affordance rather than a native one, since `pTextarea` is a directive over a plain
        `<textarea>` with nothing built in. See `TextareaFieldInputComponent`. */
    showClear: boolean;
    size: FieldInputSize;
    /**
     * Draw a rich-text box with a five-button toolbar (bold, italic, underline, bulleted and numbered
     * lists) instead of a plain `<textarea>`, and store the value as sanitized HTML. See
     * `RichTextEditorComponent`.
     *
     * `rows` still sets the box's height. `placeholder`, `maxLength`, `autoResize` and `showClear`
     * apply only to the plain textarea — the rich box always grows to fit, and a character limit
     * measured against markup would count tags the person typing never sees.
     */
    wysiwyg: boolean;
}
/** Matches the `rows="5"` the raw-JSON textarea this renderer replaces has always used. */
declare const DEFAULT_TEXTAREA_FIELD_CONFIG: TextareaFieldConfig;
/** A saved textarea config, defaulting every member it cannot read. See `parseTextFieldConfig`
    for why `defaults` is a parameter. */
declare function parseTextareaFieldConfig(json: string | null, defaults: TextareaFieldConfig): TextareaFieldConfig;

/**
 * The renderer primitives this app can draw a field's value with.
 *
 * A *kind* is not a `fieldType`. Several wire types share one kind, differing only in the default
 * config the registry seeds them with: `Text`, `Email`, `Phone` and `Url` are all `'text'`;
 * `Number` and `Decimal` are both `'number'`; `DatePicker` and the retired `Date`/`DateTime` pair
 * are all `'date'`; and every retired type shares a kind with whatever replaced it — `Select`
 * with `RadioButton`, `MultiSelect` and `Boolean` with `Checkbox`. That split is the whole reason
 * `FIELD_DEFINITION_TYPE_RENDERERS` is keyed by `fieldType` while everything below it is keyed by
 * kind — nineteen wire types from nine components. `Media` is one of the ones that does not
 * share: it is the only wire type of its kind, as is `Dropdown`.
 *
 * No Angular import in this file, matching `field-definition.model.ts`: the component types live
 * in `shared/ui/field-definition-types/field-renderer-contract.ts`, which is where Angular enters.
 */
type FieldRendererKind = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'checkbox' | 'radio' | 'select' | 'media';
/**
 * The config each kind's renderer and config editor agree on — the one place that pairing is
 * written down.
 *
 * Keying it here rather than repeating it per descriptor is what makes a mismatch a compile
 * error: a descriptor claiming `kind: 'date'` cannot be given `TextFieldConfig`, and a renderer
 * typed for `DateFieldConfig` cannot be registered under `'text'`.
 */
interface FieldRendererConfigMap {
    text: TextFieldConfig;
    textarea: TextareaFieldConfig;
    number: NumberFieldConfig;
    currency: CurrencyFieldConfig;
    date: DateFieldConfig;
    checkbox: CheckboxFieldConfig;
    radio: RadioFieldConfig;
    select: SelectFieldConfig;
    media: MediaFieldConfig;
}
/**
 * What each kind edits *in memory*.
 *
 * None of this reaches the API. A field value is a `string` on the wire for every type — see
 * `CreatePageFieldValueRequest.value`, "always a string ... whatever the field definition's
 * declared type" — and a descriptor's {@link FieldValueCodec} is the only thing that crosses that
 * line. These are the types the PrimeNG controls themselves work in.
 *
 * `null` means "no value" throughout, and is not the same as `''`: for `text` an empty string is
 * something the user typed and then cleared, while for `number` there is no number at all.
 */
interface FieldRendererValueMap {
    text: string;
    textarea: string;
    number: number | null;
    currency: number | null;
    date: DateFieldValue;
    checkbox: CheckboxFieldValue;
    radio: string | null;
    select: SelectFieldValue;
    /**
     * A string this app neither reads nor writes — `MediaFieldInputComponent` is a placeholder with
     * no control on it, so nothing ever produces a media value here.
     *
     * Typed as the wire's own shape rather than as `never` or `null` precisely because of that: with
     * an identity codec, whatever is stored against a Media field passes through untouched and is
     * never flagged by `FieldInputComponent.storedValueUnreadable`. A narrower type would make the
     * renderer's inability to read a value look like the value being unreadable.
     */
    media: string;
}
/**
 * A date field's in-memory value.
 *
 * An array only when `DateFieldConfig.selectionMode` is `'multiple'` or `'range'` — which is
 * `p-datepicker`'s own convention, not one invented here, and the reason `selectionMode` is read
 * by the codec as well as by the control.
 *
 * The array's members are nullable because a range is two slots that fill one at a time: while
 * the user has picked a start and not an end, `p-datepicker` holds `[start, null]`. Typing that
 * honestly here rather than casting it away is what lets a half-picked range round-trip through
 * the codec as `2026-01-01/` instead of collapsing into a single date.
 */
type DateFieldValue = Date | (Date | null)[] | null;
/**
 * A checkbox field's in-memory value, which is two types in one — and deliberately so.
 *
 * `CheckboxFieldConfig.checkboxType` decides which: `'single'` holds a tri-state boolean, where
 * null means "not set" and is not the same as false; `'group'` holds the list of ticked values, an
 * array even when empty, because PrimeNG's non-binary checkbox filters the model in place on every
 * click and would throw on a null.
 *
 * A union rather than two kinds because `Checkbox` is one field type an author flips between
 * modes — see `CheckboxType`. Everything that touches the value therefore has to read the config
 * first, which is exactly what {@link FieldValueCodec} passes it for.
 */
type CheckboxFieldValue = boolean | null | string[];
/**
 * A select field's in-memory value, two shapes in one for the same reason `CheckboxFieldValue` is.
 *
 * `SelectFieldConfig.selectionMode` decides which: `'single'` holds the one picked value, or null
 * for nothing picked; `'multiple'` holds the list of picked values, **an array even when empty**,
 * because `p-multiselect` derives its next value as `modelValue().filter(...)` — so deselecting an
 * option against a null model throws.
 *
 * A union rather than two kinds because `Dropdown` is one field type an author flips between
 * modes. Everything that touches the value therefore has to read the config first, which is
 * exactly what {@link FieldValueCodec} passes it for.
 */
type SelectFieldValue = string | string[] | null;
/**
 * A checkbox field's in-memory value, which is two types in a trench coat — and deliberately so.
 *
 * `CheckboxFieldConfig.checkboxType` decides which: `'single'` holds a tri-state boolean, where
 * null is "not set" and is not the same as false; `'group'` holds the list of ticked values, an
 * array even when empty because PrimeNG's non-binary checkbox filters the model in place on every
 * click and would throw on a null.
 *
 * A union rather than two kinds because `Checkbox` is one field type an author can flip between
 * modes — see `CheckboxType`. Everything that touches it therefore has to read the config first,
 * which is exactly what `FieldValueCodec` passes it for.

/**
 * How one kind moves between its in-memory value and the single string the wire holds.
 *
 * `config` is a parameter of both halves because the format is a property of the *field*, not of
 * the kind: a date field with `showTime` off stores `2026-09-11` and one with it on stores
 * `2026-09-11T14:30:00`, and a checkbox field stores whatever `trueText`/`falseText` its author
 * chose.
 *
 * Two rules every implementation must hold to:
 *
 * 1. **Neither half may throw.** A stored value is a fact about data this app did not necessarily
 *    write, so `deserialize` answers with the kind's empty value and lets the renderer say the
 *    value was unreadable.
 * 2. **Round-trip stability** — `serialize(deserialize(serialize(v))) === serialize(v)`. This is
 *    what keeps `FieldInputComponent`'s write-back from oscillating, since it hands a renderer's
 *    own output straight back to it.
 */
interface FieldValueCodec<TValue, TConfig> {
    serialize(value: TValue, config: TConfig): string;
    deserialize(raw: string, config: TConfig): TValue;
}

/**
 * What every field-input renderer implements.
 *
 * Declared as an interface of signal members rather than a base class: this repo has no component
 * inheritance anywhere, and `implements` costs nothing at runtime while still making a renderer
 * that forgets `disabled` a compile error.
 *
 * Every member must be a plain `input()`/`model()` — never `input()` with a transform, since
 * `InputSignalWithTransform` is not assignable to `InputSignal` and the interface would silently
 * stop matching.
 *
 * Note what is *not* here: `label` and `showLabel`. The label is drawn once by
 * `FieldInputComponent` rather than eight times by the renderers, which is also why `fieldKey` is
 * here — the facade's `<label for>` needs to name the control's own id.
 * `CheckboxFieldConfig.label` is a different thing: the caption beside the box, which only that
 * renderer has.
 */
interface FieldRenderer<TConfig, TValue> {
    /** The field's parsed config. Always complete — every `parse*` defaults every member. */
    readonly config: InputSignal<TConfig>;
    /**
     * The value being edited.
     *
     * A `model()` so a renderer is usable on its own with `[(value)]` on any page. The facade does
     * not use that binding: it binds the input half and listens to `valueChange` separately, so
     * that it writes back only when the renderer actually emits. See `FieldInputComponent.commit`.
     */
    readonly value: ModelSignal<TValue>;
    /** Used as the control's `id`, so the facade's label can point at it and two renderers on one
        page cannot collide. */
    readonly fieldKey: InputSignal<string>;
    readonly required: InputSignal<boolean>;
    readonly disabled: InputSignal<boolean>;
    readonly invalid: InputSignal<boolean>;
    /**
     * Fires when the control loses focus. Optional — a renderer that has nothing useful to say about
     * focus simply omits it, and the facade binds it only where it exists.
     *
     * It carries no payload: a consumer that wants the value reads `value`, which by then holds
     * whatever the blur settled on. That ordering is the point of this output. `number` rounds on
     * blur and `date` repaints on blur, so both **must** emit *after* their own blur handling — a
     * consumer saving on this signal would otherwise persist the mid-edit value rather than the
     * settled one.
     *
     * Exists because `valueChange` fires per keystroke: a consumer that wants to act once the user
     * is done — autosave being the motivating case — has no other signal to wait for.
     */
    readonly blurred?: OutputEmitterRef<void>;
}
/**
 * One registry entry, fully typed — what a factory returns.
 *
 * The `K` parameter is what ties the three halves together: the component, the config it reads
 * and the value its codec writes all come from the same kind, so a descriptor claiming
 * `kind: 'date'` cannot be handed a text renderer or a number codec.
 */
interface FieldRendererDescriptor<K extends FieldRendererKind> extends FieldValueCodec<FieldRendererValueMap[K], FieldRendererConfigMap[K]> {
    readonly kind: K;
    readonly renderer: Type<FieldRenderer<FieldRendererConfigMap[K], FieldRendererValueMap[K]>>;
    /**
     * This `fieldType`'s starting config — not the kind's.
     *
     * `Email` and `Text` share the `'text'` renderer but not this, which is what lets one component
     * serve four wire types. Also what `parse` falls back to for a config it cannot read.
     */
    readonly defaultConfig: FieldRendererConfigMap[K];
    /**
     * Whether the Config tab previews this type's control. Defaults to true when omitted, so every
     * descriptor that says nothing keeps the behaviour it has.
     *
     * Only worth setting false for a renderer whose output does not answer the question the preview
     * exists to answer — "how will this field be drawn with these settings". `Media` is the case:
     * it draws a fixed placeholder glyph and edits nothing, so its preview restates the field type
     * rather than reflecting the config beside it.
     *
     * The card itself is still drawn either way — `FieldConfigLayoutComponent` keeps the two-column
     * shell for every type on purpose, so stepping the type dropdown does not reflow the screen.
     * What this drops is the live control inside it, leaving the layout's own "No preview
     * available" fallback.
     */
    readonly hasPreview?: boolean;
    parse(json: string | null): FieldRendererConfigMap[K];
    /**
     * The wire value as it should be *read*, when that differs from how it is stored — the
     * `valueFormatted` half of a custom object field value, where `"active"` is stored and
     * `"Active"` is shown.
     *
     * Takes the wire string rather than the in-memory value on purpose: the display form is a
     * per-value mapping rather than a re-rendering, so there is no deserialize round trip to make —
     * and a stored value the renderer cannot read passes through untouched, matching the rule that
     * nothing here ever repairs a value it did not write.
     *
     * Declared by every descriptor whose config describes how the value should *read* — the choice
     * types map a stored option value to its authored label, `number` and `currency` apply
     * grouping, fraction digits, affixes and the ISO code, and `date` writes the picker's own
     * `dateFormat`. Omitted by the descriptors whose stored value is already its display form:
     * plain text, textarea and media store exactly what is shown, a single checkbox already
     * serialises to its own `trueText`/`falseText`, and a masked `Phone` field stores the mask
     * literals with the digits, because `p-inputmask` runs with `unmask` off.
     *
     * **A formatted copy can go stale, and that is accepted rather than avoided.** Nothing rewrites
     * stored rows, so renaming an option from "Active" to "Live", or switching a currency from USD
     * to EUR, leaves every value already written still reading the old way until it is saved again.
     * The alternative is worse: declining to format would make every `valueFormatted` in the system
     * a copy of its `value`, and the member pointless. Reading the display form back out of the
     * config on every render is not open to us either — `valueFormatted` is a member of the wire
     * contract that a consuming app has to *send*, not a view concern it can compute at display time.
     */
    readonly format?: (raw: string, config: FieldRendererConfigMap[K]) => string;
}
/**
 * The same entry with every type parameter gone — what the registry stores and the two facades
 * hold.
 *
 * This exists because the dispatch boundary is where static typing genuinely ends. Angular's
 * `createComponent` is generic in the component type, and `Type<FieldRenderer<TextFieldConfig,
 * string>>` is not assignable to any widened form of itself (`InputSignal<T>` is invariant), so
 * something has to be erased for one variable to hold all eight. Rather than let that leak into
 * both facades and seven call sites, it happens exactly once — in {@link eraseFieldRenderer},
 * next to the types that justify it.
 *
 * `Type<unknown>` is enough for the renderer precisely because the facade binds by *name* through
 * `inputBinding`/`outputBinding` and never touches `ref.instance`. The editor is read back
 * through {@link FieldConfigEditorHandle}, which needs no type parameter.
 */
interface ErasedFieldRendererDescriptor {
    readonly kind: FieldRendererKind;
    readonly renderer: Type<unknown>;
    readonly defaultConfig: unknown;
    /** See {@link FieldRendererDescriptor.hasPreview}. Undefined means true. */
    readonly hasPreview?: boolean;
    parse(json: string | null): unknown;
    serialize(value: unknown, config: unknown): string;
    deserialize(raw: string, config: unknown): unknown;
    /** See {@link FieldRendererDescriptor.format}. Undefined means the stored value reads as is. */
    readonly format?: (raw: string, config: unknown) => string;
}
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
declare function eraseFieldRenderer<K extends FieldRendererKind>(descriptor: FieldRendererDescriptor<K>): ErasedFieldRendererDescriptor;
/**
 * The input and output names the facades bind by.
 *
 * Collected here because this is the one part of the dispatch the compiler cannot check: bindings
 * are addressed by string, so a typo surfaces as a dev-mode "Can't set value of the 'x' input"
 * warning at runtime rather than as a build error. Naming them once means eight renderers and two
 * facades cannot disagree about the spelling, and `FieldRenderer` above is the declaration they
 * are checked against by eye.
 */
declare const RENDERER_BINDINGS: {
    readonly config: "config";
    readonly value: "value";
    /** The output half of `value`'s `model()` — Angular's own naming convention. */
    readonly valueChange: "valueChange";
    readonly fieldKey: "fieldKey";
    readonly required: "required";
    readonly disabled: "disabled";
    readonly invalid: "invalid";
    /** See {@link FieldRenderer.blurred}. Optional on the interface, so binding it is conditional. */
    readonly blurred: "blurred";
};

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
/**
 * `2026-09-11` — a date with no time and no timezone, built from the date's **local** parts.
 *
 * Local rather than `toISOString()`, which is UTC: a date-only field picked as the 1st in any
 * negative-offset zone would store the 31st of the previous month, and the user would watch their
 * date change on save. A date-only value has no instant to be correct about, so the only sensible
 * reading is the one the user saw in the picker.
 */
declare function formatLocalDate(date: Date): string;
/**
 * `2026-09-11T14:30:00` — naive, with **no offset and no `Z`**.
 *
 * Matches the shape the platform's own timestamps already use (see {@link DATE_TIME_PATTERN}) and
 * avoids the day shift described on {@link formatLocalDate}. The cost is that a value is only
 * unambiguous alongside the zone it was entered in, which is the tradeoff the backend has already
 * made for its own timestamps.
 */
declare function formatLocalDateTime(date: Date): string;
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
declare function parseLocalDateish(raw: string): Date | null;
/**
 * A date written out under a PrimeNG `dateFormat` — `2026-09-11` as `09/11/2026`.
 *
 * The read-side counterpart to {@link formatLocalDate}: that writes the wire form, this writes the
 * form a person reads, which is what a field value's `valueFormatted` carries beside its `value`.
 * `p-datepicker` does this internally for its own input and exposes no way to ask it, so the
 * tokens are walked here.
 *
 * Covers the tokens the five entries of `DATE_FORMAT_OPTIONS` use, plus the two-digit `y` and
 * short `M` for a config saved before that list was closed. An unrecognised character is copied
 * through, and `'...'` quotes a literal, both matching PrimeNG's own reading — so a format this
 * does not fully understand degrades to something close rather than to nothing.
 *
 * Never throws and never returns an empty string for a real date, per the rules at the top of
 * this file.
 */
declare function formatDateByPattern(date: Date, format: string, options?: {
    showTime?: boolean;
    showSeconds?: boolean;
}): string;
/**
 * Whether a PrimeNG date format names the day of the month.
 *
 * Lowercase `d` and `o` (day of year) are the only tokens that set a day — uppercase `D` is the
 * day's *name*, which PrimeNG reads past without recording. See {@link parseDaylessDate} for why
 * this question is worth asking.
 */
declare function dateFormatNamesDay(format: string): boolean;
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
declare function parseDaylessDate(text: string, format: string): Date | null;
declare function dateFormatToInputMask(format: string): string | null;
/**
 * `1234.5` — the number, plainly.
 *
 * No grouping, no currency symbol, no prefix or suffix: those are display config, and a stored
 * `"1,234"` or `"$1,234.00"` is a number `Number()` cannot read back. Keeping the wire value bare
 * is also what lets a currency field's ISO code change without rewriting stored amounts, and what
 * keeps the value arithmetic-ready for the backend.
 */
declare function formatPlainNumber(value: number | null): string;
/**
 * The number a stored value means, or null.
 *
 * `Number` rather than `parseFloat`, so trailing junk is rejected outright instead of quietly
 * yielding a prefix — `parseFloat('12abc')` is 12, which is not what the field holds.
 * `Number('')` is 0, so the empty case is handled before the conversion.
 */
declare function parseFiniteNumber(raw: string): number | null;
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
declare function parseLooseBoolean(raw: string, trueText: string, falseText: string): boolean | null;

/**
 * Conversions for the HTML a `TextArea` field stores once `wysiwyg` is on.
 *
 * String-only, with no DOM, so the read-mode formatter can run wherever `formatFieldValue` does.
 * None of these sanitize: the editor sanitizes what it writes, and Angular sanitizes again on the
 * way into `[innerHTML]`. The only job here is moving between the stored HTML and plain text.
 */
/** Whether `value` already holds markup, as opposed to text saved before `wysiwyg` was switched
    on. */
declare function looksLikeHtml(value: string): boolean;
/**
 * Plain text as the HTML the editor should open with: escaped, with each newline as a `<br>`.
 *
 * What keeps an existing value's line breaks when an author turns `wysiwyg` on for a field that
 * already holds text — dropped into `innerHTML` as-is, every paragraph would run together.
 */
declare function plainTextToHtml(text: string): string;
/** `value` as editor HTML whatever it was saved as — markup passes through, plain text is
    converted. */
declare function toRichTextHtml(value: string): string;
/**
 * Stored HTML as the plain text a grid cell or `valueFormatted` should show.
 *
 * Block boundaries (`<br>`, closing `p`/`div`/`li`) become newlines and list items get a leading
 * bullet, so a formatted note still reads as separate lines once its tags are gone. `&amp;` is
 * decoded last so `&amp;lt;` comes out as the literal `&lt;` the author typed.
 */
declare function richTextToPlainText(html: string): string;

declare const INVALID_EMAIL_MESSAGE = "Enter a valid email address, e.g. name@example.com.";
declare const INVALID_URL_MESSAGE = "Enter a valid web address, e.g. https://example.com.";
/**
 * Why a text value does not fit its input type, or `null` when it does.
 *
 * Only `'email'` and `'url'` have a format to check; every other type accepts any string. Empty
 * is always valid — whether a value is needed at all is `required`'s job, not this one's.
 *
 * Lives here rather than in the renderer so a form can block a save on the same rule the control
 * shows its message for: the renderer draws the message, the consumer's validator calls this.
 * See `fieldValueFormatError` for the version that starts from a field definition.
 */
declare function textValueFormatError(inputType: TextInputType, value: string | null | undefined): string | null;

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
declare class TextFieldInputComponent implements FieldRenderer<TextFieldConfig, string> {
    readonly config: _angular_core.InputSignal<TextFieldConfig>;
    readonly value: _angular_core.ModelSignal<string>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** Fires once the user leaves the control. Text codecs are identity, so `value` is already
        settled by the time this emits — there is no rounding or repainting to wait for here. */
    readonly blurred: _angular_core.OutputEmitterRef<void>;
    /** The control's `id`, which `FieldInputComponent`'s label points at. Falls back to a constant
        only so the attribute is never empty; a field with no key is a create in progress. */
    readonly inputId: _angular_core.Signal<string>;
    /** A mask applies to `Phone` alone, whatever a config saved before that rule holds — see
        `TextFieldConfig.mask`. */
    readonly hasMask: _angular_core.Signal<boolean>;
    /** Whether this is a password field drawing the eye that reveals what has been typed. */
    readonly hasPasswordToggle: _angular_core.Signal<boolean>;
    /** The prefix as a PrimeIcons class, or '' when that edge carries a word or nothing. */
    readonly prefixIcon: _angular_core.Signal<string>;
    readonly suffixIcon: _angular_core.Signal<string>;
    /** The prefix as literal text, or '' when that edge carries an icon or nothing. */
    readonly prefixText: _angular_core.Signal<string>;
    readonly suffixText: _angular_core.Signal<string>;
    readonly hasIcons: _angular_core.Signal<boolean>;
    /** Whether either edge carries a word. */
    readonly hasText: _angular_core.Signal<boolean>;
    /** As `NumberFieldInputComponent`'s native `showClear`, but drawn by hand: `pInputText` is a
        directive over a plain `<input>` with no clear affordance of its own, unlike `p-inputnumber`
        or `p-select`. Offered only once there is something to clear, same as those controls' own
        rule. */
    readonly hasClear: _angular_core.Signal<boolean>;
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
    readonly innerControl: _angular_core.Signal<"password" | "mask" | "plain">;
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
     *   both that way. The Clear button is the same story: it is a trailing addon, which only a
     *   group has room for.
     * - `iconfield` for the plain icon case, which keeps icons inside the input as before.
     * - `bare` otherwise.
     */
    readonly shape: _angular_core.Signal<"group" | "iconfield" | "bare">;
    /**
     * Which edge `p-iconfield` pads for.
     *
     * It takes one position, so a config setting both icons gets the prefix's padding and a
     * best-effort suffix. Both at once is an unusual arrangement and not worth a second wrapper.
     */
    readonly iconPosition: _angular_core.Signal<"right" | "left">;
    /**
     * The soft keyboard to ask for, which is most of the point of `inputType` on a phone.
     *
     * Null for `text` and `password` rather than `'text'`: leaving the attribute off lets the
     * browser decide, and for a password field naming an input mode would be second-guessing it.
     */
    readonly inputMode: _angular_core.Signal<string | null>;
    /** Whether the user is in the control right now. See {@link formatErrorShown}. */
    private readonly focused;
    /** Why the value does not fit an Email or URL input type, or `null` while it does. The same rule
        a consumer's form validates with — see `textValueFormatError`. */
    readonly formatError: _angular_core.Signal<string | null>;
    /**
     * Whether to show {@link formatError}: only while the user is not typing in the control.
     *
     * Every half-typed address is invalid, so a message that appears on the first keystroke is noise
     * until the user has finished. Leaving the control reveals it; a value that arrives already
     * invalid (a saved one, opened for edit) shows it straight away, since nobody is typing.
     */
    readonly formatErrorShown: _angular_core.Signal<boolean>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    /** `p-inputmask` emits null for a cleared control; the wire value for text is `''`. */
    onValueChange(next: string | null): void;
    onFocus(): void;
    onBlur(): void;
    clear(): void;
    /**
     * One edge's value, but only when that edge is in the mode asked for.
     *
     * The mode is what decides — a config keeps the last word typed into an edge that is now
     * switched off, so a non-empty value means nothing on its own.
     */
    private affix;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TextFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TextFieldInputComponent, "vcr-text-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "blurred": "blurred"; }, never, never, true, never>;
}

/**
 * Draws a multi-line text field, for the `TextArea` type.
 *
 * `rows`, `placeholder` and `maxlength` are native attributes — `pTextarea` is a directive, and
 * only `autoResize` and `pSize` are Angular inputs on it. That means a misspelling among the
 * former is not caught by `strictTemplates`.
 */
declare class TextareaFieldInputComponent implements FieldRenderer<TextareaFieldConfig, string> {
    readonly config: _angular_core.InputSignal<TextareaFieldConfig>;
    readonly value: _angular_core.ModelSignal<string>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** Fires once the user leaves the control. The textarea codec is identity, so `value` is already
        settled by the time this emits — there is no rounding or repainting to wait for here. */
    readonly blurred: _angular_core.OutputEmitterRef<void>;
    readonly inputId: _angular_core.Signal<string>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    /** As `NumberFieldInputComponent`'s native `showClear`, but drawn by hand: `pTextarea` is a
        directive over a plain `<textarea>` with no clear affordance of its own. Offered only once
        there is something to clear, same as the native control's own rule. */
    readonly canClear: _angular_core.Signal<boolean>;
    clear(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TextareaFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TextareaFieldInputComponent, "vcr-textarea-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "blurred": "blurred"; }, never, never, true, never>;
}

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
declare class NumberFieldInputComponent implements FieldRenderer<NumberFieldConfig, number | null> {
    readonly config: _angular_core.InputSignal<NumberFieldConfig>;
    readonly value: _angular_core.ModelSignal<number | null>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** Fires once the user leaves the control, *after* the field's rounding rule has been applied —
        see {@link onBlur}. Enter also rounds, but does not emit: the caret is still in the box. */
    readonly blurred: _angular_core.OutputEmitterRef<void>;
    readonly inputId: _angular_core.Signal<string>;
    /** `number | undefined` on `p-inputnumber`, where this config uses null for "leave it to the
        locale". */
    readonly minFractionDigits: _angular_core.Signal<number | undefined>;
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
    readonly maxFractionDigits: _angular_core.Signal<number | undefined>;
    /** `''` means "follow the browser", which `p-inputnumber` spells as `undefined`. */
    readonly locale: _angular_core.Signal<string | undefined>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    /** Zero is not negative, and neither is an empty control — `-0 < 0` is false, which is the
        answer wanted here. */
    readonly isNegative: _angular_core.Signal<boolean>;
    readonly showsNegativeInRed: _angular_core.Signal<boolean>;
    /**
     * Why the value is out of bounds, or `null` while it is not.
     *
     * `p-inputnumber` is not given `min`/`max` at all — see the template — because its own answer to
     * a value outside them is to silently rewrite what the user typed to the nearest bound on blur.
     * That is indistinguishable from data loss to whoever is filling the field in: the number they
     * typed is simply gone, replaced with one they did not enter. This reports the same fact as a
     * message instead, and leaves the typed value exactly as typed until the user changes it
     * themselves.
     */
    readonly rangeError: _angular_core.Signal<string | null>;
    readonly hasRangeError: _angular_core.Signal<boolean>;
    /** A trailing space folded into the prefix so a currency-style marker reads as `PHP 1,000`
        rather than `PHP1,000` — matching {@link displaySuffix}, which leads with one on the other
        edge. Untouched when there is no prefix, so an unconfigured edge stays exactly empty rather
        than a stray leading space. */
    readonly displayPrefix: _angular_core.Signal<string>;
    /** As {@link displayPrefix}, leading rather than trailing: `1,000 PHP` rather than `1,000PHP`. */
    readonly displaySuffix: _angular_core.Signal<string>;
    /** Whether the control has the caret. Tracked only so the accounting form can stand down while
        the number is being edited — see `showsParenthesised`. */
    private readonly focused;
    /**
     * Whether to draw the accounting form over the control.
     *
     * `p-inputnumber` has no parenthesis format of its own — `Intl.NumberFormat`'s accounting sign
     * belongs to currency style, which this control is not in — so the form is drawn as an overlay
     * rather than configured. Not while focused: what is under the overlay is the editable number,
     * and `(1,234.00)` is not something that can be typed back.
     */
    readonly showsParenthesised: _angular_core.Signal<boolean>;
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
    readonly parenthesisedValue: _angular_core.Signal<string>;
    setFocused(next: boolean): void;
    /**
     * Leaves the control, applying the field's rounding rule.
     *
     * On blur rather than on every keystroke: rounding as the number is typed rewrites the box under
     * the caret — a `Round up` field with no decimal places would turn `2.4` into `3` before the `4`
     * had settled, and there would be no way to type `2.4` at all on the way to `2.45`.
     */
    onBlur(): void;
    /**
     * Rounds on Enter as well as on blur.
     *
     * Without it the rule looks broken to anyone who types a value and reads the box without
     * clicking away — which is how it is naturally tested, and how it was in fact reported. Enter is
     * already "I am done with this field" everywhere else in these forms.
     */
    onKeyDown(event: KeyboardEvent): void;
    private commitRounding;
    /** `p-inputnumber` emits `undefined` as well as null for a cleared control, and the wire value
        for a number is null either way. */
    onValueChange(next: number | null | undefined): void;
    /**
     * The value rounded the way the config asks, clamped back into the field's own range.
     *
     * The clamp is not belt-and-braces: rounding `9.4` up in a field capped at `9.5` would otherwise
     * produce `10`, a value the same config declares out of bounds — a setting inventing data its
     * neighbour rejects.
     */
    private applyRounding;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NumberFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NumberFieldInputComponent, "vcr-number-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "blurred": "blurred"; }, never, never, true, never>;
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
declare class CheckboxFieldInputComponent implements FieldRenderer<CheckboxFieldConfig, CheckboxFieldValue> {
    readonly config: _angular_core.InputSignal<CheckboxFieldConfig>;
    readonly value: _angular_core.ModelSignal<CheckboxFieldValue>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly isGroup: _angular_core.Signal<boolean>;
    /** The control's `id` in single mode, and the stem of each box's id in group mode. */
    readonly inputId: _angular_core.Signal<string>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    /** The boxes in the order `sortChoices` asks for, in group mode. Only the drawing order changes:
        a stored selection is a set of values and does not depend on it. */
    readonly options: _angular_core.Signal<readonly velocity_core_renderer.FieldChoiceOption[]>;
    /**
     * The value read as this mode expects it.
     *
     * Both narrow defensively rather than casting. The facade always decodes through the codec, so
     * the shape should match the mode — but an author flipping `checkboxType` changes what the
     * config means without changing what is stored, and a renderer that threw on that would take the
     * config form down with it.
     */
    readonly singleValue: _angular_core.Signal<boolean | null>;
    readonly groupValue: _angular_core.Signal<string[]>;
    readonly allOptionValues: _angular_core.Signal<string[]>;
    /** The "Select all" row is author-enabled and only worth showing with something to toggle. */
    readonly showToggleAll: _angular_core.Signal<boolean>;
    /** Whether every option is currently ticked. Drives the "Select all" toggle's own checked state. */
    readonly isAllChecked: _angular_core.Signal<boolean>;
    /** Some, but not all, options are ticked — shown as the toggle's indeterminate state. */
    readonly isAllIndeterminate: _angular_core.Signal<boolean>;
    readonly toggleAllId: _angular_core.Signal<string>;
    readonly isChecked: _angular_core.Signal<boolean>;
    /** Only ever true on a tri-state single box: a group has no third state to show. */
    readonly isIndeterminate: _angular_core.Signal<boolean>;
    readonly checkboxIcon: _angular_core.Signal<string | undefined>;
    /**
     * Whether the selection breaks the configured bounds, in group mode.
     *
     * Shown rather than enforced — the bounds are advisory (see `CheckboxFieldConfig`), and a control
     * that silently refused a click would be a worse way to say so than a message.
     */
    readonly boundsError: _angular_core.Signal<string>;
    optionId(value: string): string;
    /**
     * Advances the single box's value.
     *
     * The event is deliberately unused. For a tri-state field the checkbox can only report two
     * states, so its boolean would collapse the cycle; for a binary one the cycle below reduces to
     * the same two values anyway, so one path serves both and there is no branch to get wrong.
     */
    onSingleChange(): void;
    /** PrimeNG hands back the new array; the empty list is what "nothing ticked" means. */
    onGroupChange(next: string[] | null | undefined): void;
    /** Ticks every option, or clears the selection entirely. */
    onToggleAll(checked: boolean): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CheckboxFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CheckboxFieldInputComponent, "vcr-checkbox-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * Draws a currency amount, for the `Currency` type.
 *
 * The same `p-inputnumber` the number renderer uses, in `mode="currency"`. Separate because a
 * currency field has three settings a plain number has no use for, and because the two are
 * distinct `fieldType`s on the wire.
 *
 * The stored value is the amount alone — no symbol, no separators — so this config decides only
 * how a number is *drawn*. See `CurrencyFieldConfig`.
 */
declare class CurrencyFieldInputComponent implements FieldRenderer<CurrencyFieldConfig, number | null> {
    readonly config: _angular_core.InputSignal<CurrencyFieldConfig>;
    readonly value: _angular_core.ModelSignal<number | null>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** Fires once the user leaves the control. Unlike `number` there is no rounding step to wait
        for — `p-inputnumber` applies this field's fraction digits as the value is typed. */
    readonly blurred: _angular_core.OutputEmitterRef<void>;
    readonly inputId: _angular_core.Signal<string>;
    /**
     * The currency code to format with, falling back to the default for one that is not
     * three letters.
     *
     * `p-inputnumber` in currency mode hands the code straight to `Intl.NumberFormat`, which
     * *throws* on a malformed one — and a thrown formatter takes the whole form down rather than
     * degrading. A field misconfigured through the raw-JSON textarea must not be able to do that,
     * so the fallback is here as well as the warning in the config editor.
     */
    readonly currency: _angular_core.Signal<string>;
    /**
     * Why the amount is out of bounds, or `null` while it is not.
     *
     * `p-inputnumber` is not given `min`/`max` at all — see the template — for the same reason as
     * `NumberFieldInputComponent.rangeError`: its own answer to an out-of-range amount is to
     * silently rewrite it to the nearest bound on blur, which reads as data loss rather than a rule
     * being enforced. This reports the same fact as a message instead, leaving the typed amount
     * exactly as typed.
     */
    readonly rangeError: _angular_core.Signal<string | null>;
    readonly hasRangeError: _angular_core.Signal<boolean>;
    readonly minFractionDigits: _angular_core.Signal<number | undefined>;
    readonly maxFractionDigits: _angular_core.Signal<number | undefined>;
    readonly locale: _angular_core.Signal<string | undefined>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    onValueChange(next: number | null | undefined): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CurrencyFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CurrencyFieldInputComponent, "vcr-currency-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "blurred": "blurred"; }, never, never, true, never>;
}

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
 *
 * `buttonType` replaces the circles with one track of buttons: the selected choice is filled and
 * the others stay as labels beside it.
 */
declare class RadioFieldInputComponent implements FieldRenderer<RadioFieldConfig, string | null> {
    readonly config: _angular_core.InputSignal<RadioFieldConfig>;
    readonly value: _angular_core.ModelSignal<string | null>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** The group's shared `name`, and the stem of each button's own id. */
    readonly groupName: _angular_core.Signal<string>;
    /** The choices in the order `sortChoices` asks for. Computed rather than sorted in the template,
        so the array identity only changes when the config does. */
    readonly options: _angular_core.Signal<readonly velocity_core_renderer.FieldChoiceOption[]>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    readonly canClear: _angular_core.Signal<boolean>;
    optionId(value: string): string;
    onValueChange(next: string | null | undefined): void;
    clear(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<RadioFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<RadioFieldInputComponent, "vcr-radio-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

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
declare class SelectFieldInputComponent implements FieldRenderer<SelectFieldConfig, SelectFieldValue> {
    readonly config: _angular_core.InputSignal<SelectFieldConfig>;
    readonly value: _angular_core.ModelSignal<SelectFieldValue>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** The control's own id, so the facade's `<label for>` points at it. Same derivation as every
        other renderer of a single control. */
    readonly inputId: _angular_core.Signal<string>;
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
    readonly options: _angular_core.Signal<FieldChoiceOption[]>;
    readonly isMultiple: _angular_core.Signal<boolean>;
    /** `'medium'` is the theme's normal size, which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    /** `''` means "leave PrimeNG's own default", which an empty string would instead overwrite with
        a blank. Same translation `primeSize` makes. */
    readonly placeholder: _angular_core.Signal<string | undefined>;
    readonly filterPlaceholder: _angular_core.Signal<string | undefined>;
    /** The `'single'` value, ignoring an array left by a mode switch under stored data. */
    readonly singleValue: _angular_core.Signal<string | null>;
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
    readonly multipleValue: _angular_core.Signal<string[]>;
    onSingleChange(next: string | null | undefined): void;
    onMultipleChange(next: string[] | null | undefined): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SelectFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SelectFieldInputComponent, "vcr-select-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

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
declare class DateFieldInputComponent implements FieldRenderer<DateFieldConfig, DateFieldValue> {
    readonly config: _angular_core.InputSignal<DateFieldConfig>;
    readonly value: _angular_core.ModelSignal<DateFieldValue>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly inputId: _angular_core.Signal<string>;
    /** Whether the caret is in the picker's own text input. See {@link displayValue}. */
    private readonly editing;
    /** The picker itself, so {@link onTextInput} can correct the value it parsed. */
    private readonly picker;
    /** Whether the configured format names a day, and so is one `p-datepicker` can parse back from
        typed text on its own. See {@link onTextInput}. */
    private readonly namesDay;
    /**
     * The panel `p-datepicker` actually opens on: {@link DateFieldConfig.view}, except a Year-only
     * format forces `'year'` regardless of what is configured.
     *
     * `p-datepicker` throws on its own `yy` format unless `view` is `'year'` — see {@link onTextInput}
     * — so a saved config with `dateFormat: 'yy'` and some other `view` (from before this existed, or
     * edited through the raw-JSON textarea) would crash the picker rather than merely show the wrong
     * panel. Deriving it here rather than in the config editor covers both.
     */
    readonly effectiveView: _angular_core.Signal<"date" | "month" | "year">;
    /**
     * {@link DateFieldConfig.numberOfMonths}, except never `0`.
     *
     * The config editor writes `0` for a Year-only format, since side-by-side months mean nothing
     * once there's only a year grid to show — but `p-datepicker` builds one calendar group per
     * month and renders the *entire* panel, year grid included, inside that group. `0` months
     * means zero groups, which is an empty panel rather than a year-only one.
     */
    readonly effectiveNumberOfMonths: _angular_core.Signal<number>;
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
    readonly displayValue: _angular_core.WritableSignal<DateFieldValue>;
    constructor();
    onFocus(): void;
    onBlur(): void;
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
    onTextInput(event: Event): void;
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
    readonly minDate: _angular_core.Signal<Date | undefined>;
    readonly maxDate: _angular_core.Signal<Date | undefined>;
    /** A fixed bound, or null when the config has none — or when the Date Range switch is off, which
        is what makes that switch a setting rather than a way of hiding two inputs. */
    private fixedBound;
    /** `p-datepicker` emits undefined when cleared; null is this field's "no value". */
    onValueChange(next: DateFieldValue | undefined): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DateFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DateFieldInputComponent, "vcr-date-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * Draws a `Media` field: the glyph for the kind of file the slot accepts, at the configured size.
 *
 * A placeholder, and the only renderer in the module that edits nothing — there is no upload
 * control here yet, so `value` is declared (the contract requires it) and never written. That is
 * also why the registry pairs this with an identity codec: a value already stored against a Media
 * field passes straight through untouched rather than being rewritten by a renderer that cannot
 * read it. See `mediaFieldRenderer`.
 *
 * `required` is accepted and deliberately unused for the same reason — there is nothing to require
 * until there is something to fill in. `disabled` and `invalid` are honoured, since both are about
 * how the placeholder itself is drawn.
 */
declare class MediaFieldInputComponent implements FieldRenderer<MediaFieldConfig, string> {
    readonly config: _angular_core.InputSignal<MediaFieldConfig>;
    /** Declared to satisfy `FieldRenderer` and never set — this renderer has no control to edit
        with. The facade therefore never calls `commit`, and the stored value survives every save. */
    readonly value: _angular_core.ModelSignal<string>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** Matches what every other renderer derives, so `FieldInputComponent`'s label points at the
        element this one draws. */
    readonly inputId: _angular_core.Signal<string>;
    /**
     * What a screen reader announces in place of the glyph. The icon fonts carry no text of their
     * own, so without this the control is silent.
     *
     * One glyph and one word, where this used to pick between an image and a video icon off the
     * old `fileType` member. `MediaFileExtension` replaced it and offers only `'all'` so far, which
     * says nothing about which kind of file a slot holds — and guessing from a value that cannot
     * express the difference would label a video field "Image". Worth revisiting once the real
     * extension list lands, since an extension does carry that answer.
     */
    readonly iconLabel = "Media";
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MediaFieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<MediaFieldInputComponent, "vcr-media-field-input", never, { "config": { "alias": "config"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/** The `document.execCommand` names behind the five toolbar buttons. */
type RichTextCommand = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList';
/**
 * The rich-text box a `TextArea` field draws when its config has `wysiwyg` on.
 *
 * A trimmed port of the client's notes composer (`app-wysiwyg-editor`): the same `contenteditable`
 * box and `execCommand` formatting, keeping only its five format buttons — no placeholder,
 * attachments, notify list, mentions or submit button, since a field saves through its host like
 * every other renderer.
 *
 * The icons are inline SVG copied from Lucide rather than `@lucide/angular`, so this package does
 * not take a peer dependency for five glyphs.
 *
 * Not registered on its own: `TextareaFieldInputComponent` draws it in place of its `<textarea>`.
 */
declare class RichTextEditorComponent {
    /** Sanitized HTML. */
    readonly value: _angular_core.ModelSignal<string>;
    readonly inputId: _angular_core.InputSignal<string>;
    /** The box's resting height, in lines. It grows past this as content is added. */
    readonly rows: _angular_core.InputSignal<number>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** Fires when focus leaves the whole composer — not when it moves between the box and its
        toolbar. */
    readonly blurred: _angular_core.OutputEmitterRef<void>;
    private readonly sanitizer;
    private readonly composer;
    private readonly editor;
    readonly minHeight: _angular_core.Signal<string>;
    /**
     * The last value this component wrote itself. `innerHTML` is only replaced when `value` arrives
     * as something else, i.e. from the host — rewriting it on every keystroke would throw the caret
     * back to the start of the box.
     */
    private lastEmitted;
    constructor();
    format(command: RichTextCommand): void;
    onInput(): void;
    onFocusOut(event: FocusEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<RichTextEditorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<RichTextEditorComponent, "vcr-rich-text-editor", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "blurred": "blurred"; }, never, never, true, never>;
}

/**
 * Which renderer draws which `fieldType`.
 *
 * All nine kinds, across nineteen wire types. `media` still draws a placeholder that edits
 * nothing — see `mediaFieldRenderer`. An unregistered type is not an error: {@link FieldInputComponent} falls back to a
 * plain textarea, exactly as it does in the admin today — but note that the fallback is a
 * *textarea*, so a consumer resolving a control through `resolveFieldControl` gets a free-text box
 * for an unregistered type rather than merely an unformatted reading of the value.
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
 * `Text` with the retired `Email`/`Url`/`Phone`, `Number`/`Decimal`, and `DatePicker` with the
 * two retired date types at the end of the map. See `FieldRendererKind`.
 */
declare const FIELD_DEFINITION_TYPE_RENDERERS: Partial<Record<FieldDefinitionType, ErasedFieldRendererDescriptor>>;
/**
 * The descriptor for `fieldType`, or null for a type with no renderer.
 *
 * `Object.hasOwn` rather than a truthiness check, so a field type spelled `constructor` or
 * `toString` cannot borrow a prototype member and be mistaken for a registration.
 */
declare function findFieldRenderer(fieldType: string): ErasedFieldRendererDescriptor | null;
/** Whether `fieldType` has a typed renderer. */
declare function isFieldRendererRegistered(fieldType: string): boolean;
/**
 * Whether a field's value is a web address — what decides drawing it as a link.
 *
 * Read off the config, not the field type: a `Text` field with Input Type URL and a retired `Url`
 * field (whose seed sets the same input type) are the same control, and a `Url` field whose input
 * type was switched to something else no longer holds an address.
 */
declare function isUrlField(fieldType: string, fieldConfig: string | null): boolean;
/**
 * Why a value does not fit its field's format, or `null` when it does — today, a text field whose
 * Input Type is Email or URL. See `textValueFormatError` for the rules.
 *
 * Read off the config like {@link isUrlField}, so a retired `Email`/`Url` field is checked through
 * the input type its seed sets. For a form to block a save on: the renderer shows the same message
 * itself, so a consumer only needs this as a validator, not as a hint of its own.
 */
declare function fieldValueFormatError(fieldType: string, fieldConfig: string | null, value: string): string | null;
/**
 * A stored value as it should be *read* — the string to show where a control is not being drawn,
 * and the `valueFormatted` to send beside `value` on a save.
 *
 * The one entry point for this: resolving a descriptor, parsing its config and reaching for an
 * optional member is plumbing no consumer should repeat, and a consumer that got any step wrong
 * would quietly show raw values instead.
 *
 * Answers with `raw` untouched whenever there is nothing to apply — an unregistered field type, or
 * one of the descriptors that deliberately declares no `format` because what it stores is already
 * what it shows. That fallback is the whole error strategy: this never throws and never blanks a
 * value it cannot read, matching the rule the codecs are written to.
 */
declare function formatFieldValue(fieldType: string, raw: string, fieldConfig: string | null): string;
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
declare function textFieldRenderer(overrides?: Partial<TextFieldConfig>): ErasedFieldRendererDescriptor;
declare function textareaFieldRenderer(overrides?: Partial<TextareaFieldConfig>): ErasedFieldRendererDescriptor;
declare function numberFieldRenderer(overrides?: Partial<NumberFieldConfig>): ErasedFieldRendererDescriptor;
declare function currencyFieldRenderer(overrides?: Partial<CurrencyFieldConfig>): ErasedFieldRendererDescriptor;
/**
 * A `Calculated` field's value as it reads, shaped like the type it imitates: a `number` result
 * reads like a `Number` field, `decimal` like a `Decimal`, `currency` like a `Currency` in the
 * config's ISO code. Null — no value — is the empty string.
 *
 * `Calculated` is not in the registry, so `formatFieldValue` does not reach it; this is the same
 * formatting by a direct route, shared so the client's display and the admin's preview agree.
 */
declare function formatCalculatedValue(config: CalculatedFieldConfig, value: number | null): string;
declare function checkboxFieldRenderer(overrides?: Partial<CheckboxFieldConfig>): ErasedFieldRendererDescriptor;
declare function radioFieldRenderer(overrides?: Partial<RadioFieldConfig>): ErasedFieldRendererDescriptor;
declare function selectFieldRenderer(overrides?: Partial<SelectFieldConfig>): ErasedFieldRendererDescriptor;
/**
 * The one descriptor whose renderer edits nothing.
 *
 * `MediaFieldInputComponent` draws a placeholder glyph and has no control on it, so it never emits
 * and `serialize` is only ever handed a value this codec itself produced. Identity both ways is
 * therefore not a shortcut but the only correct choice: a value already stored against a Media
 * field passes through untouched, survives every save, and — because the round trip is exact —
 * is never mistaken for unreadable by `FieldInputComponent.storedValueUnreadable`. Anything
 * narrower would have this renderer quietly erase data it simply cannot display yet.
 */
declare function mediaFieldRenderer(overrides?: Partial<MediaFieldConfig>): ErasedFieldRendererDescriptor;
declare function dateFieldRenderer(overrides?: Partial<DateFieldConfig>): ErasedFieldRendererDescriptor;

/**
 * Which control draws a field that is *read through* another field — a Custom Object Data Point
 * column, and anything else that later borrows a field definition rather than owning one.
 *
 * The rule is inherit-by-default: a borrowed field is drawn the way its own definition says, with
 * the mask, options and min/max already authored once on the object that owns it. A *control* —
 * a field definition picked out of a library group purely for how it draws — takes precedence
 * when the author chose one.
 *
 * This lives in the package rather than in either app because both ends need the same answer: the
 * admin resolves it to show an author what a column will look like, and the client resolves it to
 * actually draw one. Two copies of a precedence rule is two copies that drift.
 */
/**
 * A field definition reduced to the two members that decide its control.
 *
 * Both sides of the decision are this same shape, which is the point: a control definition and a
 * source field definition are the same kind of thing, and only precedence separates them.
 */
interface FieldControlSource {
    fieldType: string;
    fieldConfig: string | null;
}
/** Which of the three rules below produced the answer. */
type FieldControlOrigin = 'control' | 'source' | 'fallback';
interface ResolvedFieldControl {
    fieldType: string;
    fieldConfig: string | null;
    /** Lets a caller mark a column in the UI without re-deriving the precedence it just asked
        about — and lets it tell a deliberate control from a field that could not be resolved. */
    origin: FieldControlOrigin;
}
/**
 * The control a borrowed field is drawn with.
 *
 * Precedence: the chosen control, otherwise the source field, otherwise {@link DEFAULT_FIELD_TYPE}
 * with no config.
 *
 * **Never null.** The fallback is reached only when a column is inheriting and its source field
 * definition has gone missing — deleted, or renamed since the data point was saved. Answering
 * with nothing would leave a gap in the panel where a value used to be; a plain text box at least
 * shows what is stored and lets it be corrected. Consistent with `formatFieldValue`, which
 * returns a value it cannot format rather than blanking it.
 *
 * **Neither side is backfilled from the other.** A control's config belongs to the control's own
 * field type; handing a Phone's mask to a Dropdown would be worse than the `null` that makes
 * every renderer's `parse()` answer with that type's defaults.
 *
 * **A control whose type this package cannot draw is honoured, not dropped.**
 * `FieldInputComponent` already degrades to a plain textarea for such a type, and showing that is
 * more honest than silently ignoring a choice an author made on purpose. The admin's control
 * picker filters those out up front, so reaching this is a sign the library changed under a saved
 * config.
 *
 * Does not look anything up — the caller has already loaded the control group's definitions and
 * found the one this column names. Keeping the lookup out is what lets this stay pure and lets
 * the admin reuse it against options it holds in memory.
 */
declare function resolveFieldControl(control: FieldControlSource | null | undefined, source: FieldControlSource | null | undefined): ResolvedFieldControl;

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
declare class FieldInputComponent {
    readonly fieldType: _angular_core.InputSignal<string>;
    /** The field's saved config, as the raw wire string.
     *
     * Raw rather than parsed because both consumers already hold a string — one from a
     * `FieldDefinitionResponse`, the other from a config editor's `configValue()` — and this facade
     * is the only thing that knows the `fieldType` needed to interpret it. */
    readonly fieldConfig: _angular_core.InputSignal<string | null>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly label: _angular_core.InputSignal<string>;
    /** Off by default: the value-editing consumers draw their own label, and only the preview in
        the field-definition form wants one from here. */
    readonly showLabel: _angular_core.InputSignal<boolean>;
    readonly required: _angular_core.InputSignal<boolean>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    /** The wire value — a string for every field type, whatever the control works in. */
    readonly value: _angular_core.ModelSignal<string>;
    /**
     * Re-emitted from the renderer's own `blurred`, for a consumer that wants to act once the user
     * has finished with the control rather than on every keystroke.
     *
     * By the time this fires, `value` holds the settled wire string — `number` has rounded and
     * `date` has repainted. Silent for a renderer that does not declare the output, and for an
     * unregistered field type, whose fallback textarea has no renderer to blur.
     */
    readonly blurred: _angular_core.OutputEmitterRef<void>;
    /** Where the chosen renderer is created. Absent while the field type is unregistered, since
        the anchor only exists inside that branch of the template. */
    private readonly anchor;
    private readonly descriptor;
    readonly isRegistered: _angular_core.Signal<boolean>;
    /**
     * The parsed config handed to the renderer.
     *
     * A `computed` so its identity is stable until `fieldType` or `fieldConfig` actually change. A
     * fresh object per read would be a new input value on every change-detection pass, which for an
     * `OnPush` child is an endless re-render.
     */
    private readonly config;
    /** The wire value decoded into whatever the control works in. A `computed` for the same
        identity reason as {@link config} — a `Date` rebuilt per read would never settle. */
    private readonly decoded;
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
    readonly storedValueUnreadable: _angular_core.Signal<boolean>;
    /** The control's `id`, matching what each renderer derives from `fieldKey`, so the label below
        points at the right element. */
    readonly inputId: _angular_core.Signal<string>;
    constructor();
    /**
     * Writes a renderer's new value back out as the wire string.
     *
     * Cannot loop. `model.set` is a no-op when the value is unchanged, and a value written *into* a
     * model from outside never emits — so the round trip costs one extra input update that Angular
     * dedupes. That holds only because every codec is round-trip stable
     * (`serialize(deserialize(s)) === s` for any `s` the pair itself produced), which is a stated
     * requirement on `FieldValueCodec` rather than an accident.
     */
    private commit;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FieldInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<FieldInputComponent, "vcr-field-input", never, { "fieldType": { "alias": "fieldType"; "required": true; "isSignal": true; }; "fieldConfig": { "alias": "fieldConfig"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "showLabel": { "alias": "showLabel"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "blurred": "blurred"; }, never, never, true, never>;
}

/**
 * How many characters of a URL are shown before it is elided.
 *
 * A URL is the one display form that routinely runs past the width of the panel it sits in, and
 * unlike the other types there is nothing in its config to shorten it with. The full address stays
 * reachable as the link target and in the `title`, so nothing is lost by cutting the text.
 */
declare const URL_DISPLAY_MAX_LENGTH = 60;
/**
 * A field's value, read as text until it is clicked, then edited with that field's real control.
 *
 * ## What this adds, and what it does not
 *
 * The control itself is **entirely {@link FieldInputComponent}'s job** — that facade already
 * resolves the descriptor for a `fieldType`, parses the raw `fieldConfig`, decodes the wire value,
 * mounts the right renderer and re-serialises on change. Nothing about drawing a control is
 * repeated here. What this adds is the half the facade has no opinion about: a read mode, and the
 * swap between the two.
 *
 * The read mode is `formatFieldValue`, which is the same function that produces the
 * `valueFormatted` sent beside a stored value — so what a panel shows and what the backend has
 * recorded as the display form cannot drift.
 *
 * ## Which field type this draws
 *
 * This takes a `fieldType`/`fieldConfig` pair and asks no questions about where it came from. For
 * a field read *through* another — a Custom Object Data Point column — that pair comes from
 * `resolveFieldControl`, which decides between the source field definition's own settings and a
 * local override. Keeping that precedence outside this component is deliberate: the resolution
 * rule is shared with authoring UI that never mounts a control.
 *
 * Because the facade dispatches through this package's registry, a `fieldType` the registry does
 * not carry falls back to a plain textarea in edit mode — not merely to an unformatted reading.
 */
declare class FieldValueComponent {
    readonly fieldType: _angular_core.InputSignal<string>;
    /** The field's settings, as the raw wire string — same contract as `FieldInputComponent`. */
    readonly fieldConfig: _angular_core.InputSignal<string | null>;
    readonly fieldKey: _angular_core.InputSignal<string>;
    readonly label: _angular_core.InputSignal<string>;
    readonly showLabel: _angular_core.InputSignal<boolean>;
    readonly required: _angular_core.InputSignal<boolean>;
    /** Draws the control greyed once open. Distinct from {@link readonly}, which never opens one. */
    readonly disabled: _angular_core.InputSignal<boolean>;
    /** Never enters edit mode — the value reads as text and nothing invites a click. */
    readonly readonly: _angular_core.InputSignal<boolean>;
    /** The wire value. Written only when an edit is committed, never on open or cancel. */
    readonly value: _angular_core.ModelSignal<string>;
    /**
     * The settled wire string, once an edit is accepted.
     *
     * Silent when an edit leaves the value as it was, so opening a control and closing it without
     * touching anything costs no save. A consumer persists on this rather than on `value`, which
     * also moves when its own binding does.
     */
    readonly committed: _angular_core.OutputEmitterRef<string>;
    private readonly editAnchor;
    readonly editing: _angular_core.WritableSignal<boolean>;
    /** The in-progress value while a control is open. Separate from {@link value} so a cancel has
        something to discard and so a continuous-entry kind does not write on every keystroke. */
    readonly draft: _angular_core.WritableSignal<string>;
    /** What {@link draft} started as, so a commit can tell an edit from a no-op. */
    private committedValue;
    private readonly descriptor;
    private readonly kind;
    /** Parsed only for the display decision that needs it — see {@link isRichText}. A `computed` so
        its identity is stable, matching the reason `FieldInputComponent` does the same. */
    private readonly config;
    readonly canEdit: _angular_core.Signal<boolean>;
    /** The value as its config says to read it — grouping, currency, date format, option labels. */
    readonly displayText: _angular_core.Signal<string>;
    readonly isEmpty: _angular_core.Signal<boolean>;
    /**
     * Whether the value should read as a link.
     *
     * The one display form that is not text, and the only branch in this component's read mode. A
     * `display` channel on the descriptor would be the general answer and is not worth it for one
     * implementor — the same reasoning that keeps four table-only members off a data point column.
     */
    readonly isUrl: _angular_core.Signal<boolean>;
    /**
     * Whether the value is the HTML a `wysiwyg` textarea stores, read as formatted text rather than
     * as {@link displayText}'s tag-stripped plain form. Rendered through `[innerHTML]`, which
     * Angular sanitizes on the way in.
     */
    readonly isRichText: _angular_core.Signal<boolean>;
    readonly richTextHtml: _angular_core.Signal<string>;
    /** The full address, for `href` and for the tooltip. Never the elided form. */
    readonly href: _angular_core.Signal<string>;
    readonly linkText: _angular_core.Signal<string>;
    /** See {@link COMMIT_ON_BLUR_KINDS}. An unregistered type gets the facade's textarea, which is
        continuous entry, so it belongs on this side of the split too. */
    private readonly commitsOnBlur;
    /** Enter ends an edit everywhere a newline is not the point — so not in a textarea. */
    readonly submitsOnEnter: _angular_core.Signal<boolean>;
    constructor();
    beginEdit(): void;
    /**
     * Takes a renderer's new value, and for a discrete-choice kind treats it as the edit itself.
     *
     * Written out rather than left as a two-way binding precisely so this branch has somewhere to
     * live: `[(value)]` would give the draft no chance to decide whether a change ends the edit.
     */
    onDraftChange(next: string): void;
    /** Accepts the edit. A no-op write emits nothing — see {@link committed}. */
    commit(): void;
    /** Abandons the edit, leaving the stored value exactly as it was. */
    cancel(): void;
    onKeydown(event: KeyboardEvent): void;
    onReadKeydown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FieldValueComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<FieldValueComponent, "vcr-field-value", never, { "fieldType": { "alias": "fieldType"; "required": true; "isSignal": true; }; "fieldConfig": { "alias": "fieldConfig"; "required": false; "isSignal": true; }; "fieldKey": { "alias": "fieldKey"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "showLabel": { "alias": "showLabel"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "committed": "committed"; }, never, never, true, never>;
}

export { CHECKBOX_TYPES, CHECKBOX_TYPE_OPTIONS, CHECKBOX_VALUE_SEPARATOR, CHOICE_ORIENTATIONS, CHOICE_ORIENTATION_OPTIONS, CHOICE_SORTS, CHOICE_SORT_OPTIONS, CURRENCY_DISPLAYS, CURRENCY_DISPLAY_OPTIONS, CheckboxFieldInputComponent, CurrencyFieldInputComponent, DATE_FORMAT_OPTIONS, DATE_ICON_DISPLAYS, DATE_ICON_DISPLAY_OPTIONS, DATE_LIMITS, DATE_LIMIT_OPTIONS, DATE_SELECTION_MODES, DATE_SELECTION_MODE_OPTIONS, DATE_VIEWS, DATE_VIEW_OPTIONS, DEFAULT_CHECKBOX_FIELD_CONFIG, DEFAULT_CURRENCY_FIELD_CONFIG, DEFAULT_DATE_FIELD_CONFIG, DEFAULT_MEDIA_FIELD_CONFIG, DEFAULT_NUMBER_FIELD_CONFIG, DEFAULT_RADIO_FIELD_CONFIG, DEFAULT_SELECT_FIELD_CONFIG, DEFAULT_TEXTAREA_FIELD_CONFIG, DEFAULT_TEXT_FIELD_CONFIG, DateFieldInputComponent, FIELD_DEFINITION_TYPE_RENDERERS, FIELD_INPUT_SIZES, FIELD_INPUT_SIZE_OPTIONS, FieldInputComponent, FieldValueComponent, HOUR_FORMATS, HOUR_FORMAT_OPTIONS, INVALID_EMAIL_MESSAGE, INVALID_URL_MESSAGE, LABEL_POSITIONS, LABEL_POSITION_OPTIONS, MEDIA_FILE_EXTENSIONS, MEDIA_FILE_EXTENSION_OPTIONS, MEDIA_PREVIEW_SIZES, MEDIA_PREVIEW_SIZE_OPTIONS, MediaFieldInputComponent, NUMBER_BUTTON_LAYOUTS, NUMBER_BUTTON_LAYOUT_OPTIONS, NUMBER_NEGATIVE_FORMATS, NUMBER_NEGATIVE_FORMAT_OPTIONS, NUMBER_ROUNDING_RULES, NUMBER_ROUNDING_RULE_OPTIONS, NumberFieldInputComponent, RENDERER_BINDINGS, RETIRED_TEXT_INPUT_TYPE_LABELS, RadioFieldInputComponent, RichTextEditorComponent, SELECT_MODES, SELECT_MODE_OPTIONS, SELECT_VALUE_SEPARATOR, STORED_FIELD_INPUT_SIZES, SelectFieldInputComponent, TEXT_AFFIX_MODES, TEXT_AFFIX_MODE_OPTIONS, TEXT_INPUT_TYPES, TEXT_INPUT_TYPE_OPTIONS, TextFieldInputComponent, TextareaFieldInputComponent, URL_DISPLAY_MAX_LENGTH, checkboxFieldRenderer, clearedCheckboxModeSettings, collectExtras, currencyFieldRenderer, dateFieldRenderer, dateFormatNamesDay, dateFormatToInputMask, eraseFieldRenderer, fieldValueFormatError, findFieldRenderer, formatCalculatedValue, formatDateByPattern, formatFieldValue, formatLocalDate, formatLocalDateTime, formatPlainNumber, hasBlankChoiceLabel, hasBlankChoiceValue, hasDuplicateChoiceLabel, hasDuplicateChoiceValue, isCurrencyCodeShaped, isFieldRendererRegistered, isUrlField, looksLikeHtml, mediaFieldRenderer, normalizeFieldInputSize, numberFieldRenderer, parseCheckboxFieldConfig, parseChoiceOptions, parseCurrencyFieldConfig, parseDateFieldConfig, parseDaylessDate, parseFiniteNumber, parseLocalDateish, parseLooseBoolean, parseMediaFieldConfig, parseNumberFieldConfig, parseRadioFieldConfig, parseSelectFieldConfig, parseTextFieldConfig, parseTextareaFieldConfig, plainTextToHtml, radioFieldRenderer, readArray, readBoolean, readConfigSource, readNullableNumber, readNumber, readOption, readRecord, readString, resolveFieldControl, richTextToPlainText, selectFieldRenderer, sortChoiceOptions, textFieldRenderer, textValueFormatError, textareaFieldRenderer, toFieldConfigJson, toRichTextHtml };
export type { CheckboxFieldConfig, CheckboxFieldValue, CheckboxType, ChoiceOrientation, ChoiceSort, ConfigSelectOption, ConfigSelectOptionGroup, CurrencyDisplay, CurrencyFieldConfig, DateFieldConfig, DateFieldValue, DateIconDisplay, DateLimit, DateSelectionMode, DateView, ErasedFieldRendererDescriptor, FieldChoiceOption, FieldConfigExtras, FieldControlOrigin, FieldControlSource, FieldInputSize, FieldRenderer, FieldRendererConfigMap, FieldRendererDescriptor, FieldRendererKind, FieldRendererValueMap, FieldValueCodec, HourFormat, LabelPosition, MediaFieldConfig, MediaFileExtension, MediaPreviewSize, NumberButtonLayout, NumberFieldConfig, NumberNegativeFormat, NumberRoundingRule, RadioFieldConfig, ResolvedFieldControl, SelectFieldConfig, SelectFieldValue, SelectMode, StoredFieldInputSize, TextAffixMode, TextFieldConfig, TextInputType, TextareaFieldConfig };
