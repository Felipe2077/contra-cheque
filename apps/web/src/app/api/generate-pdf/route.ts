// apps/web/src/app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Margin, PaperFormat } from 'puppeteer';

// Função auxiliar para obter o conteúdo do seu CSS global.
// Precisaremos discutir a melhor forma de fazer isso no seu projeto.
// Por enquanto, vamos assumir que podemos passar como string ou ler de um arquivo.
async function getGlobalCssContent(): Promise<string> {
  // TODO: Implementar a leitura do seu globals.css compilado ou o conteúdo relevante.
  // Isso é CRUCIAL para que oklch e Tailwind funcionem no PDF.
  // Exemplo placeholder (NÃO USAR EM PRODUÇÃO, APENAS PARA TESTE INICIAL):
  return `
  /* [next]/internal/font/google/geist_e531dabc.module.css [app-client] (css) */
@font-face {
  font-family: Geist;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../media/gyByhwUxId8gMEwYGFWNOITddY4-s.b7d310ad.woff2") format("woff2");
  unicode-range: U+301, U+400-45F, U+490-491, U+4B0-4B1, U+2116;
}

@font-face {
  font-family: Geist;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../media/gyByhwUxId8gMEwSGFWNOITddY4-s.81df3a5b.woff2") format("woff2");
  unicode-range: U+100-2BA, U+2BD-2C5, U+2C7-2CC, U+2CE-2D7, U+2DD-2FF, U+304, U+308, U+329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

@font-face {
  font-family: Geist;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../media/gyByhwUxId8gMEwcGFWNOITd-s.p.da1ebef7.woff2") format("woff2");
  unicode-range: U+??, U+131, U+152-153, U+2BB-2BC, U+2C6, U+2DA, U+2DC, U+304, U+308, U+329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: Geist Fallback;
  src: local(Arial);
  ascent-override: 95.94%;
  descent-override: 28.16%;
  line-gap-override: 0.0%;
  size-adjust: 104.76%;
}

.geist_e531dabc-module__QGiZLq__className {
  font-family: Geist, Geist Fallback;
  font-style: normal;
}

.geist_e531dabc-module__QGiZLq__variable {
  --font-geist-sans: "Geist", "Geist Fallback";
}


/* [next]/internal/font/google/geist_mono_68a01160.module.css [app-client] (css) */
@font-face {
  font-family: Geist Mono;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../media/or3nQ6H_1_WfwkMZI_qYFrMdmhHkjkotbA-s.cb6bbcb1.woff2") format("woff2");
  unicode-range: U+301, U+400-45F, U+490-491, U+4B0-4B1, U+2116;
}

@font-face {
  font-family: Geist Mono;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../media/or3nQ6H_1_WfwkMZI_qYFrkdmhHkjkotbA-s.e32db976.woff2") format("woff2");
  unicode-range: U+100-2BA, U+2BD-2C5, U+2C7-2CC, U+2CE-2D7, U+2DD-2FF, U+304, U+308, U+329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

@font-face {
  font-family: Geist Mono;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../media/or3nQ6H_1_WfwkMZI_qYFrcdmhHkjko-s.p.be19f591.woff2") format("woff2");
  unicode-range: U+??, U+131, U+152-153, U+2BB-2BC, U+2C6, U+2DA, U+2DC, U+304, U+308, U+329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: Geist Mono Fallback;
  src: local(Arial);
  ascent-override: 74.67%;
  descent-override: 21.92%;
  line-gap-override: 0.0%;
  size-adjust: 134.59%;
}

.geist_mono_68a01160-module__YLcDdW__className {
  font-family: Geist Mono, Geist Mono Fallback;
  font-style: normal;
}

.geist_mono_68a01160-module__YLcDdW__variable {
  --font-geist-mono: "Geist Mono", "Geist Mono Fallback";
}


/* [project]/apps/web/src/app/globals.css [app-client] (css) */
@layer properties {
  @supports (((-webkit-hyphens: none)) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
    *, :before, :after, ::backdrop {
      --tw-space-y-reverse: 0;
      --tw-space-x-reverse: 0;
      --tw-border-style: solid;
      --tw-leading: initial;
      --tw-font-weight: initial;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-color: initial;
      --tw-shadow-alpha: 100%;
      --tw-inset-shadow: 0 0 #0000;
      --tw-inset-shadow-color: initial;
      --tw-inset-shadow-alpha: 100%;
      --tw-ring-color: initial;
      --tw-ring-shadow: 0 0 #0000;
      --tw-inset-ring-color: initial;
      --tw-inset-ring-shadow: 0 0 #0000;
      --tw-ring-inset: initial;
      --tw-ring-offset-width: 0px;
      --tw-ring-offset-color: #fff;
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-outline-style: solid;
      --tw-backdrop-blur: initial;
      --tw-backdrop-brightness: initial;
      --tw-backdrop-contrast: initial;
      --tw-backdrop-grayscale: initial;
      --tw-backdrop-hue-rotate: initial;
      --tw-backdrop-invert: initial;
      --tw-backdrop-opacity: initial;
      --tw-backdrop-saturate: initial;
      --tw-backdrop-sepia: initial;
      --tw-translate-x: 0;
      --tw-translate-y: 0;
      --tw-translate-z: 0;
    }
  }
}

@layer theme {
  :root, :host {
    --color-red-700: oklch(50.5% .213 27.518);
    --color-green-700: oklch(52.7% .154 150.069);
    --color-gray-50: oklch(98.5% .002 247.839);
    --color-gray-200: oklch(92.8% .006 264.531);
    --color-stone-400: oklch(70.9% .01 56.259);
    --color-black: #000;
    --color-white: #fff;
    --spacing: .25rem;
    --container-sm: 24rem;
    --container-4xl: 56rem;
    --text-xs: .75rem;
    --text-xs--line-height: calc(1 / .75);
    --text-sm: .875rem;
    --text-sm--line-height: calc(1.25 / .875);
    --text-base: 1rem;
    --text-base--line-height: calc(1.5 / 1);
    --text-lg: 1.125rem;
    --text-lg--line-height: calc(1.75 / 1.125);
    --text-xl: 1.25rem;
    --text-xl--line-height: calc(1.75 / 1.25);
    --text-2xl: 1.5rem;
    --text-2xl--line-height: calc(2 / 1.5);
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --animate-spin: spin 1s linear infinite;
    --blur-sm: 8px;
    --default-transition-duration: .15s;
    --default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
    --default-font-family: var(--font-geist-sans);
    --default-mono-font-family: var(--font-geist-mono);
  }
}

@layer base {
  *, :after, :before, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    border: 0 solid;
    margin: 0;
    padding: 0;
  }

  html, :host {
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    line-height: 1.5;
    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");
    font-feature-settings: var(--default-font-feature-settings, normal);
    font-variation-settings: var(--default-font-variation-settings, normal);
    -webkit-tap-highlight-color: transparent;
  }

  hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }

  abbr:where([title]) {
    text-decoration: underline dotted;
  }

  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }

  a {
    color: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }

  b, strong {
    font-weight: bolder;
  }

  code, kbd, samp, pre {
    font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
    font-feature-settings: var(--default-mono-font-feature-settings, normal);
    font-variation-settings: var(--default-mono-font-variation-settings, normal);
    font-size: 1em;
  }

  small {
    font-size: 80%;
  }

  sub, sup {
    vertical-align: baseline;
    font-size: 75%;
    line-height: 0;
    position: relative;
  }

  sub {
    bottom: -.25em;
  }

  sup {
    top: -.5em;
  }

  table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }

  :-moz-focusring {
    outline: auto;
  }

  progress {
    vertical-align: baseline;
  }

  summary {
    display: list-item;
  }

  ol, ul, menu {
    list-style: none;
  }

  img, svg, video, canvas, audio, iframe, embed, object {
    vertical-align: middle;
    display: block;
  }

  img, video {
    max-width: 100%;
    height: auto;
  }

  button, input, select, optgroup, textarea, ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    opacity: 1;
    background-color: #0000;
    border-radius: 0;
  }

  :where(select:is([multiple], [size])) optgroup {
    font-weight: bolder;
  }

  :where(select:is([multiple], [size])) optgroup option {
    padding-inline-start: 20px;
  }

  ::file-selector-button {
    margin-inline-end: 4px;
  }

  ::placeholder {
    opacity: 1;
  }

  @supports (not ((-webkit-appearance: -apple-pay-button))) or (contain-intrinsic-size: 1px) {
    ::placeholder {
      color: currentColor;
    }

    @supports (color: color-mix(in lab, red, red)) {
      ::placeholder {
        color: color-mix(in oklab, currentcolor 50%, transparent);
      }
    }
  }

  textarea {
    resize: vertical;
  }

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-date-and-time-value {
    min-height: 1lh;
    text-align: inherit;
  }

  ::-webkit-datetime-edit {
    display: inline-flex;
  }

  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }

  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {
    padding-block: 0;
  }

  :-moz-ui-invalid {
    box-shadow: none;
  }

  button, input:where([type="button"], [type="reset"], [type="submit"]), ::file-selector-button {
    appearance: button;
  }

  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
    height: auto;
  }

  [hidden]:where(:not([hidden="until-found"])) {
    display: none !important;
  }

  * {
    border-color: var(--border);
    outline-color: var(--ring);
  }

  @supports (color: color-mix(in lab, red, red)) {
    * {
      outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
    }
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}

@layer components;

@layer utilities {
  .\@container\/card-header {
    container: card-header / inline-size;
  }

  .pointer-events-none {
    pointer-events: none;
  }

  .absolute {
    position: absolute;
  }

  .relative {
    position: relative;
  }

  .sticky {
    position: sticky;
  }

  .top-0 {
    top: calc(var(--spacing) * 0);
  }

  .right-2 {
    right: calc(var(--spacing) * 2);
  }

  .z-50 {
    z-index: 50;
  }

  .col-span-1 {
    grid-column: span 1 / span 1;
  }

  .col-span-2 {
    grid-column: span 2 / span 2;
  }

  .col-span-3 {
    grid-column: span 3 / span 3;
  }

  .col-span-4 {
    grid-column: span 4 / span 4;
  }

  .col-span-6 {
    grid-column: span 6 / span 6;
  }

  .col-span-10 {
    grid-column: span 10 / span 10;
  }

  .col-start-2 {
    grid-column-start: 2;
  }

  .row-span-1 {
    grid-row: span 1 / span 1;
  }

  .row-span-2 {
    grid-row: span 2 / span 2;
  }

  .row-start-1 {
    grid-row-start: 1;
  }

  .container {
    width: 100%;
  }

  @media (width >= 40rem) {
    .container {
      max-width: 40rem;
    }
  }

  @media (width >= 48rem) {
    .container {
      max-width: 48rem;
    }
  }

  @media (width >= 64rem) {
    .container {
      max-width: 64rem;
    }
  }

  @media (width >= 80rem) {
    .container {
      max-width: 80rem;
    }
  }

  @media (width >= 96rem) {
    .container {
      max-width: 96rem;
    }
  }

  .-mx-1 {
    margin-inline: calc(var(--spacing) * -1);
  }

  .mx-auto {
    margin-inline: auto;
  }

  .my-1 {
    margin-block: calc(var(--spacing) * 1);
  }

  .mt-4 {
    margin-top: calc(var(--spacing) * 4);
  }

  .mt-6 {
    margin-top: calc(var(--spacing) * 6);
  }

  .mr-1\.5 {
    margin-right: calc(var(--spacing) * 1.5);
  }

  .mr-2 {
    margin-right: calc(var(--spacing) * 2);
  }

  .mb-1 {
    margin-bottom: calc(var(--spacing) * 1);
  }

  .mb-3 {
    margin-bottom: calc(var(--spacing) * 3);
  }

  .mb-4 {
    margin-bottom: calc(var(--spacing) * 4);
  }

  .block {
    display: block;
  }

  .flex {
    display: flex;
  }

  .grid {
    display: grid;
  }

  .inline {
    display: inline;
  }

  .inline-flex {
    display: inline-flex;
  }

  .table {
    display: table;
  }

  .table-caption {
    display: table-caption;
  }

  .table-cell {
    display: table-cell;
  }

  .table-row {
    display: table-row;
  }

  .size-3\.5 {
    width: calc(var(--spacing) * 3.5);
    height: calc(var(--spacing) * 3.5);
  }

  .size-4 {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-9 {
    width: calc(var(--spacing) * 9);
    height: calc(var(--spacing) * 9);
  }

  .h-4 {
    height: calc(var(--spacing) * 4);
  }

  .h-6 {
    height: calc(var(--spacing) * 6);
  }

  .h-8 {
    height: calc(var(--spacing) * 8);
  }

  .h-9 {
    height: calc(var(--spacing) * 9);
  }

  .h-10 {
    height: calc(var(--spacing) * 10);
  }

  .h-12 {
    height: calc(var(--spacing) * 12);
  }

  .h-16 {
    height: calc(var(--spacing) * 16);
  }

  .h-\[var\(--radix-select-trigger-height\)\] {
    height: var(--radix-select-trigger-height);
  }

  .h-px {
    height: 1px;
  }

  .max-h-\(--radix-select-content-available-height\) {
    max-height: var(--radix-select-content-available-height);
  }

  .min-h-screen {
    min-height: 100vh;
  }

  .w-4 {
    width: calc(var(--spacing) * 4);
  }

  .w-10 {
    width: calc(var(--spacing) * 10);
  }

  .w-12 {
    width: calc(var(--spacing) * 12);
  }

  .w-fit {
    width: fit-content;
  }

  .w-full {
    width: 100%;
  }

  .max-w-4xl {
    max-width: var(--container-4xl);
  }

  .max-w-sm {
    max-width: var(--container-sm);
  }

  .min-w-0 {
    min-width: calc(var(--spacing) * 0);
  }

  .min-w-\[8rem\] {
    min-width: 8rem;
  }

  .min-w-\[var\(--radix-select-trigger-width\)\] {
    min-width: var(--radix-select-trigger-width);
  }

  .flex-shrink-0, .shrink-0 {
    flex-shrink: 0;
  }

  .flex-grow {
    flex-grow: 1;
  }

  .caption-bottom {
    caption-side: bottom;
  }

  .origin-\(--radix-select-content-transform-origin\) {
    transform-origin: var(--radix-select-content-transform-origin);
  }

  .animate-spin {
    animation: var(--animate-spin);
  }

  .cursor-default {
    cursor: default;
  }

  .scroll-my-1 {
    scroll-margin-block: calc(var(--spacing) * 1);
  }

  .auto-rows-min {
    grid-auto-rows: min-content;
  }

  .grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .grid-rows-3 {
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }

  .grid-rows-\[auto_auto\] {
    grid-template-rows: auto auto;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .items-start {
    align-items: flex-start;
  }

  .justify-between {
    justify-content: space-between;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .gap-1 {
    gap: calc(var(--spacing) * 1);
  }

  .gap-1\.5 {
    gap: calc(var(--spacing) * 1.5);
  }

  .gap-2 {
    gap: calc(var(--spacing) * 2);
  }

  .gap-6 {
    gap: calc(var(--spacing) * 6);
  }

  :where(.space-y-6 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 6) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 6) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-x-3 > :not(:last-child)) {
    --tw-space-x-reverse: 0;
    margin-inline-start: calc(calc(var(--spacing) * 3) * var(--tw-space-x-reverse));
    margin-inline-end: calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-x-reverse)));
  }

  .self-start {
    align-self: flex-start;
  }

  .justify-self-end {
    justify-self: flex-end;
  }

  .truncate {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .overflow-x-auto {
    overflow-x: auto;
  }

  .overflow-x-hidden {
    overflow-x: hidden;
  }

  .overflow-y-auto {
    overflow-y: auto;
  }

  .rounded-\[1px\] {
    border-radius: 1px;
  }

  .rounded-full {
    border-radius: 3.40282e38px;
  }

  .rounded-md {
    border-radius: calc(var(--radius)  - 2px);
  }

  .rounded-sm {
    border-radius: calc(var(--radius)  - 4px);
  }

  .rounded-xl {
    border-radius: calc(var(--radius)  + 4px);
  }

  .border {
    border-style: var(--tw-border-style);
    border-width: 1px;
  }

  .border-t {
    border-top-style: var(--tw-border-style);
    border-top-width: 1px;
  }

  .border-r {
    border-right-style: var(--tw-border-style);
    border-right-width: 1px;
  }

  .border-b {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }

  .border-input {
    border-color: var(--input);
  }

  .border-stone-400 {
    border-color: var(--color-stone-400);
  }

  .bg-background {
    background-color: var(--background);
  }

  .bg-background\/80 {
    background-color: var(--background);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-background\/80 {
      background-color: color-mix(in oklab, var(--background) 80%, transparent);
    }
  }

  .bg-black {
    background-color: var(--color-black);
  }

  .bg-border {
    background-color: var(--border);
  }

  .bg-card {
    background-color: var(--card);
  }

  .bg-destructive {
    background-color: var(--destructive);
  }

  .bg-destructive\/10 {
    background-color: var(--destructive);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-destructive\/10 {
      background-color: color-mix(in oklab, var(--destructive) 10%, transparent);
    }
  }

  .bg-gray-200 {
    background-color: var(--color-gray-200);
  }

  .bg-muted\/10 {
    background-color: var(--muted);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-muted\/10 {
      background-color: color-mix(in oklab, var(--muted) 10%, transparent);
    }
  }

  .bg-muted\/40 {
    background-color: var(--muted);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-muted\/40 {
      background-color: color-mix(in oklab, var(--muted) 40%, transparent);
    }
  }

  .bg-muted\/50 {
    background-color: var(--muted);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-muted\/50 {
      background-color: color-mix(in oklab, var(--muted) 50%, transparent);
    }
  }

  .bg-popover {
    background-color: var(--popover);
  }

  .bg-primary {
    background-color: var(--primary);
  }

  .bg-secondary {
    background-color: var(--secondary);
  }

  .bg-transparent {
    background-color: #0000;
  }

  .bg-white {
    background-color: var(--color-white);
  }

  .p-1 {
    padding: calc(var(--spacing) * 1);
  }

  .p-2 {
    padding: calc(var(--spacing) * 2);
  }

  .p-3 {
    padding: calc(var(--spacing) * 3);
  }

  .p-4 {
    padding: calc(var(--spacing) * 4);
  }

  .px-2 {
    padding-inline: calc(var(--spacing) * 2);
  }

  .px-3 {
    padding-inline: calc(var(--spacing) * 3);
  }

  .px-4 {
    padding-inline: calc(var(--spacing) * 4);
  }

  .px-6 {
    padding-inline: calc(var(--spacing) * 6);
  }

  .py-0\.5 {
    padding-block: calc(var(--spacing) * .5);
  }

  .py-1 {
    padding-block: calc(var(--spacing) * 1);
  }

  .py-1\.5 {
    padding-block: calc(var(--spacing) * 1.5);
  }

  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }

  .py-4 {
    padding-block: calc(var(--spacing) * 4);
  }

  .py-6 {
    padding-block: calc(var(--spacing) * 6);
  }

  .py-8 {
    padding-block: calc(var(--spacing) * 8);
  }

  .pt-6 {
    padding-top: calc(var(--spacing) * 6);
  }

  .pr-1 {
    padding-right: calc(var(--spacing) * 1);
  }

  .pr-8 {
    padding-right: calc(var(--spacing) * 8);
  }

  .pl-1 {
    padding-left: calc(var(--spacing) * 1);
  }

  .pl-2 {
    padding-left: calc(var(--spacing) * 2);
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .align-middle {
    vertical-align: middle;
  }

  .text-2xl {
    font-size: var(--text-2xl);
    line-height: var(--tw-leading, var(--text-2xl--line-height));
  }

  .text-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }

  .text-lg {
    font-size: var(--text-lg);
    line-height: var(--tw-leading, var(--text-lg--line-height));
  }

  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }

  .text-xl {
    font-size: var(--text-xl);
    line-height: var(--tw-leading, var(--text-xl--line-height));
  }

  .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }

  .text-\[0\.65rem\] {
    font-size: .65rem;
  }

  .leading-none {
    --tw-leading: 1;
    line-height: 1;
  }

  .font-bold {
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
  }

  .font-medium {
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
  }

  .font-semibold {
    --tw-font-weight: var(--font-weight-semibold);
    font-weight: var(--font-weight-semibold);
  }

  .whitespace-nowrap {
    white-space: nowrap;
  }

  .text-black {
    color: var(--color-black);
  }

  .text-card-foreground {
    color: var(--card-foreground);
  }

  .text-destructive {
    color: var(--destructive);
  }

  .text-foreground {
    color: var(--foreground);
  }

  .text-green-700 {
    color: var(--color-green-700);
  }

  .text-muted-foreground {
    color: var(--muted-foreground);
  }

  .text-muted-foreground\/50 {
    color: var(--muted-foreground);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .text-muted-foreground\/50 {
      color: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
    }
  }

  .text-popover-foreground {
    color: var(--popover-foreground);
  }

  .text-primary {
    color: var(--primary);
  }

  .text-primary-foreground {
    color: var(--primary-foreground);
  }

  .text-red-700 {
    color: var(--color-red-700);
  }

  .text-secondary-foreground {
    color: var(--secondary-foreground);
  }

  .text-white {
    color: var(--color-white);
  }

  .underline-offset-4 {
    text-underline-offset: 4px;
  }

  .antialiased {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .opacity-50 {
    opacity: .5;
  }

  .shadow-md {
    --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, #0000001a), 0 2px 4px -2px var(--tw-shadow-color, #0000001a);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .shadow-sm {
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, #0000001a), 0 1px 2px -1px var(--tw-shadow-color, #0000001a);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .shadow-xs {
    --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .outline-hidden {
    --tw-outline-style: none;
    outline-style: none;
  }

  @media (forced-colors: active) {
    .outline-hidden {
      outline-offset: 2px;
      outline: 2px solid #0000;
    }
  }

  .outline {
    outline-style: var(--tw-outline-style);
    outline-width: 1px;
  }

  .backdrop-blur-sm {
    --tw-backdrop-blur: blur(var(--blur-sm));
    backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
  }

  .transition-\[color\,box-shadow\] {
    transition-property: color, box-shadow;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }

  .transition-all {
    transition-property: all;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }

  .transition-colors {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }

  .outline-none {
    --tw-outline-style: none;
    outline-style: none;
  }

  .select-none {
    -webkit-user-select: none;
    user-select: none;
  }

  .group-data-\[disabled\=true\]\:pointer-events-none:is(:where(.group)[data-disabled="true"] *) {
    pointer-events: none;
  }

  .group-data-\[disabled\=true\]\:opacity-50:is(:where(.group)[data-disabled="true"] *) {
    opacity: .5;
  }

  .peer-disabled\:cursor-not-allowed:is(:where(.peer):disabled ~ *) {
    cursor: not-allowed;
  }

  .peer-disabled\:opacity-50:is(:where(.peer):disabled ~ *) {
    opacity: .5;
  }

  .selection\:bg-primary ::selection, .selection\:bg-primary::selection {
    background-color: var(--primary);
  }

  .selection\:text-primary-foreground ::selection, .selection\:text-primary-foreground::selection {
    color: var(--primary-foreground);
  }

  .file\:inline-flex::file-selector-button {
    display: inline-flex;
  }

  .file\:h-7::file-selector-button {
    height: calc(var(--spacing) * 7);
  }

  .file\:border-0::file-selector-button {
    border-style: var(--tw-border-style);
    border-width: 0;
  }

  .file\:bg-transparent::file-selector-button {
    background-color: #0000;
  }

  .file\:text-sm::file-selector-button {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }

  .file\:font-medium::file-selector-button {
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
  }

  .file\:text-foreground::file-selector-button {
    color: var(--foreground);
  }

  .placeholder\:text-muted-foreground::placeholder {
    color: var(--muted-foreground);
  }

  @media (hover: hover) {
    .hover\:bg-accent:hover {
      background-color: var(--accent);
    }
  }

  @media (hover: hover) {
    .hover\:bg-destructive\/90:hover {
      background-color: var(--destructive);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .hover\:bg-destructive\/90:hover {
        background-color: color-mix(in oklab, var(--destructive) 90%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .hover\:bg-gray-50:hover {
      background-color: var(--color-gray-50);
    }
  }

  @media (hover: hover) {
    .hover\:bg-muted\/50:hover {
      background-color: var(--muted);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .hover\:bg-muted\/50:hover {
        background-color: color-mix(in oklab, var(--muted) 50%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .hover\:bg-primary\/90:hover {
      background-color: var(--primary);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .hover\:bg-primary\/90:hover {
        background-color: color-mix(in oklab, var(--primary) 90%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .hover\:bg-secondary\/80:hover {
      background-color: var(--secondary);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .hover\:bg-secondary\/80:hover {
        background-color: color-mix(in oklab, var(--secondary) 80%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .hover\:text-accent-foreground:hover {
      color: var(--accent-foreground);
    }
  }

  @media (hover: hover) {
    .hover\:underline:hover {
      text-decoration-line: underline;
    }
  }

  .focus\:bg-accent:focus {
    background-color: var(--accent);
  }

  .focus\:text-accent-foreground:focus {
    color: var(--accent-foreground);
  }

  .focus-visible\:border-ring:focus-visible {
    border-color: var(--ring);
  }

  .focus-visible\:ring-\[3px\]:focus-visible {
    --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .focus-visible\:ring-destructive\/20:focus-visible {
    --tw-ring-color: var(--destructive);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .focus-visible\:ring-destructive\/20:focus-visible {
      --tw-ring-color: color-mix(in oklab, var(--destructive) 20%, transparent);
    }
  }

  .focus-visible\:ring-ring\/50:focus-visible {
    --tw-ring-color: var(--ring);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .focus-visible\:ring-ring\/50:focus-visible {
      --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
    }
  }

  .disabled\:pointer-events-none:disabled {
    pointer-events: none;
  }

  .disabled\:cursor-not-allowed:disabled {
    cursor: not-allowed;
  }

  .disabled\:opacity-50:disabled {
    opacity: .5;
  }

  .has-data-\[slot\=card-action\]\:grid-cols-\[1fr_auto\]:has([data-slot="card-action"]) {
    grid-template-columns: 1fr auto;
  }

  .has-\[\>svg\]\:px-2\.5:has( > svg) {
    padding-inline: calc(var(--spacing) * 2.5);
  }

  .has-\[\>svg\]\:px-3:has( > svg) {
    padding-inline: calc(var(--spacing) * 3);
  }

  .has-\[\>svg\]\:px-4:has( > svg) {
    padding-inline: calc(var(--spacing) * 4);
  }

  .aria-invalid\:border-destructive[aria-invalid="true"] {
    border-color: var(--destructive);
  }

  .aria-invalid\:ring-destructive\/20[aria-invalid="true"] {
    --tw-ring-color: var(--destructive);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .aria-invalid\:ring-destructive\/20[aria-invalid="true"] {
      --tw-ring-color: color-mix(in oklab, var(--destructive) 20%, transparent);
    }
  }

  .data-\[disabled\]\:pointer-events-none[data-disabled] {
    pointer-events: none;
  }

  .data-\[disabled\]\:opacity-50[data-disabled] {
    opacity: .5;
  }

  .data-\[error\=true\]\:text-destructive[data-error="true"] {
    color: var(--destructive);
  }

  .data-\[placeholder\]\:text-muted-foreground[data-placeholder] {
    color: var(--muted-foreground);
  }

  .data-\[side\=bottom\]\:translate-y-1[data-side="bottom"] {
    --tw-translate-y: calc(var(--spacing) * 1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .data-\[side\=bottom\]\:slide-in-from-top-2[data-side="bottom"] {
    --tw-enter-translate-y: calc(2 * var(--spacing) * -1);
  }

  .data-\[side\=left\]\:-translate-x-1[data-side="left"] {
    --tw-translate-x: calc(var(--spacing) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .data-\[side\=left\]\:slide-in-from-right-2[data-side="left"] {
    --tw-enter-translate-x: calc(2 * var(--spacing));
  }

  .data-\[side\=right\]\:translate-x-1[data-side="right"] {
    --tw-translate-x: calc(var(--spacing) * 1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .data-\[side\=right\]\:slide-in-from-left-2[data-side="right"] {
    --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
  }

  .data-\[side\=top\]\:-translate-y-1[data-side="top"] {
    --tw-translate-y: calc(var(--spacing) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .data-\[side\=top\]\:slide-in-from-bottom-2[data-side="top"] {
    --tw-enter-translate-y: calc(2 * var(--spacing));
  }

  .data-\[size\=default\]\:h-9[data-size="default"] {
    height: calc(var(--spacing) * 9);
  }

  .data-\[size\=sm\]\:h-8[data-size="sm"] {
    height: calc(var(--spacing) * 8);
  }

  :is(.\*\:data-\[slot\=select-value\]\:line-clamp-1 > *)[data-slot="select-value"] {
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
  }

  :is(.\*\:data-\[slot\=select-value\]\:flex > *)[data-slot="select-value"] {
    display: flex;
  }

  :is(.\*\:data-\[slot\=select-value\]\:items-center > *)[data-slot="select-value"] {
    align-items: center;
  }

  :is(.\*\:data-\[slot\=select-value\]\:gap-2 > *)[data-slot="select-value"] {
    gap: calc(var(--spacing) * 2);
  }

  .data-\[state\=closed\]\:animate-out[data-state="closed"] {
    animation: exit var(--tw-animation-duration, var(--tw-duration, .15s)) var(--tw-ease, ease);
  }

  .data-\[state\=closed\]\:fade-out-0[data-state="closed"] {
    --tw-exit-opacity: 0;
  }

  .data-\[state\=closed\]\:zoom-out-95[data-state="closed"] {
    --tw-exit-scale: .95;
  }

  .data-\[state\=open\]\:animate-in[data-state="open"] {
    animation: enter var(--tw-animation-duration, var(--tw-duration, .15s)) var(--tw-ease, ease);
  }

  .data-\[state\=open\]\:fade-in-0[data-state="open"] {
    --tw-enter-opacity: 0;
  }

  .data-\[state\=open\]\:zoom-in-95[data-state="open"] {
    --tw-enter-scale: .95;
  }

  .data-\[state\=selected\]\:bg-muted[data-state="selected"] {
    background-color: var(--muted);
  }

  @media (width >= 40rem) {
    .sm\:w-\[300px\] {
      width: 300px;
    }
  }

  @media (width >= 40rem) {
    :where(.sm\:space-x-4 > :not(:last-child)) {
      --tw-space-x-reverse: 0;
      margin-inline-start: calc(calc(var(--spacing) * 4) * var(--tw-space-x-reverse));
      margin-inline-end: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-x-reverse)));
    }
  }

  @media (width >= 40rem) {
    .sm\:text-2xl {
      font-size: var(--text-2xl);
      line-height: var(--tw-leading, var(--text-2xl--line-height));
    }
  }

  @media (width >= 48rem) {
    .md\:p-6 {
      padding: calc(var(--spacing) * 6);
    }
  }

  @media (width >= 48rem) {
    .md\:px-6 {
      padding-inline: calc(var(--spacing) * 6);
    }
  }

  @media (width >= 48rem) {
    .md\:text-sm {
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
  }

  @media (width >= 64rem) {
    .lg\:p-8 {
      padding: calc(var(--spacing) * 8);
    }
  }

  .dark\:border-input:is(.dark *) {
    border-color: var(--input);
  }

  .dark\:bg-destructive\/60:is(.dark *) {
    background-color: var(--destructive);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .dark\:bg-destructive\/60:is(.dark *) {
      background-color: color-mix(in oklab, var(--destructive) 60%, transparent);
    }
  }

  .dark\:bg-input\/30:is(.dark *) {
    background-color: var(--input);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .dark\:bg-input\/30:is(.dark *) {
      background-color: color-mix(in oklab, var(--input) 30%, transparent);
    }
  }

  @media (hover: hover) {
    .dark\:hover\:bg-accent\/50:is(.dark *):hover {
      background-color: var(--accent);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .dark\:hover\:bg-accent\/50:is(.dark *):hover {
        background-color: color-mix(in oklab, var(--accent) 50%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .dark\:hover\:bg-input\/50:is(.dark *):hover {
      background-color: var(--input);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .dark\:hover\:bg-input\/50:is(.dark *):hover {
        background-color: color-mix(in oklab, var(--input) 50%, transparent);
      }
    }
  }

  .dark\:focus-visible\:ring-destructive\/40:is(.dark *):focus-visible {
    --tw-ring-color: var(--destructive);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .dark\:focus-visible\:ring-destructive\/40:is(.dark *):focus-visible {
      --tw-ring-color: color-mix(in oklab, var(--destructive) 40%, transparent);
    }
  }

  .dark\:aria-invalid\:ring-destructive\/40:is(.dark *)[aria-invalid="true"] {
    --tw-ring-color: var(--destructive);
  }

  @supports (color: color-mix(in lab, red, red)) {
    .dark\:aria-invalid\:ring-destructive\/40:is(.dark *)[aria-invalid="true"] {
      --tw-ring-color: color-mix(in oklab, var(--destructive) 40%, transparent);
    }
  }

  @media print {
    .print\:mt-0 {
      margin-top: calc(var(--spacing) * 0);
    }
  }

  @media print {
    .print\:hidden {
      display: none;
    }
  }

  @media print {
    :where(.print\:space-y-0 > :not(:last-child)) {
      --tw-space-y-reverse: 0;
      margin-block-start: calc(calc(var(--spacing) * 0) * var(--tw-space-y-reverse));
      margin-block-end: calc(calc(var(--spacing) * 0) * calc(1 - var(--tw-space-y-reverse)));
    }
  }

  @media print {
    .print\:rounded-none {
      border-radius: 0;
    }
  }

  @media print {
    .print\:border-none {
      --tw-border-style: none;
      border-style: none;
    }
  }

  @media print {
    .print\:bg-white {
      background-color: var(--color-white);
    }
  }

  @media print {
    .print\:p-0 {
      padding: calc(var(--spacing) * 0);
    }
  }

  @media print {
    .print\:pt-0 {
      padding-top: calc(var(--spacing) * 0);
    }
  }

  @media print {
    .print\:shadow-none {
      --tw-shadow: 0 0 #0000;
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }

  .\[\&_svg\]\:pointer-events-none svg {
    pointer-events: none;
  }

  .\[\&_svg\]\:shrink-0 svg {
    flex-shrink: 0;
  }

  .\[\&_svg\:not\(\[class\*\=\'size-\'\]\)\]\:size-4 svg:not([class*="size-"]) {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .\[\&_svg\:not\(\[class\*\=\'text-\'\]\)\]\:text-muted-foreground svg:not([class*="text-"]) {
    color: var(--muted-foreground);
  }

  .\[\&_tr\]\:border-b tr {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }

  .\[\&_tr\:last-child\]\:border-0 tr:last-child {
    border-style: var(--tw-border-style);
    border-width: 0;
  }

  .\[\&\:has\(\[role\=checkbox\]\)\]\:pr-0:has([role="checkbox"]) {
    padding-right: calc(var(--spacing) * 0);
  }

  .\[\.border-b\]\:pb-6.border-b {
    padding-bottom: calc(var(--spacing) * 6);
  }

  .\[\.border-t\]\:pt-6.border-t {
    padding-top: calc(var(--spacing) * 6);
  }

  :is(.\*\:\[span\]\:last\:flex > *):is(span):last-child {
    display: flex;
  }

  :is(.\*\:\[span\]\:last\:items-center > *):is(span):last-child {
    align-items: center;
  }

  :is(.\*\:\[span\]\:last\:gap-2 > *):is(span):last-child {
    gap: calc(var(--spacing) * 2);
  }

  .\[\&\>\[role\=checkbox\]\]\:translate-y-\[2px\] > [role="checkbox"] {
    --tw-translate-y: 2px;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .\[\&\>tr\]\:last\:border-b-0 > tr:last-child {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 0;
  }
}

:root {
  --radius: .625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(.145 0 0);
  --primary: oklch(.205 0 0);
  --primary-foreground: oklch(.985 0 0);
  --secondary: oklch(.97 0 0);
  --secondary-foreground: oklch(.205 0 0);
  --muted: oklch(.97 0 0);
  --muted-foreground: oklch(.556 0 0);
  --accent: oklch(.97 0 0);
  --accent-foreground: oklch(.205 0 0);
  --destructive: oklch(.577 .245 27.325);
  --border: oklch(.922 0 0);
  --input: oklch(.922 0 0);
  --ring: oklch(.708 0 0);
  --chart-1: oklch(.646 .222 41.116);
  --chart-2: oklch(.6 .118 184.704);
  --chart-3: oklch(.398 .07 227.392);
  --chart-4: oklch(.828 .189 84.429);
  --chart-5: oklch(.769 .188 70.08);
  --sidebar: oklch(.985 0 0);
  --sidebar-foreground: oklch(.145 0 0);
  --sidebar-primary: oklch(.205 0 0);
  --sidebar-primary-foreground: oklch(.985 0 0);
  --sidebar-accent: oklch(.97 0 0);
  --sidebar-accent-foreground: oklch(.205 0 0);
  --sidebar-border: oklch(.922 0 0);
  --sidebar-ring: oklch(.708 0 0);
}

.dark {
  --background: oklch(.145 0 0);
  --foreground: oklch(.985 0 0);
  --card: oklch(.205 0 0);
  --card-foreground: oklch(.985 0 0);
  --popover: oklch(.205 0 0);
  --popover-foreground: oklch(.985 0 0);
  --primary: oklch(.922 0 0);
  --primary-foreground: oklch(.205 0 0);
  --secondary: oklch(.269 0 0);
  --secondary-foreground: oklch(.985 0 0);
  --muted: oklch(.269 0 0);
  --muted-foreground: oklch(.708 0 0);
  --accent: oklch(.269 0 0);
  --accent-foreground: oklch(.985 0 0);
  --destructive: oklch(.704 .191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(.556 0 0);
  --chart-1: oklch(.488 .243 264.376);
  --chart-2: oklch(.696 .17 162.48);
  --chart-3: oklch(.769 .188 70.08);
  --chart-4: oklch(.627 .265 303.9);
  --chart-5: oklch(.645 .246 16.439);
  --sidebar: oklch(.205 0 0);
  --sidebar-foreground: oklch(.985 0 0);
  --sidebar-primary: oklch(.488 .243 264.376);
  --sidebar-primary-foreground: oklch(.985 0 0);
  --sidebar-accent: oklch(.269 0 0);
  --sidebar-accent-foreground: oklch(.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(.556 0 0);
}

pdf-generation-mode {
  --background: #fff !important;
  --foreground: #252525 !important;
  --card: #fff !important;
  --card-foreground: #252525 !important;
  --popover: #fff !important;
  --popover-foreground: #252525 !important;
  --primary: #343434 !important;
  --primary-foreground: #fafafa !important;
  --secondary: #f7f7f7 !important;
  --secondary-foreground: #343434 !important;
  --muted: #f7f7f7 !important;
  --muted-foreground: #8e8e8e !important;
  --accent: #f7f7f7 !important;
  --accent-foreground: #343434 !important;
  --destructive: #de3163 !important;
  --border: #ebebeb !important;
  --input: #ebebeb !important;
  --ring: #b5b5b5 !important;
  --chart-1: #d96d51 !important;
  --chart-2: #62a4a9 !important;
  --chart-3: #4f5b93 !important;
  --chart-4: #e4c150 !important;
  --chart-5: #e2b348 !important;
}

body.pdf-active-for-body {
  background-color: #fff !important;
}

@property --tw-space-y-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-space-x-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-border-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}

@property --tw-leading {
  syntax: "*";
  inherits: false
}

@property --tw-font-weight {
  syntax: "*";
  inherits: false
}

@property --tw-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-shadow-color {
  syntax: "*";
  inherits: false
}

@property --tw-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}

@property --tw-inset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-inset-shadow-color {
  syntax: "*";
  inherits: false
}

@property --tw-inset-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}

@property --tw-ring-color {
  syntax: "*";
  inherits: false
}

@property --tw-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-inset-ring-color {
  syntax: "*";
  inherits: false
}

@property --tw-inset-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-ring-inset {
  syntax: "*";
  inherits: false
}

@property --tw-ring-offset-width {
  syntax: "<length>";
  inherits: false;
  initial-value: 0;
}

@property --tw-ring-offset-color {
  syntax: "*";
  inherits: false;
  initial-value: #fff;
}

@property --tw-ring-offset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-outline-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}

@property --tw-backdrop-blur {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-brightness {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-contrast {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-grayscale {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-hue-rotate {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-invert {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-opacity {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-saturate {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-sepia {
  syntax: "*";
  inherits: false
}

@property --tw-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-translate-y {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-translate-z {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0));
  }
}


/*# sourceMappingURL=%5Broot-of-the-server%5D__b9e8059a._.css.map*/  
  `;
}

