# TabulaRasa Theme

A minimal boilerplate theme for [October CMS](https://octobercms.com/) built on **Twig templating**, **Tailwind CSS**, **Alpine.js**, and **Laravel Mix**.

Based on the original [TabulaRasa theme](https://github.com/cjkpl/oc-tabularas-theme) by CJK.PL, adapted and maintained by **kashewknutt**.

## Stack

| Layer | Technology | Location |
|---|---|---|
| Templating | October CMS (Twig) | `layouts/`, `pages/`, `partials/` |
| CSS | Tailwind CSS v2 | `assets/src/css/app.css`, `tailwind.config.js` |
| JS | Alpine.js v2 | `assets/src/js/app.js` (bundled via Mix) |
| Build | Laravel Mix / webpack | `webpack.mix.js` |

## Features

- Minimal setup — one layout, one page, no bloat
- Custom color palette defined in `tailwind.config.js`
- Alpine.js bundled through Laravel Mix (no CDN dependencies)
- Hot-reload via BrowserSync during development
- Self-hosted Poppins font via npm
- October AJAX framework available via jQuery (optional — comment out `partials/site/scripts.htm` if unused)

## Installation

This is an October CMS theme. Place the theme folder in your October CMS installation:

```
themes/laravelmix/
```

The folder name must match the `setResourceRoot` path in `webpack.mix.js`.

### 1. Install dependencies

In the theme folder:

```
npm install
```

### 2. Build assets

```
npm run prod
```

### 3. Activate the theme

Enable the theme in the October CMS backend under **Settings → Front-end theme**.

## Development

### Hot-reload

Start your October CMS dev server (e.g. `php artisan serve` on port 8000), then run:

```
npm run watch
```

Open your site with hot-reload at **http://localhost:3000**.

### Configuration

If your October CMS URL differs from the default, update the proxy in `webpack.mix.js`:

```
proxy: 'http://127.0.0.1:8000/',
```

If you rename the theme folder, update the resource root accordingly:

```
mix
  .setPublicPath('./')
  .setResourceRoot('/themes/laravelmix')
```

### Key files

| File | Purpose |
|---|---|
| `layouts/default.htm` | Main layout |
| `pages/index.htm` | Homepage |
| `partials/site/` | Reusable template partials |
| `assets/src/css/app.css` | Tailwind entry point |
| `assets/src/js/app.js` | Alpine.js entry point |
| `tailwind.config.js` | Tailwind theme config (colors, fonts) |
| `webpack.mix.js` | Laravel Mix build config |

## Alpine.js

Alpine.js is bundled via Laravel Mix and loaded through `partials/site/scripts.htm`. Add Alpine directives directly in your Twig templates:

```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <p x-show="open">Hello from Alpine!</p>
</div>
```

Alpine 2.x is used for compatibility with Laravel Mix 5. Do not activate Vue.js and Alpine.js at the same time unless Vue is scoped locally.

## Theme Colors

The theme defines four custom color sets in `tailwind.config.js`: **primary**, **secondary**, **tertiary**, and **grey**, each with five variations (lightest, light, default, dark, darkest). Standard Tailwind `gray-100` through `gray-900` are also included.

To use standard Tailwind colors instead, remove the custom `colors` section from `tailwind.config.js`.

## Optional: Tailwind Typography

The `@tailwindcss/typography` plugin provides `prose` classes for rich text content. It is included as a dependency but commented out in `tailwind.config.js` for compatibility. Uncomment the plugin to enable it:

```html
<article class="prose lg:prose-xl">
  <h1>Your heading</h1>
  <p>Your content...</p>
</article>
```

Docs: https://github.com/tailwindlabs/tailwindcss-typography

## Optional: Self-hosted Fonts

Fonts can be added via npm. Poppins is included by default:

```
npm install fontsource-poppins
```

Import in `assets/src/css/app.css`:

```
@import "~fontsource-poppins/400.css";
@import "~fontsource-poppins/500.css";
@import "~fontsource-poppins/700.css";
```

See https://github.com/fontsource/fontsource for available fonts.

## Production Build

```
npm run prod
```

Do not deploy `node_modules/` — it is only needed during development. Compiled assets live in `assets/dist/`.

## License

MIT License — see [LICENSE.md](LICENSE.md).

Original theme by [CJK.PL](https://cjk.pl). Adapted by **kashewknutt**.

## Changelog

### 2.1.0 — 2026-06-05 (kashewknutt)

- Configured stack: Twig (October CMS) + Tailwind CSS + Alpine.js + Laravel Mix
- Alpine.js bundled via npm and Laravel Mix (replaces CDN loading)
- Theme resource root set to `/themes/laravelmix`
- Added Alpine.js demo on homepage

### 2.0.0 — 2020-11-28 (CJK.PL)

- TailwindCSS upgraded to `postcss7-compat@^2.0.1`
- Self-hosted fonts via fontsource npm packages

### 1.0.2 — 2020-11-11 (CJK.PL)

- Added Typography plugin support
- Added Alpine.js CDN partial (since replaced)
- Updated jQuery to 3.5.1
