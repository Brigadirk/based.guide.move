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
  '.turbo',
  'node_modules/.next',
  '.next/cache',
  '.next/server',
  '.next/static',
  '.next/standalone'
]

const filesToClean = [
  '.next/BUILD_ID',
  '.next/build-manifest.json',
  '.next/app-build-manifest.json',
  '.next/server/app/page/app-build-manifest.json',
  '.next/server/middleware-build-manifest.js',
  '.next/server/middleware-manifest.json'
]

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🧹 Cleaning directory ${dirPath}...`)
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(`✅ Cleaned ${dirPath}`)
    } catch (error) {
      console.log(`⚠️  Warning: Could not clean ${dirPath}: ${error.message}`)
    }
  } else {
    console.log(`ℹ️  ${dirPath} doesn't exist, skipping`)
  }
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`🗑️  Removing file ${filePath}...`)
    try {
      fs.unlinkSync(filePath)
      console.log(`✅ Removed ${filePath}`)
    } catch (error) {
      console.log(`⚠️  Warning: Could not remove ${filePath}: ${error.message}`)
    }
  }
}

function main() {
  console.log('🚀 Starting comprehensive build cleanup...')
  
  // Clean directories first
  console.log('\n📁 Cleaning directories...')
  dirsToClean.forEach(removeDir)
  
  // Clean specific problematic files
  console.log('\n📄 Cleaning manifest files...')
  filesToClean.forEach(removeFile)
  
  // Extra safety: remove any stray manifest files
  console.log('\n🔍 Searching for stray manifest files...')
  try {
    const nextDir = '.next'
    if (fs.existsSync(nextDir)) {
      const findManifestFiles = (dir) => {
        const items = fs.readdirSync(dir, { withFileTypes: true })
        for (const item of items) {
          const fullPath = path.join(dir, item.name)
          if (item.isDirectory()) {
            try {
              findManifestFiles(fullPath)
            } catch (error) {
              // Skip inaccessible directories
            }
          } else if (item.name.includes('manifest') || item.name.includes('BUILD_ID')) {
            removeFile(fullPath)
          }
        }
      }
      findManifestFiles(nextDir)
    }
  } catch (error) {
    console.log(`ℹ️  Could not search for manifest files: ${error.message}`)
  }
  
  console.log('\n✨ Comprehensive build cleanup complete!')
  console.log('🛡️  All manifest files and caches cleared')
  console.log('💡 You can now run: npm run build')
}

if (require.main === module) {
  main()
}

module.exports = { removeDir, dirsToClean }
