#!/usr/bin/env node

/**
 * Pre-build check script
 * Ensures clean state before building to prevent manifest errors
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Running pre-build checks...')

// Check 1: Verify .next directory state
function checkNextDirectory() {
  console.log('\n📁 Checking .next directory...')
  
  const nextDir = '.next'
  if (fs.existsSync(nextDir)) {
    console.log('⚠️  Found existing .next directory - will clean')
    
    // Check for problematic manifest files
    const problemFiles = [
      '.next/build-manifest.json',
      '.next/app-build-manifest.json',
      '.next/server/app/page/app-build-manifest.json'
    ]
    
    const foundProblems = problemFiles.filter(file => fs.existsSync(file))
    if (foundProblems.length > 0) {
      console.log('🚨 Found problematic manifest files:')
      foundProblems.forEach(file => console.log(`   - ${file}`))
      return false
    }
  }
  
  console.log('✅ .next directory check passed')
  return true
}

// Check 2: Verify Node.js cache state
function checkNodeModulesCache() {
  console.log('\n📦 Checking node_modules cache...')
  
  const cacheDir = 'node_modules/.cache'
  if (fs.existsSync(cacheDir)) {
    console.log('⚠️  Found node_modules cache - will clean')
    return false
  }
  
  console.log('✅ Node modules cache check passed')
  return true
}

// Check 3: Verify environment
function checkEnvironment() {
  console.log('\n🌍 Checking environment...')
  
  // Check Node.js version
  const nodeVersion = process.version
  console.log(`Node.js version: ${nodeVersion}`)
  
  // Check for common environment issues
  if (process.env.NODE_ENV === 'production') {
    console.log('📦 Production build detected')
  } else {
    console.log('🔧 Development build detected')
  }
  
  console.log('✅ Environment check passed')
  return true
}

// Check 4: Verify package integrity
function checkPackageIntegrity() {
  console.log('\n📋 Checking package integrity...')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const lockFile = fs.existsSync('package-lock.json') ? 'package-lock.json' : 
                     fs.existsSync('yarn.lock') ? 'yarn.lock' : null
    
    if (!lockFile) {
      console.log('⚠️  No lock file found - dependency versions may be inconsistent')
      return false
    }
    
    console.log(`✅ Package integrity check passed (using ${lockFile})`)
    return true
  } catch (error) {
    console.log(`❌ Package integrity check failed: ${error.message}`)
    return false
  }
}

// Main function
function main() {
  console.log('🛡️  PRE-BUILD VERIFICATION SYSTEM')
  console.log('================================')
  
  const checks = [
    { name: 'Next.js Directory', fn: checkNextDirectory },
    { name: 'Node Modules Cache', fn: checkNodeModulesCache },
    { name: 'Environment', fn: checkEnvironment },
    { name: 'Package Integrity', fn: checkPackageIntegrity }
  ]
  
  let needsCleanup = false
  let allPassed = true
  
  for (const check of checks) {
    const passed = check.fn()
    if (!passed) {
      allPassed = false
      if (check.name === 'Next.js Directory' || check.name === 'Node Modules Cache') {
        needsCleanup = true
      }
    }
  }
  
  console.log('\n📊 PRE-BUILD SUMMARY')
  console.log('====================')
  
  if (needsCleanup) {
    console.log('🧹 Cleanup required - running build clean...')
    try {
      execSync('node scripts/build-clean.js', { stdio: 'inherit' })
      console.log('✅ Cleanup completed successfully')
    } catch (error) {
      console.log('❌ Cleanup failed:', error.message)
      process.exit(1)
    }
  }
  
  if (allPassed || needsCleanup) {
    console.log('🎉 Pre-build checks passed - ready to build!')
    process.exit(0)
  } else {
    console.log('❌ Pre-build checks failed - please resolve issues before building')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { checkNextDirectory, checkNodeModulesCache, checkEnvironment, checkPackageIntegrity }
