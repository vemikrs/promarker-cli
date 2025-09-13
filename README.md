# promarker-cli

A modern CLI tool for project markers built with TypeScript and ESM.

## Installation

```bash
npm install -g @promarker/cli
```

## Usage

The CLI is available as both `promarker` and `pmkr` (alias).

### Commands

#### Initialize a new project
```bash
promarker init
# or
pmkr init

# Force initialization (overwrite existing)
promarker init --force
```

#### Show project information
```bash
promarker info
# or 
pmkr info
```

#### Get help
```bash
promarker --help
promarker --version
```

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

### Project Structure
```
src/
  index.ts          # Main CLI entry point
  commands/         # Individual command implementations
    init.ts         # Initialize command
    info.ts         # Info command
  test/             # Tests
bin/
  promarker.mjs     # Executable launcher
dist/               # Built output (ESM)
```

## Publishing

The package is configured for ESM-first publishing:

```bash
# Build and pack
npm run build
npm pack --dry-run

# Publish (requires npm login and appropriate permissions)
npm publish --access public
```

## License

MIT - see [LICENSE](LICENSE) for details.