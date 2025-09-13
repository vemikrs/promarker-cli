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
  .description('A modern CLI tool for project markers')
  .version(packageJson.version)

// Add some basic commands for demonstration
program
  .command('init')
  .description('Initialize a new promarker project')
  .option('-f, --force', 'Force initialization even if files exist')
  .action(async (options) => {
    const { initCommand } = await import('./commands/init.js')
    await initCommand(options)
  })

program
  .command('info')
  .description('Show project information')
  .action(async () => {
    const { infoCommand } = await import('./commands/info.js')
    await infoCommand()
  })

// Export the program for testing purposes
export { program }

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse()
}