// Função para montar o HTML completo que o Puppeteer vai renderizar
const getFullHtmlForPuppeteer = (
  htmlFragment: string,
  styles: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR"> 
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contracheque</title>
      <style>
        ${styles}
        /* Estilos adicionais específicos para PDF, se necessário */
        body {
          -webkit-print-color-adjust: exact !important; /* Força a impressão de cores de fundo */
          print-color-adjust: exact !important;
          background-color: var(--background) !important; /* Garante o fundo do body */
        }
        #paycheck-document {
          /* Se o seu #paycheck-document tiver uma cor de fundo específica,
             garanta que ela seja aplicada. Ex:
             background-color: var(--card) !important; ou #ffffff !important;
             Se ele já usar var(--card) ou similar, e a variável estiver definida,
             o !important pode não ser necessário, mas não custa para garantir no PDF.
          */
        }
      </style>
    </head>
    <body>
      ${htmlFragment}
    </body>
    </html>
  `;
};

export async function POST(req: NextRequest) {
  let browser = null; // Declarar fora do try para que o finally possa acessá-lo

  try {
    const body = await req.json();
    const { html: htmlFragment } = body;

    if (!htmlFragment) {
      return NextResponse.json(
        { message: 'HTML do contracheque não fornecido.' },
        { status: 400 }
      );
    }

    const globalStyles = await getGlobalCssContent(); // Obter os estilos globais
    const fullHtml = getFullHtmlForPuppeteer(htmlFragment, globalStyles);

    // Opções para o Puppeteer. `executablePath` pode ser necessário dependendo do ambiente.
    // Para Docker, geralmente o Puppeteer encontra o Chromium que ele baixa.
    // Para ambientes serverless, pode ser necessário usar algo como @sparticuz/chromium.
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // '--disable-dev-shm-usage', // Útil em alguns ambientes Docker com /dev/shm limitado
        // '--font-render-hinting=none', // Pode ajudar com renderização de fontes
        // '--disable-gpu', // Pode ser necessário em ambientes sem GPU
      ],
      // Se você precisar especificar um caminho para o Chromium (ex: com @sparticuz/chromium):
      // executablePath: await chromium.executablePath(),
    });

    const page = await browser.newPage();

    // Definir o conteúdo da página
    // waitUntil: 'networkidle0' pode ser útil se seu HTML carregar recursos externos (fontes, imagens)
    // que não estão embutidos. Para HTML puro, 'domcontentloaded' ou 'load' pode ser suficiente.
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Opcional: Emular mídia de impressão para aplicar estilos @media print
    // await page.emulateMediaType('print');

    const pdfOptions = {
      format: 'A4' as PaperFormat,
      printBackground: true, // MUITO IMPORTANTE para cores de fundo e imagens
      margin: {
        // Ajuste conforme necessário
        top: '0.4in',
        right: '0.2in',
        bottom: '0.4in',
        left: '0.2in',
      } as Margin,
      // path: 'debug_contracheque.pdf' // Descomente para salvar um arquivo no servidor para debug
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();
    browser = null; // Limpar referência

    // Enviar o PDF como resposta
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/pdf');
    responseHeaders.set(
      'Content-Disposition',
      'attachment; filename="contracheque.pdf"'
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Erro ao gerar PDF (backend - Puppeteer):', error);
    if (browser) {
      try {
        await browser.close(); // Tenta fechar o browser em caso de erro
      } catch (closeError) {
        console.error('Erro ao fechar o browser após falha:', closeError);
      }
    }
    return NextResponse.json(
      {
        message: 'Erro interno do servidor ao gerar PDF.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
