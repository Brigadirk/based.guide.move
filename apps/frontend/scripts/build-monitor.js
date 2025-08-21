#!/usr/bin/env node

/**
 * Build Monitor Script
 * Monitors the build process and automatically fixes manifest errors
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

class BuildMonitor {
  constructor() {
    this.manifestFiles = [
      '.next/build-manifest.json',
      '.next/app-build-manifest.json',
      '.next/server/app/page/app-build-manifest.json',
      '.next/server/middleware-build-manifest.js',
      '.next/server/middleware-manifest.json'
    ]
    this.isMonitoring = false
    this.buildProcess = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      monitor: '👁️'
    }
    console.log(`${icons[type]} [${timestamp}] ${message}`)
  }

  async createMissingManifests() {
    this.log('Creating missing manifest files...', 'monitor')
    
    for (const manifestFile of this.manifestFiles) {
      const dir = path.dirname(manifestFile)
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true })
          this.log(`Created directory: ${dir}`, 'success')
        } catch (error) {
          this.log(`Failed to create directory ${dir}: ${error.message}`, 'error')
          continue
        }
      }
      
      // Create manifest file if it doesn't exist
      if (!fs.existsSync(manifestFile)) {
        try {
          const isJson = manifestFile.endsWith('.json')
          const content = isJson ? 
            JSON.stringify({ pages: {}, version: 1 }, null, 2) :
            'module.exports = { sortedPages: [] };'
          
          fs.writeFileSync(manifestFile, content, 'utf8')
          this.log(`Created manifest: ${manifestFile}`, 'success')
        } catch (error) {
          this.log(`Failed to create manifest ${manifestFile}: ${error.message}`, 'error')
        }
      }
    }
  }

  async monitorBuild() {
    this.log('Starting build monitoring...', 'monitor')
    this.isMonitoring = true
    
    // Check for missing manifests every 100ms during build
    const monitorInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(monitorInterval)
        return
      }
      
      // Check if any manifest files are missing
      const missingFiles = this.manifestFiles.filter(file => !fs.existsSync(file))
      
      if (missingFiles.length > 0) {
        this.log(`Found ${missingFiles.length} missing manifest files`, 'warning')
        this.createMissingManifests()
      }
    }, 100)
    
    return monitorInterval
  }

  async runBuild(command = 'next build') {
    this.log(`Starting build command: ${command}`, 'info')
    
    // Start monitoring
    const monitorInterval = await this.monitorBuild()
    
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ')
      
      this.buildProcess = spawn(cmd, args, {
        stdio: 'pipe',
        shell: true
      })
      
      let output = ''
      let errorOutput = ''
      
      this.buildProcess.stdout.on('data', (data) => {
        const text = data.toString()
        output += text
        process.stdout.write(text)
        
        // Check for manifest errors in real-time
        if (text.includes('app-build-manifest.json') && text.includes('ENOENT')) {
          this.log('Detected manifest error - auto-fixing...', 'warning')
          this.createMissingManifests()
        }
      })
      
      this.buildProcess.stderr.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        process.stderr.write(text)
        
        // Check for manifest errors in stderr too
        if (text.includes('app-build-manifest.json') && text.includes('ENOENT')) {
          this.log('Detected manifest error in stderr - auto-fixing...', 'warning')
          this.createMissingManifests()
        }
      })
      
      this.buildProcess.on('close', (code) => {
        this.isMonitoring = false
        clearInterval(monitorInterval)
        
        if (code === 0) {
          this.log('Build completed successfully!', 'success')
          resolve({ code, output, errorOutput })
        } else {
          this.log(`Build failed with exit code ${code}`, 'error')
          
          // Try one more fix attempt for manifest errors
          if (errorOutput.includes('app-build-manifest.json') || output.includes('app-build-manifest.json')) {
            this.log('Attempting final manifest fix...', 'warning')
            this.createMissingManifests()
          }
          
          reject(new Error(`Build failed with exit code ${code}`))
        }
      })
      
      this.buildProcess.on('error', (error) => {
        this.isMonitoring = false
        clearInterval(monitorInterval)
        this.log(`Build process error: ${error.message}`, 'error')
        reject(error)
      })
    })
  }

  stop() {
    this.isMonitoring = false
    if (this.buildProcess) {
      this.buildProcess.kill()
    }
  }
}

// Main execution
async function main() {
  const monitor = new BuildMonitor()
  
  // Handle termination signals
  process.on('SIGINT', () => {
    monitor.log('Received SIGINT - stopping monitor...', 'warning')
    monitor.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    monitor.log('Received SIGTERM - stopping monitor...', 'warning')
    monitor.stop()
    process.exit(0)
  })
  
  try {
    const command = process.argv.slice(2).join(' ') || 'next build'
    await monitor.runBuild(command)
  } catch (error) {
    monitor.log(`Build monitoring failed: ${error.message}`, 'error')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = BuildMonitor
