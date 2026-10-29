import * as i0 from '@angular/core';
import { input, model, output, ChangeDetectionStrategy, Component, inject, Injectable, signal, computed } from '@angular/core';
import * as i1 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import * as i2 from 'primeng/button';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

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
class VcrPageHeaderComponent {
    title = input.required(...(ngDevMode ? [{ debugName: "title" }] : /* istanbul ignore next */ []));
    subtitle = input('', ...(ngDevMode ? [{ debugName: "subtitle" }] : /* istanbul ignore next */ []));
    /** Empty hides the search field entirely, for a screen that has nothing to search. */
    searchPlaceholder = input('Search…', ...(ngDevMode ? [{ debugName: "searchPlaceholder" }] : /* istanbul ignore next */ []));
    search = model('', ...(ngDevMode ? [{ debugName: "search" }] : /* istanbul ignore next */ []));
    /** Empty hides the action button. */
    actionLabel = input('', ...(ngDevMode ? [{ debugName: "actionLabel" }] : /* istanbul ignore next */ []));
    actionIcon = input('pi pi-plus', ...(ngDevMode ? [{ debugName: "actionIcon" }] : /* istanbul ignore next */ []));
    action = output();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrPageHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: VcrPageHeaderComponent, isStandalone: true, selector: "vcr-page-header", inputs: { title: { classPropertyName: "title", publicName: "title", isSignal: true, isRequired: true, transformFunction: null }, subtitle: { classPropertyName: "subtitle", publicName: "subtitle", isSignal: true, isRequired: false, transformFunction: null }, searchPlaceholder: { classPropertyName: "searchPlaceholder", publicName: "searchPlaceholder", isSignal: true, isRequired: false, transformFunction: null }, search: { classPropertyName: "search", publicName: "search", isSignal: true, isRequired: false, transformFunction: null }, actionLabel: { classPropertyName: "actionLabel", publicName: "actionLabel", isSignal: true, isRequired: false, transformFunction: null }, actionIcon: { classPropertyName: "actionIcon", publicName: "actionIcon", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { search: "searchChange", action: "action" }, ngImport: i0, template: "<header class=\"page-header\">\n  <div class=\"page-header__text\">\n    <h1 class=\"page-header__title\">{{ title() }}</h1>\n    @if (subtitle() !== '') {\n      <p class=\"page-header__subtitle\">{{ subtitle() }}</p>\n    }\n  </div>\n\n  <div class=\"page-header__actions\">\n    @if (searchPlaceholder() !== '') {\n      <p-iconfield class=\"page-header__search\">\n        <p-inputicon styleClass=\"pi pi-search\" />\n        <input\n          pInputText\n          type=\"text\"\n          [placeholder]=\"searchPlaceholder()\"\n          [attr.aria-label]=\"searchPlaceholder()\"\n          [(ngModel)]=\"search\"\n        />\n      </p-iconfield>\n    }\n\n    @if (actionLabel() !== '') {\n      <p-button [icon]=\"actionIcon()\" [label]=\"actionLabel()\" (onClick)=\"action.emit()\" />\n    }\n  </div>\n</header>\n", styles: ["@charset \"UTF-8\";:host{display:block;margin-bottom:20px}.page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.page-header__text{min-width:0}.page-header__title{margin:0 0 4px;color:var(--content-color, var(--p-text-color));font-size:22px;font-weight:600}.page-header__subtitle{margin:0;color:var(--surface-500, var(--p-text-muted-color));font-size:13px}.page-header__actions{display:flex;align-items:center;gap:12px;flex:0 0 auto}.page-header__actions ::ng-deep .p-button{font-size:12px}.page-header__actions ::ng-deep .p-button .p-button-icon{font-size:12px}.page-header__search{--p-inputtext-border-radius: var(--border-radius-sm, var(--p-border-radius-sm))}.page-header__search input{width:260px;font-size:13px}@media(max-width:900px){.page-header__actions{width:100%}.page-header__search{flex:1}.page-header__search input{width:100%}}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "component", type: i2.Button, selector: "p-button", inputs: ["hostName", "type", "badge", "disabled", "raised", "rounded", "text", "plain", "outlined", "link", "tabindex", "size", "variant", "style", "styleClass", "badgeClass", "badgeSeverity", "ariaLabel", "autofocus", "iconPos", "icon", "label", "loading", "loadingIcon", "severity", "buttonProps", "fluid"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: IconField, selector: "p-iconfield, p-iconField, p-icon-field", inputs: ["hostName", "iconPosition", "styleClass"] }, { kind: "component", type: InputIcon, selector: "p-inputicon, p-inputIcon", inputs: ["hostName", "styleClass"] }, { kind: "directive", type: InputText, selector: "[pInputText]", inputs: ["hostName", "ptInputText", "pInputTextPT", "pInputTextUnstyled", "pSize", "variant", "fluid", "invalid"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrPageHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-page-header', standalone: true, imports: [FormsModule, ButtonModule, IconField, InputIcon, InputText], changeDetection: ChangeDetectionStrategy.OnPush, template: "<header class=\"page-header\">\n  <div class=\"page-header__text\">\n    <h1 class=\"page-header__title\">{{ title() }}</h1>\n    @if (subtitle() !== '') {\n      <p class=\"page-header__subtitle\">{{ subtitle() }}</p>\n    }\n  </div>\n\n  <div class=\"page-header__actions\">\n    @if (searchPlaceholder() !== '') {\n      <p-iconfield class=\"page-header__search\">\n        <p-inputicon styleClass=\"pi pi-search\" />\n        <input\n          pInputText\n          type=\"text\"\n          [placeholder]=\"searchPlaceholder()\"\n          [attr.aria-label]=\"searchPlaceholder()\"\n          [(ngModel)]=\"search\"\n        />\n      </p-iconfield>\n    }\n\n    @if (actionLabel() !== '') {\n      <p-button [icon]=\"actionIcon()\" [label]=\"actionLabel()\" (onClick)=\"action.emit()\" />\n    }\n  </div>\n</header>\n", styles: ["@charset \"UTF-8\";:host{display:block;margin-bottom:20px}.page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.page-header__text{min-width:0}.page-header__title{margin:0 0 4px;color:var(--content-color, var(--p-text-color));font-size:22px;font-weight:600}.page-header__subtitle{margin:0;color:var(--surface-500, var(--p-text-muted-color));font-size:13px}.page-header__actions{display:flex;align-items:center;gap:12px;flex:0 0 auto}.page-header__actions ::ng-deep .p-button{font-size:12px}.page-header__actions ::ng-deep .p-button .p-button-icon{font-size:12px}.page-header__search{--p-inputtext-border-radius: var(--border-radius-sm, var(--p-border-radius-sm))}.page-header__search input{width:260px;font-size:13px}@media(max-width:900px){.page-header__actions{width:100%}.page-header__search{flex:1}.page-header__search input{width:100%}}\n"] }]
        }], propDecorators: { title: [{ type: i0.Input, args: [{ isSignal: true, alias: "title", required: true }] }], subtitle: [{ type: i0.Input, args: [{ isSignal: true, alias: "subtitle", required: false }] }], searchPlaceholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "searchPlaceholder", required: false }] }], search: [{ type: i0.Input, args: [{ isSignal: true, alias: "search", required: false }] }, { type: i0.Output, args: ["searchChange"] }], actionLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "actionLabel", required: false }] }], actionIcon: [{ type: i0.Input, args: [{ isSignal: true, alias: "actionIcon", required: false }] }], action: [{ type: i0.Output, args: ["action"] }] } });

