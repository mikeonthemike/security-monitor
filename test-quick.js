#!/usr/bin/env node

/**
 * Quick test script to verify the security monitor works
 * This is a simple smoke test that doesn't require Jest
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧪 Running quick smoke test...')

// Test 1: Check if main files exist
console.log('1. Checking file structure...')
const requiredFiles = [
  'index.js',
  'src/SecurityMonitor.js',
  'src/ConfigLoader.js',
  'src/ReportGenerator.js',
  'src/checks/BaseCheck.js',
  'src/checks/DependencyAudit.js',
  'src/checks/EnvironmentVariables.js',
  'src/checks/SecurityHeaders.js',
  'src/checks/ApiSecurity.js',
  'src/checks/DatabaseSecurity.js',
  'security-monitor.config.json',
  'package.json'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('❌ Some required files are missing!')
  process.exit(1)
}

// Test 2: Check if modules can be loaded
console.log('\n2. Testing module loading...')
try {
  const SecurityMonitor = require('./src/SecurityMonitor')
  console.log('   ✅ SecurityMonitor loaded')
  
  const ConfigLoader = require('./src/ConfigLoader')
  console.log('   ✅ ConfigLoader loaded')
  
  const DependencyAudit = require('./src/checks/DependencyAudit')
  console.log('   ✅ DependencyAudit loaded')
  
  const EnvironmentVariables = require('./src/checks/EnvironmentVariables')
  console.log('   ✅ EnvironmentVariables loaded')
  
  const SecurityHeaders = require('./src/checks/SecurityHeaders')
  console.log('   ✅ SecurityHeaders loaded')
  
  const ApiSecurity = require('./src/checks/ApiSecurity')
  console.log('   ✅ ApiSecurity loaded')
  
  const DatabaseSecurity = require('./src/checks/DatabaseSecurity')
  console.log('   ✅ DatabaseSecurity loaded')
  
  const ReportGenerator = require('./src/ReportGenerator')
  console.log('   ✅ ReportGenerator loaded')
} catch (error) {
  console.log(`   ❌ Module loading failed: ${error.message}`)
  process.exit(1)
}

// Test 3: Check configuration loading
console.log('\n3. Testing configuration loading...')
try {
  const ConfigLoader = require('./src/ConfigLoader')
  const configLoader = new ConfigLoader()
  const config = configLoader.load('security-monitor.config.json')
  
  if (config.project && config.checks) {
    console.log('   ✅ Configuration loaded successfully')
    console.log(`   📋 Project: ${config.project.name}`)
    console.log(`   🔧 Checks configured: ${Object.keys(config.checks).length}`)
  } else {
    console.log('   ❌ Configuration structure invalid')
    process.exit(1)
  }
} catch (error) {
  console.log(`   ❌ Configuration loading failed: ${error.message}`)
  process.exit(1)
}

// Test 4: Test basic functionality
console.log('\n4. Testing basic functionality...')
try {
  const SecurityMonitor = require('./src/SecurityMonitor')
  
  // Create a minimal test config
  const testConfig = {
    project: { name: 'Quick Test' },
    packageManager: 'npm',
    checks: {
      dependencyAudit: { enabled: false },
      environmentVariables: { enabled: true, required: [] },
      securityHeaders: { enabled: false },
      apiSecurity: { enabled: false },
      databaseSecurity: { enabled: false }
    },
    output: { reportFile: 'quick-test-report.json' }
  }
  
  const testConfigPath = 'quick-test.config.json'
  fs.writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2))
  
  const monitor = new SecurityMonitor(testConfigPath)
  console.log('   ✅ SecurityMonitor instance created')
  
  // Cleanup
  fs.unlinkSync(testConfigPath)
  if (fs.existsSync('quick-test-report.json')) {
    fs.unlinkSync('quick-test-report.json')
  }
  
} catch (error) {
  console.log(`   ❌ Basic functionality test failed: ${error.message}`)
  process.exit(1)
}

// Test 5: Check package.json scripts
console.log('\n5. Checking package.json scripts...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredScripts = ['test', 'test:unit', 'test:integration', 'test:e2e']
  
  let allScriptsExist = true
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`   ✅ ${script}`)
    } else {
      console.log(`   ❌ ${script} - MISSING`)
      allScriptsExist = false
    }
  })
  
  if (!allScriptsExist) {
    console.log('   ⚠️  Some test scripts are missing')
  }
} catch (error) {
  console.log(`   ❌ Package.json check failed: ${error.message}`)
}

console.log('\n🎉 Quick smoke test completed successfully!')
console.log('\nNext steps:')
console.log('1. Install dependencies: npm install')
console.log('2. Run full test suite: npm test')
console.log('3. Run security audit: npm run test:self-audit')
console.log('4. Check test coverage: npm run test:coverage')
