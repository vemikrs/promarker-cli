import { existsSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

interface EnvironmentCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  details?: string
}

export async function doctorCommand(): Promise<void> {
  console.log(chalk.bold('\n🔧 ProMarker CLI Environment Check'))
  console.log(chalk.gray('==================================='))
  
  const checks: EnvironmentCheck[] = []
  
  // Check Node.js version
  await checkNodeVersion(checks)
  
  // Check CLI installation
  await checkCliInstallation(checks)
  
  // Check current directory for stencil
  await checkCurrentDirectory(checks)
  
  // Check file permissions
  await checkFilePermissions(checks)
  
  // Print results
  printDoctorResults(checks)
  
  // Phase 2 preparation notes
  console.log(chalk.gray('\n📋 Phase 2 Preparation:'))
  console.log(chalk.gray('• Local ProMarker server integration will be added in future versions'))
  console.log(chalk.gray('• Current version focuses on validation-only functionality'))
  console.log(chalk.gray('• Generation features will be server-side only'))
}

async function checkNodeVersion(checks: EnvironmentCheck[]) {
  try {
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    
    if (majorVersion >= 18) {
      checks.push({
        name: 'Node.js Version',
        status: 'pass',
        message: `Node.js ${nodeVersion} (compatible)`,
        details: 'Minimum required: Node.js 18+'
      })
    } else {
      checks.push({
        name: 'Node.js Version',
        status: 'fail',
        message: `Node.js ${nodeVersion} (incompatible)`,
        details: 'Please upgrade to Node.js 18 or higher'
      })
    }
  } catch (error) {
    checks.push({
      name: 'Node.js Version',
      status: 'fail',
      message: 'Could not determine Node.js version',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function checkCliInstallation(checks: EnvironmentCheck[]) {
  try {
    // Try to read package.json from multiple possible locations
    let packageJson: any
    let packagePath = ''
    
    try {
      // First try relative to the built file
      packageJson = require('../../package.json')
      packagePath = '../../package.json'
    } catch {
      try {
        // Try from the source directory
        packageJson = require('../package.json') 
        packagePath = '../package.json'
      } catch {
        // Try absolute path as fallback
        const { readFileSync } = await import('fs')
        const { resolve } = await import('path')
        const pkgPath = resolve(__dirname, '../../package.json')
        packageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        packagePath = pkgPath
      }
    }
    
    checks.push({
      name: 'CLI Installation',
      status: 'pass',
      message: `ProMarker CLI v${packageJson.version} installed correctly`,
      details: `Package found at: ${packagePath}`
    })
    
    // Check if promarker and pmkr commands are available
    try {
      const whichPromarker = execSync('which promarker', { encoding: 'utf8' }).trim()
      checks.push({
        name: 'Command Availability',
        status: 'pass',
        message: 'promarker command is available in PATH',
        details: `Location: ${whichPromarker}`
      })
    } catch {
      checks.push({
        name: 'Command Availability',
        status: 'warn',
        message: 'promarker command not found in PATH',
        details: 'You may need to run "npm link" or install globally'
      })
    }
    
  } catch (error) {
    checks.push({
      name: 'CLI Installation',
      status: 'warn',
      message: 'Could not determine CLI version (running from built files)',
      details: 'CLI appears to be functional but version info unavailable'
    })
  }
}

async function checkCurrentDirectory(checks: EnvironmentCheck[]) {
  const currentDir = process.cwd()
  const stencilSettings = resolve(currentDir, 'stencil-settings.yml')
  
  if (existsSync(stencilSettings)) {
    checks.push({
      name: 'Current Directory',
      status: 'pass',
      message: 'stencil-settings.yml found in current directory',
      details: 'This appears to be a valid stencil directory'
    })
  } else {
    checks.push({
      name: 'Current Directory',
      status: 'warn',
      message: 'No stencil-settings.yml found in current directory',
      details: 'Navigate to a stencil directory or specify path when validating'
    })
  }
  
  // Check for files/ directory
  const filesDir = resolve(currentDir, 'files')
  if (existsSync(filesDir)) {
    checks.push({
      name: 'Files Directory',
      status: 'pass',
      message: 'files/ directory found',
      details: 'Template files directory exists'
    })
  } else {
    checks.push({
      name: 'Files Directory',
      status: 'warn',
      message: 'No files/ directory found',
      details: 'Stencil may explicitly list files or use a different structure'
    })
  }
}

async function checkFilePermissions(checks: EnvironmentCheck[]) {
  try {
    const currentDir = process.cwd()
    
    // Check if we can read the current directory
    try {
      const fs = await import('fs/promises')
      await fs.access(currentDir, fs.constants.R_OK)
      
      checks.push({
        name: 'File Permissions',
        status: 'pass',
        message: 'Read access to current directory confirmed',
        details: 'CLI can read stencil files'
      })
    } catch {
      checks.push({
        name: 'File Permissions',
        status: 'fail',
        message: 'Cannot read current directory',
        details: 'Check file permissions for the current directory'
      })
    }
    
  } catch (error) {
    checks.push({
      name: 'File Permissions',
      status: 'warn',
      message: 'Could not verify file permissions',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

function printDoctorResults(checks: EnvironmentCheck[]) {
  console.log()
  
  const passCount = checks.filter(c => c.status === 'pass').length
  const warnCount = checks.filter(c => c.status === 'warn').length
  const failCount = checks.filter(c => c.status === 'fail').length
  
  checks.forEach(check => {
    let icon: string
    let color: (str: string) => string
    
    switch (check.status) {
      case 'pass':
        icon = '✅'
        color = chalk.green
        break
      case 'warn':
        icon = '⚠️ '
        color = chalk.yellow
        break
      case 'fail':
        icon = '❌'
        color = chalk.red
        break
    }
    
    console.log(color(`${icon} ${check.name}: ${check.message}`))
    if (check.details) {
      console.log(chalk.gray(`   ${check.details}`))
    }
  })
  
  console.log()
  console.log(chalk.bold('📊 Summary:'))
  console.log(chalk.green(`✅ ${passCount} passed`))
  if (warnCount > 0) console.log(chalk.yellow(`⚠️  ${warnCount} warnings`))
  if (failCount > 0) console.log(chalk.red(`❌ ${failCount} failed`))
  
  if (failCount === 0) {
    console.log(chalk.green.bold('\n🎉 Environment is ready for ProMarker CLI!'))
  } else {
    console.log(chalk.red.bold('\n⚠️  Please address the failed checks above'))
  }
}