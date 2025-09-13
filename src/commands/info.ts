import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export async function infoCommand() {
  console.log('📋 Promarker Project Information')
  console.log('================================')
  
  const configPath = resolve(process.cwd(), '.promarker.json')
  
  if (!existsSync(configPath)) {
    console.log('❌ No promarker project found in current directory.')
    console.log('💡 Run "promarker init" to initialize a new project.')
    return
  }
  
  try {
    const configContent = readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configContent)
    
    console.log(`📁 Project: ${config.name}`)
    console.log(`🔖 Version: ${config.version}`)
    console.log(`📅 Created: ${new Date(config.created).toLocaleDateString()}`)
    console.log(`🏷️  Markers: ${config.markers?.length || 0}`)
    
    // Show CLI version
    try {
      const packageJson = require('../../package.json')
      console.log(`\n🔧 CLI Version: ${packageJson.version}`)
    } catch {
      // Fallback if package.json can't be found (in bundled version)
      console.log(`\n🔧 CLI Version: Available via promarker --version`)
    }
    
  } catch (error) {
    console.error('❌ Failed to read project configuration:', error)
    process.exit(1)
  }
}