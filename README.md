# velocity-core-renderer

Field-definition-type renderers for the Velocity Core platform. One field type, one control, one
canonical vocabulary — shared by `velocity-core-ui-admin` and `velocity-core-ui` so the two cannot
drift apart.

The package has **no dependency injection**: no services, no HTTP, no store, no router. Everything
arrives through signal inputs, which is what makes it safe to render the same field in two apps.

> **This repository is generated.** Every file here is build output from
> `Bermwood/velocity-core-ui-admin`, under `projects/velocity-core-renderer/`. Pull requests
> opened here cannot be merged — changes go to the source repo and arrive with the next release.

## Install

```bash
npm install git+https://github.com/MaleBug/velocity-core-renderer.git#v0.1.0
```

```json
"dependencies": {
  "velocity-core-renderer": "git+https://github.com/MaleBug/velocity-core-renderer.git#v0.1.0"
}
```

Use the explicit `git+https://` form rather than the `github:MaleBug/…` shorthand. npm normalises
the shorthand to `git+ssh://` in `package-lock.json`, and a CI runner with no SSH key then fails
`npm ci` with `Permission denied (publickey)` — on a public repo, which reads as an access problem
when it is really a protocol one.

Pin a tag. Tags here are immutable: a fix ships as a new version, never as a moved tag.

## Peer requirements

| Package | Range |
| --- | --- |
| `@angular/common`, `@angular/core`, `@angular/forms` | `^21.2.0` |
| `primeng` | `^21.1.6` |
| `primeicons` | `^7.0.0` |

The library is built in Angular's partial-Ivy mode, which is **one-directional**: an app on Angular
21.2 or later can consume it; an app on an earlier version cannot, and fails at build time with a
linker error. The consuming app also needs a PrimeNG theme configured (`providePrimeNG`), or the
inputs render unstyled.

## Entry points

There are two, and the split is load-bearing rather than cosmetic.

```ts
// Everything: the renderers, the registry, the facade, the config codecs — and the vocabulary.
import { FieldInputComponent, findFieldRenderer } from 'velocity-core-renderer';

// The field-type names alone. No Angular, no PrimeNG, no components.
import { FieldDefinitionTypes, FIELD_TYPE_OPTIONS } from 'velocity-core-renderer/vocabulary';
```

**Import from `/vocabulary` in any file that lands in the initial bundle** — layout, routing,
section stubs. Behind a single entry point the string table drags the renderer components and their
PrimeNG imports along with it: measured at about **130 kB of initial bundle** in `velocity-core-ui`,
enough to break its size budget. Only the screens that actually draw a field should import the root.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FieldInputComponent } from 'velocity-core-renderer';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FieldInputComponent],
  template: `
    <vcr-field-input
      fieldType="Text"
      fieldKey="customerName"
      [fieldConfig]="config"
      [(value)]="value"
      (blurred)="save()"
    />
  `,
})
export class ExampleComponent {
  readonly config = JSON.stringify({ placeholder: 'Jane Doe', maxLength: 80 });
  readonly value = signal('');
  save() {}
}
```

### `<vcr-field-input>`

| Input | Type | Default | |
| --- | --- | --- | --- |
| `fieldType` | `string` | — | **Required.** A `FieldDefinitionType` name. |
| `fieldConfig` | `string \| null` | `null` | The field's saved config, as the raw wire JSON string. |
| `fieldKey` | `string` | `''` | Becomes the control's `id`/`name`. |
| `label` | `string` | `''` | |
| `showLabel` | `boolean` | `false` | Off by default — most consumers draw their own label. |
| `required`, `disabled`, `invalid` | `boolean` | `false` | |

`value` is a two-way `model<string>()`. **Every field type reads and writes a string**, whatever the
underlying control works in; the descriptor's codec handles the conversion.

`blurred` fires once the user leaves the control, after the value has settled. It is silent for a
renderer that does not declare it and for an unregistered field type.

`fieldType` is **PascalCase** — `Text`, `Email`, `DatePicker`, `RadioButton`. This is what the
backend has always stored. Lowercase spellings have never existed on the wire.

## What v0.1.0 renders

| Field type | Control |
| --- | --- |
| `Text`, `Email`, `Phone`, `Url` | PrimeNG text input, typed per variant |
| everything else | plain `<textarea>` fallback |

The fallback is deliberate, not an error state — an unregistered type stays editable. Eight further
renderers (textarea, number, currency, checkbox, date, radio, select, media) exist in the admin app
and have not been extracted yet.

`findFieldRenderer(fieldType)` returns `null` for an unregistered type, and
`isFieldRendererRegistered(fieldType)` answers the same question as a boolean.

## Styling

Component styles are inlined into the bundle — **there is no stylesheet to import**. The facade
reads three CSS custom properties, which a consuming app must define:

```css
--content-color   /* label and helper text */
--error-color     /* invalid state */
--surface-500     /* the fallback textarea's border */
```

All three are already defined in both Velocity apps.

## Extending the registry

Renderer factory functions are exported so a consumer can compose its own descriptor over a
built-in renderer:

```ts
import { textFieldRenderer } from 'velocity-core-renderer';

const slug = textFieldRenderer({ placeholder: 'my-page-slug' });
```

Page-widget types (`DataTable`, `EsriMap`) are deliberately never registered here — nothing in this
package can draw one.

## Source and releases

Source lives in `Bermwood/velocity-core-ui-admin` at `projects/velocity-core-renderer/`. Releases
are cut with `npm run release:renderer` from that repo, which builds, tests against the built
artifact, and pushes the output here under a new tag.
