/**
 * The `fieldType` vocabulary — the one list both the authoring app and the runtime client read.
 *
 * A field definition's `fieldType` is the string the admin writes and the client dispatches on.
 * Before this file each app kept its own list and they drifted: the admin wrote PascalCase
 * (`Number`, `DatePicker`, `Media`) while the client matched lowercase (`number`, `date`, `image`),
 * so every primitive the admin authored fell through the client's switch to "Unsupported field
 * type" — for long enough that nobody noticed the renderer components behind those branches were
 * never wired up. Neither compiler could see it: `fieldType` is a free `string` on the wire in
 * both apps.
 *
 * Packaging the vocabulary is what makes a future rename a compile error in both repos instead of
 * a silent fallback. Nothing here is Angular- or PrimeNG-aware — it is data, and it is consumable
 * by an app that draws none of these types.
 *
 * A type is **not** a {@link FieldRendererKind}. A kind is one of the nine renderer primitives this
 * package draws with; nineteen types map onto those nine, differing only in the config the registry
 * seeds them with. `FIELD_DEFINITION_TYPE_RENDERERS` is keyed by the type; everything under it is
 * keyed by the kind.
 */
/**
 * The types that hold a value and have a typed renderer.
 *
 * `Text` is the one text-renderer type still offered, `Number`/`Decimal` the number one — the
 * split lives in the registry, not here.
 */
type FieldValueType = 'Text' | 'TextArea' | 'Number' | 'Decimal' | 'Currency' | 'Checkbox' | 'DatePicker' | 'RadioButton' | 'Dropdown' | 'Media';
/**
 * The types that place a page-level widget rather than a field value.
 *
 * This package deliberately ships **no renderer** for any of them: each is bound to the consuming
 * app's own state layer (its store, its mapping library, its dialogs) and only that app can draw
 * one. They are listed here anyway because the admin authors them, so their spellings are shared
 * contract even though their components are not.
 *
 * `Notes`, `SitePlan`, `Gallery`, `Documents`, `Tasks` and `Contacts` go one step further than
 * their neighbours: they have no config component either, in this package or in the admin.
 * Placing one on a page is the whole of its authoring, so the admin's Config tab says so in a
 * line of text where the others show a picker. They are offered now so pages can be
 * composed ahead of the widgets being built, and each grows a config the day it has a setting
 * worth authoring.
 */
type PageWidgetType = 'basic-table' | 'DataTable' | 'DataList' | 'DataTableFilter' | 'DataTablePageHeader' | 'Metric' | 'Timeline' | 'Notice' | 'NoticeList' | 'CustomObjectDataPoint' | 'CustomObjectDataPointMultiple' | 'EsriMapV3' | 'GoogleMap' | 'MiniMap' | 'SiteSelectionList' | 'SiteSelectionDetails' | 'MarketResearchList' | 'MarketResearchDetails' | 'AddPropertyDialog' | 'AddLeaseDialog' | 'AddSimpleRecordDialog' | 'AddLeaseRecordDialog' | 'AddLeaseAdHocChargesRecordDialog' | 'AddLeaseCriticalScheduleRecordDialog' | 'Notes' | 'SitePlan' | 'Gallery' | 'Documents' | 'LeaseDocument' | 'Tasks' | 'Contacts';
/**
 * Types no longer offered in the admin's menu, but still held by fields saved before they were
 * withdrawn.
 *
 * Each was replaced by a type above that does the same job with one control instead of two:
 *
 * - `Date` and `DateTime` -> `DatePicker`, whose config carries the `showTime` boolean that was
 *   the only thing separating them.
 * - `Select` -> `RadioButton`, which has a typed options editor where `Select` had only a
 *   raw-JSON textarea. `Dropdown` has since been added as the control `Select` was named after,
 *   and is what a new field of that shape should use; the retired value stays on the radio
 *   renderer so fields already saved as `Select` keep drawing what they have always drawn.
 * - `Boolean` and `MultiSelect` (and the short-lived `CheckboxGroup`) -> `Checkbox`, whose config
 *   carries a `checkboxType` deciding whether it draws one box or a group of them.
 * - `Email` -> `Text`, which draws the same plain text box minus the email keyboard hint and
 *   browser validation `inputType: 'email'` gave it — not offered as a `Text` Input Type option
 *   either, since it was never meant as a setting to pick, only a fact about the retired type.
 * - `Url` -> `Text` with Input Type URL, which is the same control: `Url` was only ever the text
 *   renderer seeded with `inputType: 'url'`, and a `Url` field could have that switched off.
 * - `Phone` -> `Text` with Input Type Phone, for the same reason: it was the text renderer seeded
 *   with `inputType: 'tel'`, and the phone mask lives on that input type, not on the field type.
 *
 * **All of them stay registered** even though none is offered: a field's type cannot be changed
 * once saved, so dropping them would strip the editor from every such field already in an account
 * and leave it editing raw JSON.
 */
