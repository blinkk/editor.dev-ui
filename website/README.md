# amagaki-starter

[![NPM Version][npm-image]][npm-url]
[![GitHub Actions][github-image]][github-url]
[![TypeScript Style Guide][gts-image]][gts-url]

A minimal starter project that uses the [Amagaki](https://amagaki.dev) website generator.

## Features

- Reusable partial HTML templates (Nunjucks).
- Responsive image macro using a combination of `srcset` and `media`.
- Per-partial CSS splitting.
- TypeScript compilation with tree-shaking for minimal payloads.
- Opinionated autofixing and linting.

## Usage

```shell
# Install dependencies.
npm install

# Run the development server.
npm run dev

# Build the static site.
npm run build
```

[github-image]: https://github.com/blinkk/amagaki-starter/workflows/Build%20site/badge.svg
[github-url]: https://github.com/blinkk/amagaki-starter/actions
[npm-image]: https://img.shields.io/npm/v/@amagaki/amagaki-starter.svg
[npm-url]: https://npmjs.org/package/@amagaki/amagaki-starter
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts