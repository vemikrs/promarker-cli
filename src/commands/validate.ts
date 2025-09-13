import { readFileSync, existsSync, statSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'
import chalk from 'chalk'

// Stencil settings schema definition
const StencilSettingsSchema = z.object({
  id: z.string().min(1, 'Stencil ID is required'),
  name: z.string().min(1, 'Stencil name is required'),
  version: z.string().min(1, 'Version is required'),
  type: z.string().min(1, 'Stencil type is required'),
  description: z.string().optional(),
  files: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
  extend: z.string().optional(),
  variables: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

interface ValidateOptions {
  format: 'text' | 'json'
  failOn: 'none' | 'warn' | 'error'
  strict?: boolean
  ignore?: string[]
}

interface ValidationResult {
  path: string
  type: 'error' | 'warning' | 'info'
  message: string
  details?: string
}

interface ValidationSummary {
  success: boolean
  path: string
  errors: ValidationResult[]
  warnings: ValidationResult[]
  info: ValidationResult[]
  totalFiles: number
  validatedAt: string
}

export async function validateCommand(targetPath: string, options: ValidateOptions): Promise<number> {
  try {
    const absolutePath = resolve(process.cwd(), targetPath)
    const results = await validateStencilDefinition(absolutePath, options)
    
    if (options.format === 'json') {
      console.log(JSON.stringify(results, null, 2))
    } else {
      printTextResults(results)
    }
    
    return determineExitCode(results, options.failOn)
  } catch (error) {
    if (options.format === 'json') {
      console.log(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validatedAt: new Date().toISOString()
      }, null, 2))
    } else {
      console.error(chalk.red('❌ Validation failed:'), error instanceof Error ? error.message : error)
    }
    return 2
  }
}

async function validateStencilDefinition(path: string, options: ValidateOptions): Promise<ValidationSummary> {
  const results: ValidationResult[] = []
  
  // Check if path exists and is a directory
  if (!existsSync(path)) {
    results.push({
      path,
      type: 'error',
      message: 'Path does not exist'
    })
    return createSummary(path, results, 0)
  }
  
  if (!statSync(path).isDirectory()) {
    results.push({
      path,
      type: 'error',
      message: 'Path must be a directory'
    })
    return createSummary(path, results, 0)
  }
  
  // Check for stencil-settings.yml
  const settingsFile = join(path, 'stencil-settings.yml')
  if (!existsSync(settingsFile)) {
    results.push({
      path: settingsFile,
      type: 'error',
      message: 'Required file stencil-settings.yml not found'
    })
    return createSummary(path, results, 0)
  }
  
  // Validate stencil-settings.yml
  await validateSettingsFile(settingsFile, results, options)
  
  // Count total files processed
  const allFiles = await glob('**/*', { cwd: path, nodir: true })
  const totalFiles = allFiles.length
  
  // Validate file references if settings are valid
  const settings = await loadStencilSettings(settingsFile)
  if (settings) {
    await validateFileReferences(path, settings, results, options)
    await validateReferenceIntegrity(path, settings, results, options)
  }
  
  return createSummary(path, results, totalFiles)
}

async function validateSettingsFile(settingsFile: string, results: ValidationResult[], _options: ValidateOptions) {
  try {
    const content = readFileSync(settingsFile, 'utf-8')
    let settings: unknown
    
    try {
      settings = parseYaml(content)
    } catch (error) {
      results.push({
        path: settingsFile,
        type: 'error',
        message: 'Invalid YAML format',
        details: error instanceof Error ? error.message : 'Unknown YAML parsing error'
      })
      return
    }
    
    // Schema validation
    const validation = StencilSettingsSchema.safeParse(settings)
    if (!validation.success) {
      validation.error.issues.forEach(err => {
        results.push({
          path: settingsFile,
          type: 'error',
          message: `Schema validation failed: ${err.path.join('.')} - ${err.message}`
        })
      })
      return
    }
    
    // Additional strict validation
    if (_options.strict) {
      await performStrictValidation(settingsFile, validation.data, results)
    }
    
    results.push({
      path: settingsFile,
      type: 'info',
      message: 'Stencil settings file is valid'
    })
    
  } catch (error) {
    results.push({
      path: settingsFile,
      type: 'error',
      message: 'Failed to read stencil settings file',
      details: error instanceof Error ? error.message : 'Unknown file reading error'
    })
  }
}

async function performStrictValidation(settingsFile: string, settings: unknown, results: ValidationResult[]) {
  // Type guard to ensure settings is an object
  if (typeof settings !== 'object' || settings === null) return
  
  const settingsObj = settings as Record<string, unknown>
  
  // Check ID naming convention
  if (typeof settingsObj.id === 'string' && !/^[a-z0-9-_]+$/.test(settingsObj.id)) {
    results.push({
      path: settingsFile,
      type: 'warning',
      message: 'Stencil ID should only contain lowercase letters, numbers, hyphens, and underscores'
    })
  }
  
  // Check version format (simple semver check)
  if (typeof settingsObj.version === 'string' && !/^\d+\.\d+\.\d+/.test(settingsObj.version)) {
    results.push({
      path: settingsFile,
      type: 'warning',
      message: 'Version should follow semantic versioning format (x.y.z)'
    })
  }
  
  // Check for description in strict mode
  if (!settingsObj.description) {
    results.push({
      path: settingsFile,
      type: 'warning',
      message: 'Description is recommended for better documentation'
    })
  }
}

async function validateFileReferences(path: string, settings: unknown, results: ValidationResult[], _options: ValidateOptions) {
  // Type guard to ensure settings is an object
  if (typeof settings !== 'object' || settings === null) return
  
  const settingsObj = settings as Record<string, unknown>
  if (settingsObj.files && Array.isArray(settingsObj.files)) {
    for (const file of settingsObj.files) {
      if (typeof file === 'string') {
        const filePath = join(path, file)
        if (!existsSync(filePath)) {
          results.push({
            path: filePath,
            type: 'error',
            message: `Referenced file does not exist: ${file}`
          })
        } else {
          results.push({
            path: filePath,
            type: 'info',
            message: `Referenced file exists: ${file}`
          })
        }
      }
    }
  }
  
  // Check files/ directory exists if no explicit files list
  if (!settingsObj.files) {
    const filesDir = join(path, 'files')
    if (existsSync(filesDir) && statSync(filesDir).isDirectory()) {
      results.push({
        path: filesDir,
        type: 'info',
        message: 'Default files/ directory found'
      })
    } else {
      results.push({
        path: filesDir,
        type: 'warning',
        message: 'No files/ directory found and no explicit files list provided'
      })
    }
  }
}

async function validateReferenceIntegrity(path: string, settings: unknown, results: ValidationResult[], _options: ValidateOptions) {
  // Type guard to ensure settings is an object
  if (typeof settings !== 'object' || settings === null) return
  
  const settingsObj = settings as Record<string, unknown>
  
  // Check extend reference
  if (settingsObj.extend && typeof settingsObj.extend === 'string') {
    results.push({
      path: join(path, 'stencil-settings.yml'),
      type: 'warning',
      message: `Extend reference found: ${settingsObj.extend} (cannot validate external references in Phase 1)`
    })
  }
  
  // Check include references
  if (settingsObj.include && Array.isArray(settingsObj.include)) {
    settingsObj.include.forEach((include: unknown) => {
      if (typeof include === 'string') {
        results.push({
          path: join(path, 'stencil-settings.yml'),
          type: 'warning',
          message: `Include reference found: ${include} (cannot validate external references in Phase 1)`
        })
      }
    })
  }
}

async function loadStencilSettings(settingsFile: string) {
  try {
    const content = readFileSync(settingsFile, 'utf-8')
    return parseYaml(content)
  } catch {
    return null
  }
}

function createSummary(path: string, results: ValidationResult[], totalFiles: number): ValidationSummary {
  const errors = results.filter(r => r.type === 'error')
  const warnings = results.filter(r => r.type === 'warning')
  const info = results.filter(r => r.type === 'info')
  
  return {
    success: errors.length === 0,
    path,
    errors,
    warnings,
    info,
    totalFiles,
    validatedAt: new Date().toISOString()
  }
}

function printTextResults(summary: ValidationSummary) {
  console.log(chalk.bold('\n📋 ProMarker Stencil Validation Report'))
  console.log(chalk.gray('====================================='))
  console.log(`📁 Path: ${summary.path}`)
  console.log(`📊 Files: ${summary.totalFiles}`)
  console.log(`⏰ Validated: ${new Date(summary.validatedAt).toLocaleString()}`)
  console.log()
  
  if (summary.errors.length > 0) {
    console.log(chalk.red.bold(`❌ Errors (${summary.errors.length}):`))
    summary.errors.forEach(error => {
      console.log(chalk.red(`  • ${error.message}`))
      if (error.details) {
        console.log(chalk.gray(`    ${error.details}`))
      }
      console.log(chalk.gray(`    Location: ${error.path}`))
    })
    console.log()
  }
  
  if (summary.warnings.length > 0) {
    console.log(chalk.yellow.bold(`⚠️  Warnings (${summary.warnings.length}):`))
    summary.warnings.forEach(warning => {
      console.log(chalk.yellow(`  • ${warning.message}`))
      if (warning.details) {
        console.log(chalk.gray(`    ${warning.details}`))
      }
      console.log(chalk.gray(`    Location: ${warning.path}`))
    })
    console.log()
  }
  
  if (summary.info.length > 0) {
    console.log(chalk.blue.bold(`ℹ️  Information (${summary.info.length}):`))
    summary.info.forEach(info => {
      console.log(chalk.blue(`  • ${info.message}`))
      console.log(chalk.gray(`    Location: ${info.path}`))
    })
    console.log()
  }
  
  // Summary
  if (summary.success) {
    console.log(chalk.green.bold('✅ Validation successful!'))
  } else {
    console.log(chalk.red.bold('❌ Validation failed'))
  }
  
  console.log(chalk.gray(`\n📈 Summary: ${summary.errors.length} errors, ${summary.warnings.length} warnings, ${summary.info.length} info`))
}

function determineExitCode(summary: ValidationSummary, failOn: string): number {
  if (summary.errors.length > 0) return 2
  if (failOn === 'warn' && summary.warnings.length > 0) return 1
  return 0
}