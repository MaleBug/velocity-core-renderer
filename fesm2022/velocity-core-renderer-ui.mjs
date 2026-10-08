import * as i0 from '@angular/core';
import { input, model, output, ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
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

export { VCR_TOAST_DEFAULT_LIFE, VCR_TOAST_ERROR_LIFE, VcrPageHeaderComponent, VcrToastService };
//# sourceMappingURL=velocity-core-renderer-ui.mjs.map
