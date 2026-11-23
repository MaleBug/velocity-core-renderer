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
 * Named handles for every type, for code that compares rather than lists.
 *
 * Keys are PascalCase even where the value is not, so `FieldDefinitionTypes.BasicTable` reads the
 * same as its neighbours while still writing `basic-table` on the wire. `satisfies` is what keeps a
 * mistyped value from compiling.
 */
const FieldDefinitionTypes = {
    Text: 'Text',
    TextArea: 'TextArea',
    Number: 'Number',
    Decimal: 'Decimal',
    Currency: 'Currency',
    Checkbox: 'Checkbox',
    DatePicker: 'DatePicker',
    Email: 'Email',
    Phone: 'Phone',
    Url: 'Url',
    RadioButton: 'RadioButton',
    Dropdown: 'Dropdown',
    Media: 'Media',
    Calculated: 'Calculated',
    BasicTable: 'basic-table',
    DataTable: 'DataTable',
    DataTableExpandable: 'DataTableExpandable',
    DataList: 'DataList',
    DateList: 'DateList',
    DataTableFilter: 'DataTableFilter',
    DataTablePageHeader: 'DataTablePageHeader',
    GlobalSearch: 'GlobalSearch',
    Metric: 'Metric',
    Timeline: 'Timeline',
    Notice: 'Notice',
    NoticeList: 'NoticeList',
    CustomObjectDataPoint: 'CustomObjectDataPoint',
    CustomObjectDataPointMultiple: 'CustomObjectDataPointMultiple',
    EsriMapV3: 'EsriMapV3',
    GoogleMap: 'GoogleMap',
    MiniMap: 'MiniMap',
    SiteSelectionList: 'SiteSelectionList',
    SiteSelectionDetails: 'SiteSelectionDetails',
    MarketResearchList: 'MarketResearchList',
    MarketResearchDetails: 'MarketResearchDetails',
    AddPropertyDialog: 'AddPropertyDialog',
    AddPropertyDialogV2: 'AddPropertyDialogV2',
    AddLeaseDialog: 'AddLeaseDialog',
    AddSimpleRecordDialog: 'AddSimpleRecordDialog',
    AddLeaseRecordDialog: 'AddLeaseRecordDialog',
    AddLeaseAdHocChargesRecordDialog: 'AddLeaseAdHocChargesRecordDialog',
    AddLeaseScheduledBasePaymentsRecordDialog: 'AddLeaseScheduledBasePaymentsRecordDialog',
    AddLeaseCriticalScheduleRecordDialog: 'AddLeaseCriticalScheduleRecordDialog',
    Notes: 'Notes',
    SitePlan: 'SitePlan',
    Gallery: 'Gallery',
    Documents: 'Documents',
    LeaseDocument: 'LeaseDocument',
    AbstractSummary: 'AbstractSummary',
    NewLeaseWizard: 'NewLeaseWizard',
    NewLeaseWizardV2: 'NewLeaseWizardV2',
    FinancialsTable: 'FinancialsTable',
    Tasks: 'Tasks',
    Contacts: 'Contacts',
    KeHEPortfolioDashboard: 'keHE Portfolio Dashboard',
    Date: 'Date',
    DateTime: 'DateTime',
    Select: 'Select',
    MultiSelect: 'MultiSelect',
    Boolean: 'Boolean',
    CheckboxGroup: 'CheckboxGroup',
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
 * The {@link FieldValueType}s hold a value, and all of them but `Calculated` have a typed
 * renderer. The rest are
 * {@link PageWidgetType} — drawn by their own branch in the client, with nothing in this package
 * touching them. The admin gives configured widgets a dedicated component and keeps settings-free
 * widgets in the Unconfigured group.
 *
 * Order is the menu order, authored in groups — the primitives first, then the page-level widgets.
 * The admin sorts a copy alphabetically for display; do not re-sort in place.
 */
const FIELD_TYPE_OPTIONS = [
    { label: 'Text', value: 'Text' },
    { label: 'Text Area', value: 'TextArea' },
    { label: 'Number', value: 'Number' },
    { label: 'Decimal', value: 'Decimal' },
    { label: 'Currency', value: 'Currency' },
    { label: 'Checkbox', value: 'Checkbox' },
    { label: 'Date Picker', value: 'DatePicker' },
    { label: 'Radio Button', value: 'RadioButton' },
    { label: 'Dropdown', value: 'Dropdown' },
    { label: 'Media', value: 'Media' },
    { label: 'Calculated Fields', value: 'Calculated' },
    { label: 'Basic Table', value: 'basic-table' },
    { label: 'Data Table', value: 'DataTable' },
    { label: 'Data Table Expandable', value: 'DataTableExpandable' },
    { label: 'Data List', value: 'DataList' },
    { label: 'Date List', value: 'DateList' },
    { label: 'Data Table Filter', value: 'DataTableFilter' },
    { label: 'Data Table Page Header', value: 'DataTablePageHeader' },
    { label: 'Global Search', value: 'GlobalSearch' },
    { label: 'Metric', value: 'Metric' },
    { label: 'Timeline', value: 'Timeline' },
    { label: 'Notice', value: 'Notice' },
    { label: 'Notice List', value: 'NoticeList' },
    { label: 'Custom Object Data Point', value: 'CustomObjectDataPoint' },
    { label: 'Custom Object Data Point Multiple', value: 'CustomObjectDataPointMultiple' },
    { label: 'Esri Map V3', value: 'EsriMapV3' },
    { label: 'Google Map', value: 'GoogleMap' },
    { label: 'Mini Map', value: 'MiniMap' },
    { label: 'Site Selection List', value: 'SiteSelectionList' },
    { label: 'Site Selection Details', value: 'SiteSelectionDetails' },
    { label: 'Market Research List', value: 'MarketResearchList' },
    { label: 'Market Research Details', value: 'MarketResearchDetails' },
    { label: 'Add Property Dialog', value: 'AddPropertyDialog' },
    { label: 'Add Property Dialog V2', value: 'AddPropertyDialogV2' },
    { label: 'Add Lease Dialog', value: 'AddLeaseDialog' },
    { label: 'Add Simple Record Dialog', value: 'AddSimpleRecordDialog' },
    { label: 'Add Lease Record Dialog', value: 'AddLeaseRecordDialog' },
    { label: 'Add Lease Ad Hoc Charges Record Dialog', value: 'AddLeaseAdHocChargesRecordDialog' },
    {
        label: 'Add Lease Scheduled Base Payments Record Dialog',
        value: 'AddLeaseScheduledBasePaymentsRecordDialog',
    },
    { label: 'Add Lease Critical Schedule Record Dialog', value: 'AddLeaseCriticalScheduleRecordDialog' },
    { label: 'Notes', value: 'Notes' },
    { label: 'Site Plan', value: 'SitePlan' },
    { label: 'Gallery', value: 'Gallery' },
    { label: 'Documents', value: 'Documents' },
    { label: 'Lease Document', value: 'LeaseDocument' },
    { label: 'Abstract Summary', value: 'AbstractSummary' },
    { label: 'New Lease Wizard', value: 'NewLeaseWizard' },
    { label: 'New Lease Wizard V2', value: 'NewLeaseWizardV2' },
    { label: 'Financials Table', value: 'FinancialsTable' },
    { label: 'Tasks', value: 'Tasks' },
    { label: 'Contacts', value: 'Contacts' },
    { label: 'keHE Portfolio Dashboard', value: 'keHE Portfolio Dashboard' },
];
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
const RETIRED_FIELD_TYPE_LABELS = {
    Date: 'Date (retired — use Date Picker)',
    DateTime: 'Date and Time (retired — use Date Picker)',
    Select: 'Select (retired — use Dropdown)',
    MultiSelect: 'Multi-Select (retired — use Checkbox)',
    Boolean: 'Boolean (retired — use Checkbox)',
    CheckboxGroup: 'Checkbox Group (retired — use Checkbox)',
    Email: 'Email (retired — use Text)',
    Url: 'URL (retired — use Text)',
    Phone: 'Phone (retired — use Text)',
};
/**
 * The retired-menu label for `fieldType`, or null if it is not a retired type.
 *
 * Takes a plain `string` because every caller has one: a saved field's `fieldType` is whatever the
 * API returns, including values this build has never heard of. Indexing
 * {@link RETIRED_FIELD_TYPE_LABELS} directly would force that cast out to each call site, so it
 * lives here behind the `Object.hasOwn` check that makes it true — the same shape as
 * `findFieldRenderer`.
 */
function retiredFieldTypeLabel(fieldType) {
    return Object.hasOwn(RETIRED_FIELD_TYPE_LABELS, fieldType)
        ? RETIRED_FIELD_TYPE_LABELS[fieldType]
        : null;
}
/** What a new field opens on — the one type the contract actually documents. */
const DEFAULT_FIELD_TYPE = FieldDefinitionTypes.Text;
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
const PACKAGE_RENDERED_FIELD_TYPES = [
    'Text',
    'Number',
    'Decimal',
    'Currency',
    'TextArea',
    'Checkbox',
    'DatePicker',
    'RadioButton',
    'Dropdown',
    'Media',
    // Retired, registered so an existing field of one keeps its renderer. See
    // `RETIRED_FIELD_TYPE_LABELS`.
    'Date',
    'DateTime',
    'Select',
    'Boolean',
    'MultiSelect',
    'CheckboxGroup',
    'Email',
    'Url',
    'Phone',
];
/** Whether this package can draw a control for `fieldType`. Takes a plain `string` for the same
    reason {@link retiredFieldTypeLabel} does — every caller has one off the wire. */
function isPackageRenderedFieldType(fieldType) {
    return PACKAGE_RENDERED_FIELD_TYPES.includes(fieldType);
}
/**
 * Registered types whose renderer draws a placeholder and edits nothing — today only `Media`,
 * until the media picker itself moves into the package.
 *
 * Listed in {@link PACKAGE_RENDERED_FIELD_TYPES}, because the package does draw them and a facade
 * must not fall back to a raw textarea for one. Kept out of {@link isPackageEditableFieldType},
 * because offering one as a data point control would give the client a field nobody can fill in.
 */
const PLACEHOLDER_FIELD_TYPES = ['Media'];
/** Whether this package draws a control for `fieldType` that can actually set its value — what
    an author choosing a data point control should be offered. */
function isPackageEditableFieldType(fieldType) {
    return (isPackageRenderedFieldType(fieldType) &&
        !PLACEHOLDER_FIELD_TYPES.includes(fieldType));
}

const FORM_CONTROL_EVENT_NAMES = ['field.change', 'field.blur', 'field.loaded'];
const FORM_CONTROL_EVENTS = [
    {
        name: 'field.change',
        label: 'Change',
        description: 'The value changed. In a form or dialog it fires on every edit; on a record page it fires once ' +
            'the edit is saved, with the saved value.',
    },
    {
        name: 'field.blur',
        label: 'Blur',
        description: 'The user left the control, with the value it settled on.',
    },
    {
        name: 'field.loaded',
        label: 'Loaded',
        description: 'The field was first drawn with its stored (or default) value, so page state can start from it.',
    },
];
/** The `fieldConfig` member a form-control field's bindings are saved under. */
const FORM_CONTROL_EVENT_BINDINGS_KEY = 'eventBindings';
/**
 * The `fieldConfig` member a form-control field's "Bind to page state" is saved under — the same
 * State Key / Expression + Default Value binding a DataTablePageHeader title has. While what it
 * reads has a value, the field takes that value: a form or add-record dialog submits it (unless the
 * user types over it); a record page only shows it in place of the saved value, temporarily —
 * nothing is saved, and a reload shows the saved value again. Until then the field shows its saved
 * value, else `defaultValue` (blank = the field's usual default).
 */
const FORM_CONTROL_VALUE_BINDING_KEY = 'valueBinding';
/** Reads a saved value binding, or null when there is none or it names nothing. */
function parseFormControlValueBinding(raw) {
    if (typeof raw !== 'object' || raw === null)
        return null;
    const { source, stateKey, template, defaultValue: rawDefault } = raw;
    const defaultValue = typeof rawDefault === 'string' ? rawDefault : '';
    if (source === 'state' && typeof stateKey === 'string' && stateKey.trim() !== '') {
        return { source, stateKey: stateKey.trim(), defaultValue };
    }
    if (source === 'expression' && typeof template === 'string' && template.trim() !== '') {
        return { source, template, defaultValue };
    }
    return null;
}

/*
 * Public API Surface of velocity-core-renderer/vocabulary
 *
 * A secondary entry point holding nothing but the field-type vocabulary — no Angular, no PrimeNG,
 * no components. It exists because the two are imported by very different code: a runtime app's
 * layout and routing files need the type names eagerly, while the renderer components are wanted
 * only on the screens that draw a field. Behind one entry point the string table drags the
 * components in with it, and measurably so — importing the vocabulary from the main entry point
 * cost `velocity-core-ui` about 130 kB of initial bundle and broke its size budget.
 */

/**
 * Generated bundle index. Do not edit.
 */

export { DEFAULT_FIELD_TYPE, FIELD_TYPE_OPTIONS, FORM_CONTROL_EVENTS, FORM_CONTROL_EVENT_BINDINGS_KEY, FORM_CONTROL_EVENT_NAMES, FORM_CONTROL_VALUE_BINDING_KEY, FieldDefinitionTypes, PACKAGE_RENDERED_FIELD_TYPES, PLACEHOLDER_FIELD_TYPES, RETIRED_FIELD_TYPE_LABELS, isPackageEditableFieldType, isPackageRenderedFieldType, parseFormControlValueBinding, retiredFieldTypeLabel };
//# sourceMappingURL=velocity-core-renderer-vocabulary.mjs.map