/** How long a toast stays up. Failures linger — they carry text the user has to read. */
const VCR_TOAST_DEFAULT_LIFE = 3000;
const VCR_TOAST_ERROR_LIFE = 6000;
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
class VcrToastService {
    messages = inject(MessageService);
    success(summary, detail = '') {
        this.messages.add({ severity: 'success', summary, detail, life: VCR_TOAST_DEFAULT_LIFE });
    }
    info(summary, detail = '') {
        this.messages.add({ severity: 'info', summary, detail, life: VCR_TOAST_DEFAULT_LIFE });
    }
    warn(summary, detail = '') {
        this.messages.add({ severity: 'warn', summary, detail, life: VCR_TOAST_ERROR_LIFE });
    }
    error(summary, detail = '') {
        this.messages.add({ severity: 'error', summary, detail, life: VCR_TOAST_ERROR_LIFE });
    }
    clear() {
        this.messages.clear();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrToastService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrToastService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrToastService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Clauses to draw for `search`.
 *
 * A blank search returns `clauses` unchanged. Otherwise a clause is kept when its name matches,
 * or when one of its details or points does. A matching clause name keeps every detail. A matching
 * detail keeps every point. A matching point keeps only that point under its detail.
 */
function visibleAbstractClauses(clauses, search) {
    const query = search.trim().toLowerCase();
    if (query === '')
        return clauses;
    const hits = (label) => label.toLowerCase().includes(query);
    return clauses.flatMap((clause) => {
        if (hits(clause.name))
            return [clause];
        const details = clause.details.flatMap((detail) => {
            if (hits(detail.label))
                return [detail];
            const points = detail.points.filter((point) => hits(point.label));
            return points.length > 0 ? [{ ...detail, points }] : [];
        });
        return details.length > 0 ? [{ ...clause, details }] : [];
    });
}

/**
 * The toolbar above an abstract summary's clause cards.
 *
 * Search on the left, then Add Clause. On the right, the selected template's name and Export
 * Abstracts. No template name draws "No Template Selected" in place of the name pill. This is the
 * bar inside the summary, not the page tabs around it.
 */
class VcrAbstractSummaryHeaderComponent {
    /** Two-way, so the summary can filter its cards from the same value the input shows. */
    search = model('', ...(ngDevMode ? [{ debugName: "search" }] : /* istanbul ignore next */ []));
    /** Null when the reader has not chosen a template yet. */
    templateName = input(null, ...(ngDevMode ? [{ debugName: "templateName" }] : /* istanbul ignore next */ []));
    addClause = output();
    exportAbstracts = output();
    selectTemplate = output();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrAbstractSummaryHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: VcrAbstractSummaryHeaderComponent, isStandalone: true, selector: "vcr-abstract-summary-header", inputs: { search: { classPropertyName: "search", publicName: "search", isSignal: true, isRequired: false, transformFunction: null }, templateName: { classPropertyName: "templateName", publicName: "templateName", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { search: "searchChange", addClause: "addClause", exportAbstracts: "exportAbstracts", selectTemplate: "selectTemplate" }, ngImport: i0, template: "<div class=\"abstract-header\">\n  <div class=\"abstract-header__start\">\n    <p-iconfield class=\"abstract-header__search\">\n      <p-inputicon styleClass=\"pi pi-search\" />\n      <input\n        pInputText\n        type=\"search\"\n        placeholder=\"Search clause data point...\"\n        aria-label=\"Search clause data point\"\n        [(ngModel)]=\"search\"\n      />\n    </p-iconfield>\n    <p-button\n      icon=\"pi pi-plus-circle\"\n      label=\"Add Clause\"\n      [rounded]=\"true\"\n      (onClick)=\"addClause.emit()\"\n    />\n  </div>\n\n  <div class=\"abstract-header__end\">\n    <span class=\"abstract-header__template\">\n      <span class=\"abstract-header__template-label\">Abstract Template:</span>\n      @if (templateName(); as name) {\n        <button type=\"button\" class=\"abstract-header__template-name\" (click)=\"selectTemplate.emit()\">\n          {{ name }}\n        </button>\n      } @else {\n        <button type=\"button\" class=\"abstract-header__template-empty\" (click)=\"selectTemplate.emit()\">\n          No Template Selected\n        </button>\n      }\n    </span>\n    <p-button\n      icon=\"pi pi-download\"\n      label=\"Export Abstracts\"\n      [outlined]=\"true\"\n      [rounded]=\"true\"\n      (onClick)=\"exportAbstracts.emit()\"\n    />\n  </div>\n</div>\n", styles: [":host{display:block}.abstract-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.abstract-header__start,.abstract-header__end,.abstract-header__template{display:flex;align-items:center;gap:12px}.abstract-header__search{--p-inputtext-border-radius: var(--border-radius-sm, var(--p-border-radius-md))}.abstract-header__search input{width:280px;font-size:13px}.abstract-header__start ::ng-deep .p-button,.abstract-header__end ::ng-deep .p-button{font-size:13px;white-space:nowrap}.abstract-header__template-label{color:var(--surface-700, var(--p-text-color));font-size:13px;font-weight:600}.abstract-header__template-name,.abstract-header__template-empty{border:0;background:transparent;padding:0;font:inherit;cursor:pointer}.abstract-header__template-name{padding:4px 10px;border-radius:6px;background:var(--p-primary-50, #eef4ff);color:var(--p-primary-color, #3b6cff);font-size:13px;font-weight:600}.abstract-header__template-empty{color:var(--surface-500, var(--p-text-muted-color));font-size:13px}@media(max-width:800px){.abstract-header__start,.abstract-header__end{width:100%}.abstract-header__search{flex:1}.abstract-header__search input{width:100%}}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "component", type: i2.Button, selector: "p-button", inputs: ["hostName", "type", "badge", "disabled", "raised", "rounded", "text", "plain", "outlined", "link", "tabindex", "size", "variant", "style", "styleClass", "badgeClass", "badgeSeverity", "ariaLabel", "autofocus", "iconPos", "icon", "label", "loading", "loadingIcon", "severity", "buttonProps", "fluid"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: IconField, selector: "p-iconfield, p-iconField, p-icon-field", inputs: ["hostName", "iconPosition", "styleClass"] }, { kind: "component", type: InputIcon, selector: "p-inputicon, p-inputIcon", inputs: ["hostName", "styleClass"] }, { kind: "directive", type: InputText, selector: "[pInputText]", inputs: ["hostName", "ptInputText", "pInputTextPT", "pInputTextUnstyled", "pSize", "variant", "fluid", "invalid"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrAbstractSummaryHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-abstract-summary-header', standalone: true, imports: [FormsModule, ButtonModule, IconField, InputIcon, InputText], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"abstract-header\">\n  <div class=\"abstract-header__start\">\n    <p-iconfield class=\"abstract-header__search\">\n      <p-inputicon styleClass=\"pi pi-search\" />\n      <input\n        pInputText\n        type=\"search\"\n        placeholder=\"Search clause data point...\"\n        aria-label=\"Search clause data point\"\n        [(ngModel)]=\"search\"\n      />\n    </p-iconfield>\n    <p-button\n      icon=\"pi pi-plus-circle\"\n      label=\"Add Clause\"\n      [rounded]=\"true\"\n      (onClick)=\"addClause.emit()\"\n    />\n  </div>\n\n  <div class=\"abstract-header__end\">\n    <span class=\"abstract-header__template\">\n      <span class=\"abstract-header__template-label\">Abstract Template:</span>\n      @if (templateName(); as name) {\n        <button type=\"button\" class=\"abstract-header__template-name\" (click)=\"selectTemplate.emit()\">\n          {{ name }}\n        </button>\n      } @else {\n        <button type=\"button\" class=\"abstract-header__template-empty\" (click)=\"selectTemplate.emit()\">\n          No Template Selected\n        </button>\n      }\n    </span>\n    <p-button\n      icon=\"pi pi-download\"\n      label=\"Export Abstracts\"\n      [outlined]=\"true\"\n      [rounded]=\"true\"\n      (onClick)=\"exportAbstracts.emit()\"\n    />\n  </div>\n</div>\n", styles: [":host{display:block}.abstract-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.abstract-header__start,.abstract-header__end,.abstract-header__template{display:flex;align-items:center;gap:12px}.abstract-header__search{--p-inputtext-border-radius: var(--border-radius-sm, var(--p-border-radius-md))}.abstract-header__search input{width:280px;font-size:13px}.abstract-header__start ::ng-deep .p-button,.abstract-header__end ::ng-deep .p-button{font-size:13px;white-space:nowrap}.abstract-header__template-label{color:var(--surface-700, var(--p-text-color));font-size:13px;font-weight:600}.abstract-header__template-name,.abstract-header__template-empty{border:0;background:transparent;padding:0;font:inherit;cursor:pointer}.abstract-header__template-name{padding:4px 10px;border-radius:6px;background:var(--p-primary-50, #eef4ff);color:var(--p-primary-color, #3b6cff);font-size:13px;font-weight:600}.abstract-header__template-empty{color:var(--surface-500, var(--p-text-muted-color));font-size:13px}@media(max-width:800px){.abstract-header__start,.abstract-header__end{width:100%}.abstract-header__search{flex:1}.abstract-header__search input{width:100%}}\n"] }]
        }], propDecorators: { search: [{ type: i0.Input, args: [{ isSignal: true, alias: "search", required: false }] }, { type: i0.Output, args: ["searchChange"] }], templateName: [{ type: i0.Input, args: [{ isSignal: true, alias: "templateName", required: false }] }], addClause: [{ type: i0.Output, args: ["addClause"] }], exportAbstracts: [{ type: i0.Output, args: ["exportAbstracts"] }], selectTemplate: [{ type: i0.Output, args: ["selectTemplate"] }] } });

