# win7ui

> Windows 7 UI component library for React, Svelte, and Vue

A shadcn/ui-style component library that brings authentic Windows 7 aesthetics to modern web frameworks. Components are copied directly into your project source code via CLI.

## Usage

```bash
npx win7ui init
npx win7ui add button window
```

See [packages/cli/README.md](packages/cli/README.md) for full documentation.

## Development

```bash
pnpm install
pnpm turbo build
pnpm turbo test
```

## Project Structure

- `packages/cli/` - CLI tool (published to npm as `win7ui`)
- `registry/` - Component source code and CSS
- `scripts/` - Build automation
- `docs/site/` - Documentation website

## License

MIT
