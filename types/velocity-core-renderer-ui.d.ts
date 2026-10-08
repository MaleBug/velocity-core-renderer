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

export { VCR_TOAST_DEFAULT_LIFE, VCR_TOAST_ERROR_LIFE, VcrPageHeaderComponent, VcrToastService };