type RetiredFieldDefinitionType = 'Date' | 'DateTime' | 'Select' | 'MultiSelect' | 'Boolean' | 'CheckboxGroup' | 'Email' | 'Url' | 'Phone';
/** Every `fieldType` the admin can write — offered or retired, value or widget. */
type FieldDefinitionType = FieldValueType | PageWidgetType | RetiredFieldDefinitionType;
/**
 * Named handles for every type, for code that compares rather than lists.
 *
 * Keys are PascalCase even where the value is not, so `FieldDefinitionTypes.BasicTable` reads the
 * same as its neighbours while still writing `basic-table` on the wire. `satisfies` is what keeps a
 * mistyped value from compiling.
 */
declare const FieldDefinitionTypes: {
    readonly Text: "Text";
    readonly TextArea: "TextArea";
    readonly Number: "Number";
    readonly Decimal: "Decimal";
    readonly Currency: "Currency";
    readonly Checkbox: "Checkbox";
    readonly DatePicker: "DatePicker";
    readonly Email: "Email";
    readonly Phone: "Phone";
    readonly Url: "Url";
    readonly RadioButton: "RadioButton";
    readonly Dropdown: "Dropdown";
    readonly Media: "Media";
    readonly BasicTable: "basic-table";
    readonly DataTable: "DataTable";
    readonly DataList: "DataList";
    readonly DataTableFilter: "DataTableFilter";
    readonly DataTablePageHeader: "DataTablePageHeader";
    readonly Metric: "Metric";
    readonly Timeline: "Timeline";
    readonly Notice: "Notice";
    readonly NoticeList: "NoticeList";
    readonly CustomObjectDataPoint: "CustomObjectDataPoint";
    readonly CustomObjectDataPointMultiple: "CustomObjectDataPointMultiple";
    readonly EsriMapV3: "EsriMapV3";
    readonly GoogleMap: "GoogleMap";
    readonly MiniMap: "MiniMap";
    readonly SiteSelectionList: "SiteSelectionList";
    readonly SiteSelectionDetails: "SiteSelectionDetails";
    readonly MarketResearchList: "MarketResearchList";
    readonly MarketResearchDetails: "MarketResearchDetails";
    readonly AddPropertyDialog: "AddPropertyDialog";
    readonly AddLeaseDialog: "AddLeaseDialog";
    readonly AddSimpleRecordDialog: "AddSimpleRecordDialog";
    readonly AddLeaseRecordDialog: "AddLeaseRecordDialog";
    readonly AddLeaseAdHocChargesRecordDialog: "AddLeaseAdHocChargesRecordDialog";
    readonly AddLeaseCriticalScheduleRecordDialog: "AddLeaseCriticalScheduleRecordDialog";
    readonly Notes: "Notes";
    readonly SitePlan: "SitePlan";
    readonly Gallery: "Gallery";
    readonly Documents: "Documents";
    readonly LeaseDocument: "LeaseDocument";
    readonly Tasks: "Tasks";
    readonly Contacts: "Contacts";
    readonly Date: "Date";
    readonly DateTime: "DateTime";
    readonly Select: "Select";
    readonly MultiSelect: "MultiSelect";
    readonly Boolean: "Boolean";
    readonly CheckboxGroup: "CheckboxGroup";
};
/**
 * The field types the authoring UI offers.
 *
 * This list is ours, not the backend's: the contract types `fieldType` as a free string and
 * ships no enumeration, its only clue being the example value "Text". So these are the types
 * the dropdown *offers*, not the ones the API is known to accept — anything it rejects comes
 * back as a save error rather than being caught here. Correct the list here once the accepted
 * values are confirmed.
 *
 * Values are PascalCase to match that one known example; `label` differs from `value` only
 * where the wire name reads badly in a menu.
 *
 * `Currency`, `RadioButton`, `DatePicker` and `Checkbox` are offered on exactly the same
 * footing as the rest — they were added for the field-input renderer module, not because the
 * backend published them, and like every other value here they are accepted or rejected at save
 * time rather than validated here.
 *
 * The seven retired values are deliberately absent, and are named in
 * {@link RETIRED_FIELD_TYPE_LABELS} instead.
 *
 * Twelve of these have a typed renderer: {@link FieldValueType}. The rest are
 * {@link PageWidgetType} — drawn by their own branch in the client, with nothing in this package
 * touching them, and configured in the admin by a dedicated component each except `Notes`,
 * `SitePlan`, `Gallery`, `Documents`, `Tasks` and `Contacts`, which have nothing to configure yet.
 *
 * Order is the menu order, authored in groups — the primitives first, then the page-level widgets.
 * The admin sorts a copy alphabetically for display; do not re-sort in place.
 */
