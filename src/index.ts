#!/usr/bin/env node

import { program } from 'commander'
import { createRequire } from 'module'

// Import package.json for version info
const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

// Set up the main program
program
  .name('promarker')
  .alias('pmkr')
  .description('ProMarker Stencil Validator - Official CLI for validating ProMarker stencil definitions')
  .version(packageJson.version)

// Validate command - primary functionality
program
  .command('validate')
  .argument('[path]', 'Path to stencil directory (default: current directory)', '.')
  .description('Validate ProMarker stencil definitions in the specified directory')
  .option('--format <format>', 'Output format (text|json)', 'text')
  .option('--fail-on <level>', 'Exit code threshold (none|warn|error)', 'error')
  .option('--strict', 'Enable strict validation mode')
  .option('--ignore <patterns...>', 'Glob patterns to ignore')
  .action(async (path, options) => {
    const { validateCommand } = await import('./commands/validate.js')
    const exitCode = await validateCommand(path, options)
    process.exit(exitCode)
  })

// Doctor command - environment diagnostics
program
  .command('doctor')
  .description('Check CLI environment and requirements')
  .action(async () => {
    const { doctorCommand } = await import('./commands/doctor.js')
    await doctorCommand()
  })

// Export the program for testing purposes
export { program }

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse()
}