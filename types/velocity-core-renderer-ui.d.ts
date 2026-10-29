import * as _angular_core from '@angular/core';

/**
 * A list screen's top row: title and subtitle on the left, search and one primary action
 * on the right, aligned against the title rather than stacked below it.
 *
 * `search` is a two-way model so the page can hold a single search signal and hand the
 * same one to its grid — the header owns the input, the grid owns what to do about it.
 *
 * Filters deliberately live below this, not in it. A screen with more than one control to the
 * right of its title wants its own row under this one, not more inputs crowded into this one.
 */
declare class VcrPageHeaderComponent {
    readonly title: _angular_core.InputSignal<string>;
    readonly subtitle: _angular_core.InputSignal<string>;
    /** Empty hides the search field entirely, for a screen that has nothing to search. */
    readonly searchPlaceholder: _angular_core.InputSignal<string>;
    readonly search: _angular_core.ModelSignal<string>;
    /** Empty hides the action button. */
    readonly actionLabel: _angular_core.InputSignal<string>;
    readonly actionIcon: _angular_core.InputSignal<string>;
    readonly action: _angular_core.OutputEmitterRef<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<VcrPageHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<VcrPageHeaderComponent, "vcr-page-header", never, { "title": { "alias": "title"; "required": true; "isSignal": true; }; "subtitle": { "alias": "subtitle"; "required": false; "isSignal": true; }; "searchPlaceholder": { "alias": "searchPlaceholder"; "required": false; "isSignal": true; }; "search": { "alias": "search"; "required": false; "isSignal": true; }; "actionLabel": { "alias": "actionLabel"; "required": false; "isSignal": true; }; "actionIcon": { "alias": "actionIcon"; "required": false; "isSignal": true; }; }, { "search": "searchChange"; "action": "action"; }, never, never, true, never>;
}

/** How long a toast stays up. Failures linger — they carry text the user has to read. */
declare const VCR_TOAST_DEFAULT_LIFE = 3000;
declare const VCR_TOAST_ERROR_LIFE = 6000;
/**
 * The one way an app raises a toast. It wraps PrimeNG's `MessageService` so callers do not repeat
 * severity and life bookkeeping, and so every screen in every consuming app agrees on how long a
 * success stays up versus a failure.
 *
 * It deliberately stops short of reporting a failed request. Turning a caught error into a
 * sentence means knowing the API's error envelope, and the apps consuming this library do not
 * currently agree on theirs — so that one method belongs in the app, as a subclass:
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class ToastService extends VcrToastService {
 *   apiError(error: unknown, summary: string, fallback: string): void {
 *     this.error(summary, toErrorMessage(error, fallback));
 *   }
 * }
 * ```
 *
 * Rendering is the host's business too: this service only queues messages, and nothing appears
 * until the app mounts PrimeNG's `<p-toast>` once in its root template and provides
 * `MessageService`. A missing outlet fails silently, which is the first thing to check when a
 * toast does not show up.
 */
