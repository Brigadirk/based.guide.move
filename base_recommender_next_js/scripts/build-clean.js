#!/usr/bin/env node

/**
 * Build Clean Script
 * Ensures clean builds by removing problematic cache files
 */

const fs = require('fs')
const path = require('path')

const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.turbo'
]

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🧹 Cleaning ${dirPath}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
    console.log(`✅ Cleaned ${dirPath}`)
  } else {
    console.log(`ℹ️  ${dirPath} doesn't exist, skipping`)
  }
}

function main() {
  console.log('🚀 Starting build cleanup...')
  
  dirsToClean.forEach(removeDir)
  
  console.log('✨ Build cleanup complete!')
  console.log('💡 You can now run: npm run build')
}

if (require.main === module) {
  main()
}

module.exports = { removeDir, dirsToClean }
