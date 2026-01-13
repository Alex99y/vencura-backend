## Installation

```
pnpm install
```

Create the `.env` file using `.env.example` as a reference

## Development

To start the development server:

```
pnpm start:dev
```

The server will be available at `http://localhost:8080` (or the port specified in your config).

## Building

To build the project:

```
pnpm build
```

To check for TypeScript errors without building:

```
pnpm build:check
```

## Production

To start the production server (requires building first):

```
pnpm build
pnpm start:prod
```

## Other Scripts

- `pnpm test` - Run tests
- `pnpm test:cov` - Run tests with coverage
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm check` - Run Biome linter and fix issues