declare class VcrToastService {
    private readonly messages;
    success(summary: string, detail?: string): void;
    info(summary: string, detail?: string): void;
    warn(summary: string, detail?: string): void;
    error(summary: string, detail?: string): void;
    clear(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<VcrToastService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<VcrToastService>;
}

/**
 * One row nested under an abstract clause detail.
 *
 * A detail point is the third level of a template: clause, then detail, then the points that
 * belong to that detail.
 */
interface AbstractClauseDetailPoint {
    id: string;
    label: string;
}
/**
 * One row of an abstract clause card.
 *
 * `points` are drawn indented beneath this row. A detail with none is a single row.
 */
interface AbstractClauseDetail {
    id: string;
    label: string;
    points: AbstractClauseDetailPoint[];
}
/**
 * One card in an abstract summary.
 *
 * `name` is the card heading (for example "Alterations"). `details` are its rows.
 */
interface AbstractClause {
    id: string;
    name: string;
    details: AbstractClauseDetail[];
}
/**
 * Clauses to draw for `search`.
 *
 * A blank search returns `clauses` unchanged. Otherwise a clause is kept when its name matches,
 * or when one of its details or points does. A matching clause name keeps every detail. A matching
 * detail keeps every point. A matching point keeps only that point under its detail.
 */
declare function visibleAbstractClauses(clauses: AbstractClause[], search: string): AbstractClause[];

/**
 * The toolbar above an abstract summary's clause cards.
 *
 * Search on the left, then Add Clause. On the right, the selected template's name and Export
 * Abstracts. No template name draws "No Template Selected" in place of the name pill. This is the
 * bar inside the summary, not the page tabs around it.
 */
declare class VcrAbstractSummaryHeaderComponent {
    /** Two-way, so the summary can filter its cards from the same value the input shows. */
    readonly search: _angular_core.ModelSignal<string>;
    /** Null when the reader has not chosen a template yet. */
    readonly templateName: _angular_core.InputSignal<string | null>;
    readonly addClause: _angular_core.OutputEmitterRef<void>;
    readonly exportAbstracts: _angular_core.OutputEmitterRef<void>;
    readonly selectTemplate: _angular_core.OutputEmitterRef<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<VcrAbstractSummaryHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<VcrAbstractSummaryHeaderComponent, "vcr-abstract-summary-header", never, { "search": { "alias": "search"; "required": false; "isSignal": true; }; "templateName": { "alias": "templateName"; "required": false; "isSignal": true; }; }, { "search": "searchChange"; "addClause": "addClause"; "exportAbstracts": "exportAbstracts"; "selectTemplate": "selectTemplate"; }, never, never, true, never>;
}

/** Which row an edit or copy action belongs to. */
interface AbstractClauseRowRef {
    clauseId: string;
    detailId: string;
    pointId: string | null;
}
/**
 * One abstract clause, drawn as a card.
 *
 * The heading is the clause. Each detail is a row, and that detail's points are the indented
 * rows beneath it. The chevron folds the rows away; they start open.
 */
declare class VcrAbstractClauseCardComponent {
    readonly clause: _angular_core.InputSignal<AbstractClause>;
    readonly addDataPoint: _angular_core.OutputEmitterRef<string>;
    readonly editRow: _angular_core.OutputEmitterRef<AbstractClauseRowRef>;
    readonly copyRow: _angular_core.OutputEmitterRef<AbstractClauseRowRef>;
    readonly expanded: _angular_core.WritableSignal<boolean>;
    toggle(): void;
    detailRef(detail: AbstractClauseDetail): AbstractClauseRowRef;
    pointRef(detail: AbstractClauseDetail, point: AbstractClauseDetailPoint): AbstractClauseRowRef;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<VcrAbstractClauseCardComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<VcrAbstractClauseCardComponent, "vcr-abstract-clause-card", never, { "clause": { "alias": "clause"; "required": true; "isSignal": true; }; }, { "addDataPoint": "addDataPoint"; "editRow": "editRow"; "copyRow": "copyRow"; }, never, never, true, never>;
}

/**
 * The abstract summary panel a page places inside one of its own tabs.
 *
 * The header is search, Add Clause, the template name and Export Abstracts. Below it, each
 * abstract clause is a card, each clause detail is a row, and each detail's points are the
 * indented rows under that detail. With no template selected, the cards are replaced by the
 * prompt to choose one.
 *
 * The host supplies the template. Abstract templates are custom-object records; which object
 * those records come from is not chosen here yet.
 */
declare class VcrAbstractSummaryComponent {
    readonly templateName: _angular_core.InputSignal<string | null>;
    readonly clauses: _angular_core.InputSignal<AbstractClause[]>;
    readonly search: _angular_core.ModelSignal<string>;
    readonly addClause: _angular_core.OutputEmitterRef<void>;
    readonly exportAbstracts: _angular_core.OutputEmitterRef<void>;
    readonly selectTemplate: _angular_core.OutputEmitterRef<void>;
    readonly addDataPoint: _angular_core.OutputEmitterRef<string>;
    readonly editRow: _angular_core.OutputEmitterRef<AbstractClauseRowRef>;
    readonly copyRow: _angular_core.OutputEmitterRef<AbstractClauseRowRef>;
    readonly visibleClauses: _angular_core.Signal<AbstractClause[]>;
    hasTemplate(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<VcrAbstractSummaryComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<VcrAbstractSummaryComponent, "vcr-abstract-summary", never, { "templateName": { "alias": "templateName"; "required": false; "isSignal": true; }; "clauses": { "alias": "clauses"; "required": false; "isSignal": true; }; "search": { "alias": "search"; "required": false; "isSignal": true; }; }, { "search": "searchChange"; "addClause": "addClause"; "exportAbstracts": "exportAbstracts"; "selectTemplate": "selectTemplate"; "addDataPoint": "addDataPoint"; "editRow": "editRow"; "copyRow": "copyRow"; }, never, never, true, never>;
}

export { VCR_TOAST_DEFAULT_LIFE, VCR_TOAST_ERROR_LIFE, VcrAbstractClauseCardComponent, VcrAbstractSummaryComponent, VcrAbstractSummaryHeaderComponent, VcrPageHeaderComponent, VcrToastService, visibleAbstractClauses };
export type { AbstractClause, AbstractClauseDetail, AbstractClauseDetailPoint, AbstractClauseRowRef };