/**
 * One abstract clause, drawn as a card.
 *
 * The heading is the clause. Each detail is a row, and that detail's points are the indented
 * rows beneath it. The chevron folds the rows away; they start open.
 */
class VcrAbstractClauseCardComponent {
    clause = input.required(...(ngDevMode ? [{ debugName: "clause" }] : /* istanbul ignore next */ []));
    addDataPoint = output();
    editRow = output();
    copyRow = output();
    expanded = signal(true, ...(ngDevMode ? [{ debugName: "expanded" }] : /* istanbul ignore next */ []));
    toggle() {
        this.expanded.update((open) => !open);
    }
    detailRef(detail) {
        return { clauseId: this.clause().id, detailId: detail.id, pointId: null };
    }
    pointRef(detail, point) {
        return { clauseId: this.clause().id, detailId: detail.id, pointId: point.id };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrAbstractClauseCardComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: VcrAbstractClauseCardComponent, isStandalone: true, selector: "vcr-abstract-clause-card", inputs: { clause: { classPropertyName: "clause", publicName: "clause", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { addDataPoint: "addDataPoint", editRow: "editRow", copyRow: "copyRow" }, ngImport: i0, template: "<article class=\"clause-card\">\n  <header class=\"clause-card__header\">\n    <h3 class=\"clause-card__title\">{{ clause().name }}</h3>\n    <span class=\"clause-card__tools\">\n      <button type=\"button\" class=\"clause-card__add\" (click)=\"addDataPoint.emit(clause().id)\">\n        Add Data Point\n      </button>\n      <button\n        type=\"button\"\n        class=\"clause-card__fold\"\n        (click)=\"toggle()\"\n        [attr.aria-expanded]=\"expanded()\"\n        [attr.aria-label]=\"expanded() ? 'Collapse ' + clause().name : 'Expand ' + clause().name\"\n      >\n        <i class=\"pi\" [class.pi-chevron-up]=\"expanded()\" [class.pi-chevron-down]=\"!expanded()\" aria-hidden=\"true\"></i>\n      </button>\n    </span>\n  </header>\n\n  @if (expanded()) {\n    <ul class=\"clause-card__rows\">\n      @for (detail of clause().details; track detail.id) {\n        <li class=\"clause-card__row\">\n          <span class=\"clause-card__label\">{{ detail.label }}</span>\n          <span class=\"clause-card__actions\">\n            <button\n              type=\"button\"\n              class=\"clause-card__icon\"\n              aria-label=\"Edit {{ detail.label }}\"\n              (click)=\"editRow.emit(detailRef(detail))\"\n            >\n              <i class=\"pi pi-pencil\" aria-hidden=\"true\"></i>\n            </button>\n            <button\n              type=\"button\"\n              class=\"clause-card__icon\"\n              aria-label=\"Copy {{ detail.label }}\"\n              (click)=\"copyRow.emit(detailRef(detail))\"\n            >\n              <i class=\"pi pi-clone\" aria-hidden=\"true\"></i>\n            </button>\n          </span>\n        </li>\n        @for (point of detail.points; track point.id) {\n          <li class=\"clause-card__row clause-card__row--point\">\n            <span class=\"clause-card__label\">{{ point.label }}</span>\n            <span class=\"clause-card__actions\">\n              <button\n                type=\"button\"\n                class=\"clause-card__icon\"\n                aria-label=\"Edit {{ point.label }}\"\n                (click)=\"editRow.emit(pointRef(detail, point))\"\n              >\n                <i class=\"pi pi-pencil\" aria-hidden=\"true\"></i>\n              </button>\n              <button\n                type=\"button\"\n                class=\"clause-card__icon\"\n                aria-label=\"Copy {{ point.label }}\"\n                (click)=\"copyRow.emit(pointRef(detail, point))\"\n              >\n                <i class=\"pi pi-clone\" aria-hidden=\"true\"></i>\n              </button>\n            </span>\n          </li>\n        }\n      }\n    </ul>\n  }\n</article>\n", styles: [":host{display:block;min-width:0}.clause-card{overflow:hidden;border:1px solid var(--surface-200, var(--p-content-border-color));border-radius:8px;background:var(--surface-0, var(--p-content-background))}.clause-card__header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:var(--surface-50, var(--p-content-hover-background));border-bottom:1px solid var(--surface-200, var(--p-content-border-color))}.clause-card__title{margin:0;color:var(--surface-700, var(--p-text-color));font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}.clause-card__tools{display:inline-flex;align-items:center;gap:4px}.clause-card__add,.clause-card__fold{border:0;background:transparent;color:var(--p-primary-color, #3b6cff);cursor:pointer}.clause-card__add{padding:0;font-size:13px;font-weight:600;white-space:nowrap}.clause-card__fold{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0}.clause-card__rows{list-style:none;margin:0;padding:0}.clause-card__row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px 16px;border-top:1px solid var(--surface-100, var(--p-content-border-color))}.clause-card__row:first-child{border-top:0}.clause-card__row--point{padding-left:32px}.clause-card__label{color:var(--surface-700, var(--p-text-color));font-size:13px;line-height:1.4}.clause-card__actions{display:inline-flex;align-items:center;gap:2px;flex:0 0 auto}.clause-card__icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--surface-500, var(--p-text-muted-color));cursor:pointer}.clause-card__icon:hover{background:var(--surface-100, var(--p-content-hover-background));color:var(--surface-700, var(--p-text-color))}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrAbstractClauseCardComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-abstract-clause-card', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: "<article class=\"clause-card\">\n  <header class=\"clause-card__header\">\n    <h3 class=\"clause-card__title\">{{ clause().name }}</h3>\n    <span class=\"clause-card__tools\">\n      <button type=\"button\" class=\"clause-card__add\" (click)=\"addDataPoint.emit(clause().id)\">\n        Add Data Point\n      </button>\n      <button\n        type=\"button\"\n        class=\"clause-card__fold\"\n        (click)=\"toggle()\"\n        [attr.aria-expanded]=\"expanded()\"\n        [attr.aria-label]=\"expanded() ? 'Collapse ' + clause().name : 'Expand ' + clause().name\"\n      >\n        <i class=\"pi\" [class.pi-chevron-up]=\"expanded()\" [class.pi-chevron-down]=\"!expanded()\" aria-hidden=\"true\"></i>\n      </button>\n    </span>\n  </header>\n\n  @if (expanded()) {\n    <ul class=\"clause-card__rows\">\n      @for (detail of clause().details; track detail.id) {\n        <li class=\"clause-card__row\">\n          <span class=\"clause-card__label\">{{ detail.label }}</span>\n          <span class=\"clause-card__actions\">\n            <button\n              type=\"button\"\n              class=\"clause-card__icon\"\n              aria-label=\"Edit {{ detail.label }}\"\n              (click)=\"editRow.emit(detailRef(detail))\"\n            >\n              <i class=\"pi pi-pencil\" aria-hidden=\"true\"></i>\n            </button>\n            <button\n              type=\"button\"\n              class=\"clause-card__icon\"\n              aria-label=\"Copy {{ detail.label }}\"\n              (click)=\"copyRow.emit(detailRef(detail))\"\n            >\n              <i class=\"pi pi-clone\" aria-hidden=\"true\"></i>\n            </button>\n          </span>\n        </li>\n        @for (point of detail.points; track point.id) {\n          <li class=\"clause-card__row clause-card__row--point\">\n            <span class=\"clause-card__label\">{{ point.label }}</span>\n            <span class=\"clause-card__actions\">\n              <button\n                type=\"button\"\n                class=\"clause-card__icon\"\n                aria-label=\"Edit {{ point.label }}\"\n                (click)=\"editRow.emit(pointRef(detail, point))\"\n              >\n                <i class=\"pi pi-pencil\" aria-hidden=\"true\"></i>\n              </button>\n              <button\n                type=\"button\"\n                class=\"clause-card__icon\"\n                aria-label=\"Copy {{ point.label }}\"\n                (click)=\"copyRow.emit(pointRef(detail, point))\"\n              >\n                <i class=\"pi pi-clone\" aria-hidden=\"true\"></i>\n              </button>\n            </span>\n          </li>\n        }\n      }\n    </ul>\n  }\n</article>\n", styles: [":host{display:block;min-width:0}.clause-card{overflow:hidden;border:1px solid var(--surface-200, var(--p-content-border-color));border-radius:8px;background:var(--surface-0, var(--p-content-background))}.clause-card__header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:var(--surface-50, var(--p-content-hover-background));border-bottom:1px solid var(--surface-200, var(--p-content-border-color))}.clause-card__title{margin:0;color:var(--surface-700, var(--p-text-color));font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}.clause-card__tools{display:inline-flex;align-items:center;gap:4px}.clause-card__add,.clause-card__fold{border:0;background:transparent;color:var(--p-primary-color, #3b6cff);cursor:pointer}.clause-card__add{padding:0;font-size:13px;font-weight:600;white-space:nowrap}.clause-card__fold{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0}.clause-card__rows{list-style:none;margin:0;padding:0}.clause-card__row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px 16px;border-top:1px solid var(--surface-100, var(--p-content-border-color))}.clause-card__row:first-child{border-top:0}.clause-card__row--point{padding-left:32px}.clause-card__label{color:var(--surface-700, var(--p-text-color));font-size:13px;line-height:1.4}.clause-card__actions{display:inline-flex;align-items:center;gap:2px;flex:0 0 auto}.clause-card__icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--surface-500, var(--p-text-muted-color));cursor:pointer}.clause-card__icon:hover{background:var(--surface-100, var(--p-content-hover-background));color:var(--surface-700, var(--p-text-color))}\n"] }]
        }], propDecorators: { clause: [{ type: i0.Input, args: [{ isSignal: true, alias: "clause", required: true }] }], addDataPoint: [{ type: i0.Output, args: ["addDataPoint"] }], editRow: [{ type: i0.Output, args: ["editRow"] }], copyRow: [{ type: i0.Output, args: ["copyRow"] }] } });

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
class VcrAbstractSummaryComponent {
    templateName = input(null, ...(ngDevMode ? [{ debugName: "templateName" }] : /* istanbul ignore next */ []));
    clauses = input([], ...(ngDevMode ? [{ debugName: "clauses" }] : /* istanbul ignore next */ []));
    search = model('', ...(ngDevMode ? [{ debugName: "search" }] : /* istanbul ignore next */ []));
    addClause = output();
    exportAbstracts = output();
    selectTemplate = output();
    addDataPoint = output();
    editRow = output();
    copyRow = output();
    visibleClauses = computed(() => visibleAbstractClauses(this.clauses(), this.search()), ...(ngDevMode ? [{ debugName: "visibleClauses" }] : /* istanbul ignore next */ []));
    hasTemplate() {
        const name = this.templateName();
        return name !== null && name.trim() !== '';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrAbstractSummaryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.23", type: VcrAbstractSummaryComponent, isStandalone: true, selector: "vcr-abstract-summary", inputs: { templateName: { classPropertyName: "templateName", publicName: "templateName", isSignal: true, isRequired: false, transformFunction: null }, clauses: { classPropertyName: "clauses", publicName: "clauses", isSignal: true, isRequired: false, transformFunction: null }, search: { classPropertyName: "search", publicName: "search", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { search: "searchChange", addClause: "addClause", exportAbstracts: "exportAbstracts", selectTemplate: "selectTemplate", addDataPoint: "addDataPoint", editRow: "editRow", copyRow: "copyRow" }, ngImport: i0, template: "<vcr-abstract-summary-header\n  [(search)]=\"search\"\n  [templateName]=\"templateName()\"\n  (addClause)=\"addClause.emit()\"\n  (exportAbstracts)=\"exportAbstracts.emit()\"\n  (selectTemplate)=\"selectTemplate.emit()\"\n/>\n\n@if (!hasTemplate()) {\n  <div class=\"abstract-summary__empty\">\n    <span class=\"abstract-summary__mark\" aria-hidden=\"true\">\n      <i class=\"pi pi-file\"></i>\n      <i class=\"pi pi-search\"></i>\n    </span>\n    <p class=\"abstract-summary__empty-title\">Select a template</p>\n    <p class=\"abstract-summary__empty-note\">Click the button below to choose a clause abstract template.</p>\n    <button type=\"button\" class=\"abstract-summary__select\" (click)=\"selectTemplate.emit()\">\n      <i class=\"pi pi-table\" aria-hidden=\"true\"></i>\n      Select Template\n    </button>\n  </div>\n} @else if (visibleClauses().length === 0) {\n  <p class=\"abstract-summary__none\">No clause data points match this search.</p>\n} @else {\n  <div class=\"abstract-summary__cards\">\n    @for (clause of visibleClauses(); track clause.id) {\n      <vcr-abstract-clause-card\n        [clause]=\"clause\"\n        (addDataPoint)=\"addDataPoint.emit($event)\"\n        (editRow)=\"editRow.emit($event)\"\n        (copyRow)=\"copyRow.emit($event)\"\n      />\n    }\n  </div>\n}\n", styles: [":host{display:flex;flex-direction:column;gap:16px}.abstract-summary__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.abstract-summary__empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:360px;padding:32px 16px;border:1px dashed var(--surface-300, var(--p-content-border-color));border-radius:8px;text-align:center}.abstract-summary__mark{position:relative;display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;margin-bottom:8px;border-radius:10px;background:var(--surface-900, #1e293b);color:#fff;font-size:20px}.abstract-summary__mark .pi-search{position:absolute;right:6px;bottom:6px;font-size:11px}.abstract-summary__empty-title{margin:0;color:var(--surface-900, var(--p-text-color));font-size:16px;font-weight:700}.abstract-summary__empty-note,.abstract-summary__none{margin:0;color:var(--surface-500, var(--p-text-muted-color));font-size:13px}.abstract-summary__select{display:inline-flex;align-items:center;gap:6px;margin-top:8px;border:0;background:transparent;color:var(--p-primary-color, #3b6cff);font-size:14px;font-weight:600;cursor:pointer}@media(max-width:800px){.abstract-summary__cards{grid-template-columns:1fr}}\n"], dependencies: [{ kind: "component", type: VcrAbstractSummaryHeaderComponent, selector: "vcr-abstract-summary-header", inputs: ["search", "templateName"], outputs: ["searchChange", "addClause", "exportAbstracts", "selectTemplate"] }, { kind: "component", type: VcrAbstractClauseCardComponent, selector: "vcr-abstract-clause-card", inputs: ["clause"], outputs: ["addDataPoint", "editRow", "copyRow"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.23", ngImport: i0, type: VcrAbstractSummaryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vcr-abstract-summary', standalone: true, imports: [VcrAbstractSummaryHeaderComponent, VcrAbstractClauseCardComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: "<vcr-abstract-summary-header\n  [(search)]=\"search\"\n  [templateName]=\"templateName()\"\n  (addClause)=\"addClause.emit()\"\n  (exportAbstracts)=\"exportAbstracts.emit()\"\n  (selectTemplate)=\"selectTemplate.emit()\"\n/>\n\n@if (!hasTemplate()) {\n  <div class=\"abstract-summary__empty\">\n    <span class=\"abstract-summary__mark\" aria-hidden=\"true\">\n      <i class=\"pi pi-file\"></i>\n      <i class=\"pi pi-search\"></i>\n    </span>\n    <p class=\"abstract-summary__empty-title\">Select a template</p>\n    <p class=\"abstract-summary__empty-note\">Click the button below to choose a clause abstract template.</p>\n    <button type=\"button\" class=\"abstract-summary__select\" (click)=\"selectTemplate.emit()\">\n      <i class=\"pi pi-table\" aria-hidden=\"true\"></i>\n      Select Template\n    </button>\n  </div>\n} @else if (visibleClauses().length === 0) {\n  <p class=\"abstract-summary__none\">No clause data points match this search.</p>\n} @else {\n  <div class=\"abstract-summary__cards\">\n    @for (clause of visibleClauses(); track clause.id) {\n      <vcr-abstract-clause-card\n        [clause]=\"clause\"\n        (addDataPoint)=\"addDataPoint.emit($event)\"\n        (editRow)=\"editRow.emit($event)\"\n        (copyRow)=\"copyRow.emit($event)\"\n      />\n    }\n  </div>\n}\n", styles: [":host{display:flex;flex-direction:column;gap:16px}.abstract-summary__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.abstract-summary__empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:360px;padding:32px 16px;border:1px dashed var(--surface-300, var(--p-content-border-color));border-radius:8px;text-align:center}.abstract-summary__mark{position:relative;display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;margin-bottom:8px;border-radius:10px;background:var(--surface-900, #1e293b);color:#fff;font-size:20px}.abstract-summary__mark .pi-search{position:absolute;right:6px;bottom:6px;font-size:11px}.abstract-summary__empty-title{margin:0;color:var(--surface-900, var(--p-text-color));font-size:16px;font-weight:700}.abstract-summary__empty-note,.abstract-summary__none{margin:0;color:var(--surface-500, var(--p-text-muted-color));font-size:13px}.abstract-summary__select{display:inline-flex;align-items:center;gap:6px;margin-top:8px;border:0;background:transparent;color:var(--p-primary-color, #3b6cff);font-size:14px;font-weight:600;cursor:pointer}@media(max-width:800px){.abstract-summary__cards{grid-template-columns:1fr}}\n"] }]
        }], propDecorators: { templateName: [{ type: i0.Input, args: [{ isSignal: true, alias: "templateName", required: false }] }], clauses: [{ type: i0.Input, args: [{ isSignal: true, alias: "clauses", required: false }] }], search: [{ type: i0.Input, args: [{ isSignal: true, alias: "search", required: false }] }, { type: i0.Output, args: ["searchChange"] }], addClause: [{ type: i0.Output, args: ["addClause"] }], exportAbstracts: [{ type: i0.Output, args: ["exportAbstracts"] }], selectTemplate: [{ type: i0.Output, args: ["selectTemplate"] }], addDataPoint: [{ type: i0.Output, args: ["addDataPoint"] }], editRow: [{ type: i0.Output, args: ["editRow"] }], copyRow: [{ type: i0.Output, args: ["copyRow"] }] } });

