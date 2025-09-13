# ProMarker CLI - Development Container

This folder contains the configuration for GitHub Codespaces and VS Code Dev Containers.

## Quick Start

### GitHub Codespaces
1. Go to the repository page on GitHub
2. Click on "Code" → "Codespaces" → "Create codespace on main"
3. Wait for the container to build and start
4. The environment will be ready with all dependencies installed

### VS Code Dev Containers (Local)
1. Install the "Dev Containers" extension in VS Code
2. Open this repository in VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Select "Dev Containers: Reopen in Container"
5. Wait for the container to build and start

## What's Included

### Base Environment
- **Node.js 18 LTS**: Required runtime for ProMarker CLI
- **Git**: Version control
- **GitHub CLI**: For GitHub integration

### VS Code Extensions
- **TypeScript**: Language support and IntelliSense
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **YAML**: For stencil-settings.yml files
- **GitHub Copilot**: AI-powered code assistance
- **Test Runner**: For running Vitest tests

### Development Tools
- **tsx**: TypeScript execution and watch mode
- **vitest**: Testing framework
- **prettier**: Code formatting
- **eslint**: Code linting

## Post-Setup Commands

After the container starts, the following commands run automatically:
1. `npm install` - Install project dependencies
2. `npm run build` - Build the project

## Development Workflow

### Available Commands
```bash
npm run dev          # Start development mode with watch
npm run build        # Build the project
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run typecheck    # Run TypeScript type checking
```

### Testing the CLI
```bash
# Build and test the CLI
npm run build
./bin/promarker.mjs validate --help
./bin/promarker.mjs doctor

# Test with sample stencils (if any)
./bin/promarker.mjs validate src/test/fixtures/valid-stencil/
```

## Container Features

- **Fast startup**: Uses Node.js slim image for quick container creation
- **Pre-installed dependencies**: All npm packages installed during build
- **Optimized for ProMarker CLI**: Specific tools and extensions for this project
- **Security**: Runs as non-root user (`node`)

## Customization

To modify the development environment:

1. **Add extensions**: Edit `devcontainer.json` → `customizations.vscode.extensions`
2. **Change settings**: Edit `devcontainer.json` → `customizations.vscode.settings`
3. **Add system packages**: Edit `Dockerfile` → `apt-get install` section
4. **Add npm global packages**: Edit `Dockerfile` → `npm install -g` section

## Troubleshooting

### Container fails to build
- Check Docker is running (for local Dev Containers)
- Verify network connectivity for package downloads
- Try rebuilding: "Dev Containers: Rebuild Container"

### Extensions not working
- Wait for full container initialization
- Check VS Code extension host is running
- Reload VS Code window if needed

### Commands not found
- Verify `postCreateCommand` completed successfully
- Check `npm install` ran without errors
- Manually run `npm install` if needed

## ProMarker CLI Specific Setup

This devcontainer is configured specifically for ProMarker CLI development with:

- **Validation-only focus**: No generation tools or server components
- **TypeScript strict mode**: Configured for type safety
- **ESM support**: Modern ES modules configuration
- **Testing ready**: Vitest configured and ready to run
- **Phase 1 constraints**: Only tools needed for validation CLI

Refer to `COPILOT_GUIDANCE.md` for detailed development guidelines and project constraints.