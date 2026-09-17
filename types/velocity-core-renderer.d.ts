import * as _angular_core from '@angular/core';
import { Type, InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import { FieldDefinitionType } from 'velocity-core-renderer/vocabulary';
export * from 'velocity-core-renderer/vocabulary';

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
 * `''` means "whatever the theme's default is" and is not the same as `'small'` — PrimeNG's own
 * input is `'small' | 'large' | undefined`, so the empty string is translated to `undefined` at
 * the binding rather than being passed through.
 */
declare const FIELD_INPUT_SIZES: readonly ["", "small", "large"];
type FieldInputSize = (typeof FIELD_INPUT_SIZES)[number];
declare const FIELD_INPUT_SIZE_OPTIONS: ConfigSelectOption<FieldInputSize>[];
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
/**
 * True when two choices share a stored value.
 *
 * They could not be told apart once selected, and {@link parseChoiceOptions} silently collapses
 * them on the way back in — so the editor says so rather than letting a choice quietly vanish.
 */
declare function hasDuplicateChoiceValue(options: readonly FieldChoiceOption[]): boolean;

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
declare const CURRENCY_DISPLAYS: readonly ["symbol", "code", "name"];
type CurrencyDisplay = (typeof CURRENCY_DISPLAYS)[number];
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
 * six other configs share. That one is `'' | 'small' | 'large'` because it is handed straight to a
 * PrimeNG control's `size` input, and its empty member means "whatever the theme's default is".
 * A `Media` field draws an icon rather than a PrimeNG control, so there is no control default to
 * defer to — every value here names a size, and the middle one is a real choice rather than an
 * absent one.
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
 * `'email'` is a valid {@link TextInputType} and deliberately not on this list: the `Email` field
 * type seeds it, so for such a field it is a fact about what the field *is* rather than a setting
 * to pick — and picking it on a `Text` field only duplicated a type the dropdown one tab over
 * already offers.
 *
 * A saved config still holds it, and `TextFieldConfigComponent` adds it back to the menu for the
 * field that holds it — see {@link RETIRED_TEXT_INPUT_TYPE_LABELS}.
 */
declare const TEXT_INPUT_TYPE_OPTIONS: ConfigSelectOption<TextInputType>[];
/**
 * Names for the input types no longer on the menu above.
 *
 * A `p-select` renders nothing for a value none of its options carry, so without this an `Email`
 * field would open showing an empty Input Type. The value was never at risk — only the user
 * seeing a blank where their field's type should be. Mirrors `RETIRED_FIELD_TYPE_LABELS`, which
 * does the same for the Type menu on the Metadata tab.
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
    size: FieldInputSize;
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
     *   both that way.
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
    /** `''` means "theme default", which PrimeNG spells as `undefined`. */
    readonly primeSize: _angular_core.Signal<"small" | "large" | undefined>;
    /** `p-inputmask` emits null for a cleared control; the wire value for text is `''`. */
    onValueChange(next: string | null): void;
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

export { CHECKBOX_TYPES, CHECKBOX_TYPE_OPTIONS, CHECKBOX_VALUE_SEPARATOR, CHOICE_ORIENTATIONS, CHOICE_ORIENTATION_OPTIONS, CHOICE_SORTS, CHOICE_SORT_OPTIONS, CURRENCY_DISPLAYS, CURRENCY_DISPLAY_OPTIONS, DATE_FORMAT_OPTIONS, DATE_ICON_DISPLAYS, DATE_ICON_DISPLAY_OPTIONS, DATE_LIMITS, DATE_LIMIT_OPTIONS, DATE_SELECTION_MODES, DATE_SELECTION_MODE_OPTIONS, DATE_VIEWS, DATE_VIEW_OPTIONS, DEFAULT_CHECKBOX_FIELD_CONFIG, DEFAULT_CURRENCY_FIELD_CONFIG, DEFAULT_DATE_FIELD_CONFIG, DEFAULT_MEDIA_FIELD_CONFIG, DEFAULT_NUMBER_FIELD_CONFIG, DEFAULT_RADIO_FIELD_CONFIG, DEFAULT_SELECT_FIELD_CONFIG, DEFAULT_TEXTAREA_FIELD_CONFIG, DEFAULT_TEXT_FIELD_CONFIG, FIELD_DEFINITION_TYPE_RENDERERS, FIELD_INPUT_SIZES, FIELD_INPUT_SIZE_OPTIONS, FieldInputComponent, HOUR_FORMATS, HOUR_FORMAT_OPTIONS, LABEL_POSITIONS, LABEL_POSITION_OPTIONS, MEDIA_FILE_EXTENSIONS, MEDIA_FILE_EXTENSION_OPTIONS, MEDIA_PREVIEW_SIZES, MEDIA_PREVIEW_SIZE_OPTIONS, NUMBER_BUTTON_LAYOUTS, NUMBER_BUTTON_LAYOUT_OPTIONS, NUMBER_NEGATIVE_FORMATS, NUMBER_NEGATIVE_FORMAT_OPTIONS, NUMBER_ROUNDING_RULES, NUMBER_ROUNDING_RULE_OPTIONS, RENDERER_BINDINGS, RETIRED_TEXT_INPUT_TYPE_LABELS, SELECT_MODES, SELECT_MODE_OPTIONS, SELECT_VALUE_SEPARATOR, TEXT_AFFIX_MODES, TEXT_AFFIX_MODE_OPTIONS, TEXT_INPUT_TYPES, TEXT_INPUT_TYPE_OPTIONS, TextFieldInputComponent, clearedCheckboxModeSettings, collectExtras, eraseFieldRenderer, findFieldRenderer, hasBlankChoiceValue, hasDuplicateChoiceValue, isCurrencyCodeShaped, isFieldRendererRegistered, parseCheckboxFieldConfig, parseChoiceOptions, parseCurrencyFieldConfig, parseDateFieldConfig, parseMediaFieldConfig, parseNumberFieldConfig, parseRadioFieldConfig, parseSelectFieldConfig, parseTextFieldConfig, parseTextareaFieldConfig, readArray, readBoolean, readConfigSource, readNullableNumber, readNumber, readOption, readRecord, readString, sortChoiceOptions, textFieldRenderer, toFieldConfigJson };
export type { CheckboxFieldConfig, CheckboxFieldValue, CheckboxType, ChoiceOrientation, ChoiceSort, ConfigSelectOption, ConfigSelectOptionGroup, CurrencyDisplay, CurrencyFieldConfig, DateFieldConfig, DateFieldValue, DateIconDisplay, DateLimit, DateSelectionMode, DateView, ErasedFieldRendererDescriptor, FieldChoiceOption, FieldConfigExtras, FieldInputSize, FieldRenderer, FieldRendererConfigMap, FieldRendererDescriptor, FieldRendererKind, FieldRendererValueMap, FieldValueCodec, HourFormat, LabelPosition, MediaFieldConfig, MediaFileExtension, MediaPreviewSize, NumberButtonLayout, NumberFieldConfig, NumberNegativeFormat, NumberRoundingRule, RadioFieldConfig, SelectFieldConfig, SelectFieldValue, SelectMode, TextAffixMode, TextFieldConfig, TextInputType, TextareaFieldConfig };