/*
 * Public API Surface of velocity-core-renderer/ui
 *
 * The chrome a list screen is built from — the pieces that are not a field renderer and not
 * specific to one app's data. It is a secondary entry point for the same reason `vocabulary` is
 * one, but pulling in the opposite direction: `vocabulary` exists to keep PrimeNG *out* of an
 * eager import, and this entry point exists to keep PrimeNG *contained* now that something other
 * than the renderers needs it.
 *
 * So: **this entry point carries PrimeNG and must only be reached from a lazy route.** Importing
 * it from `app.config.ts`, a root component, or anything else in the initial chunk puts
 * `primeng/button`, `primeng/inputtext` and their theme code into every page load. That is not
 * hypothetical — importing the field-type names through the main entry point once cost
 * `velocity-core-ui` about 130 kB of initial bundle and broke its size budget, which is why
 * `vocabulary` was split out in the first place.
 *
 * `VcrToastService` is the one exception worth naming: it is `providedIn: 'root'`, so a host that
 * injects it from eager code pays for this entry point. Inject it from the same lazy screens that
 * use the components.
 */

/**
 * Generated bundle index. Do not edit.
 */

export { VCR_TOAST_DEFAULT_LIFE, VCR_TOAST_ERROR_LIFE, VcrAbstractClauseCardComponent, VcrAbstractSummaryComponent, VcrAbstractSummaryHeaderComponent, VcrPageHeaderComponent, VcrToastService, visibleAbstractClauses };
//# sourceMappingURL=velocity-core-renderer-ui.mjs.map
