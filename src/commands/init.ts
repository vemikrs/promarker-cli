import { writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

interface InitOptions {
  force?: boolean
}

export async function initCommand(options: InitOptions = {}) {
  console.log('🚀 Initializing promarker project...')
  
  const configFileName = '.promarker.json'
  const configPath = resolve(process.cwd(), configFileName)
  
  if (existsSync(configPath) && !options.force) {
    console.log('❌ Project already initialized. Use --force to overwrite.')
    return
  }
  
  const defaultConfig = {
    name: 'My Promarker Project',
    version: '1.0.0',
    markers: [],
    created: new Date().toISOString()
  }
  
  try {
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    console.log(`✅ Created ${configFileName}`)
    console.log('🎉 Project initialized successfully!')
  } catch (error) {
    console.error('❌ Failed to initialize project:', error)
    process.exit(1)
  }
}