declare const FIELD_TYPE_OPTIONS: {
    label: string;
    value: FieldDefinitionType;
}[];
/**
 * Menu labels for the types no longer offered above — see {@link RetiredFieldDefinitionType} for
 * why each was withdrawn and why none was deleted.
 *
 * A `p-select` renders nothing for a value none of its options carry, so an existing field of a
 * withdrawn type would open showing a blank Type. The admin's field-definition screen merges the
 * matching entry back into its menu for that one field.
 *
 * The label says "retired" out loud: the menu is disabled on an edit, so this text is the only
 * thing that explains why the type is one nobody can choose any more.
 */
declare const RETIRED_FIELD_TYPE_LABELS: Record<RetiredFieldDefinitionType, string>;
/**
 * The retired-menu label for `fieldType`, or null if it is not a retired type.
 *
 * Takes a plain `string` because every caller has one: a saved field's `fieldType` is whatever the
 * API returns, including values this build has never heard of. Indexing
 * {@link RETIRED_FIELD_TYPE_LABELS} directly would force that cast out to each call site, so it
 * lives here behind the `Object.hasOwn` check that makes it true — the same shape as
 * `findFieldRenderer`.
 */
declare function retiredFieldTypeLabel(fieldType: string): string | null;
/** What a new field opens on — the one type the contract actually documents. */
declare const DEFAULT_FIELD_TYPE: FieldDefinitionType;
/**
 * The wire types this package can actually draw a control for.
 *
 * A duplicate of `FIELD_DEFINITION_TYPE_RENDERERS`' keys, and deliberately so. That registry holds
 * component classes, so reading its keys drags every renderer and its PrimeNG imports into
 * whatever bundle asks the question — and the question "can the client draw this type?" is one the
 * *admin* needs, to offer an author only overrides the client can honour. Answering it from the
 * registry would put a second copy of every renderer in the admin's chunk beside the copies it
 * already has.
 *
 * So the list lives here, where there is no Angular at all, and
 * `package-rendered-field-types.spec.ts` asserts it matches the registry exactly. Adding a
 * renderer without adding it here is a failing test, not a silent drift — which is the only reason
 * a hand-kept duplicate is acceptable.
 *
 * Includes the retired types, because the registry does: a field saved under one still draws. A
 * caller offering a *menu* wants this intersected with {@link FIELD_TYPE_OPTIONS}, which carries
 * only the types still on offer.
 */
declare const PACKAGE_RENDERED_FIELD_TYPES: readonly FieldDefinitionType[];
/** Whether this package can draw a control for `fieldType`. Takes a plain `string` for the same
    reason {@link retiredFieldTypeLabel} does — every caller has one off the wire. */
declare function isPackageRenderedFieldType(fieldType: string): boolean;
/**
 * Registered types whose renderer draws a placeholder and edits nothing — today only `Media`,
 * until the media picker itself moves into the package.
 *
 * Listed in {@link PACKAGE_RENDERED_FIELD_TYPES}, because the package does draw them and a facade
 * must not fall back to a raw textarea for one. Kept out of {@link isPackageEditableFieldType},
 * because offering one as a data point control would give the client a field nobody can fill in.
 */
declare const PLACEHOLDER_FIELD_TYPES: readonly FieldDefinitionType[];
/** Whether this package draws a control for `fieldType` that can actually set its value — what
    an author choosing a data point control should be offered. */
declare function isPackageEditableFieldType(fieldType: string): boolean;

export { DEFAULT_FIELD_TYPE, FIELD_TYPE_OPTIONS, FieldDefinitionTypes, PACKAGE_RENDERED_FIELD_TYPES, PLACEHOLDER_FIELD_TYPES, RETIRED_FIELD_TYPE_LABELS, isPackageEditableFieldType, isPackageRenderedFieldType, retiredFieldTypeLabel };
export type { FieldDefinitionType, FieldValueType, PageWidgetType, RetiredFieldDefinitionType };
