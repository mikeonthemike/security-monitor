#!/usr/bin/env node

/**
 * Test runner script for the security monitor
 * Provides different test modes and utilities
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const testModes = {
  unit: 'npm run test:unit',
  integration: 'npm run test:integration',
  e2e: 'npm run test:e2e',
  all: 'npm test',
  watch: 'npm run test:watch'
}

function runTests(mode = 'all') {
  console.log(`🧪 Running ${mode} tests...`)
  
  const command = testModes[mode]
  if (!command) {
    console.error(`❌ Unknown test mode: ${mode}`)
    console.log('Available modes:', Object.keys(testModes).join(', '))
    process.exit(1)
  }

  const [cmd, ...args] = command.split(' ')
  const child = spawn(cmd, args, { stdio: 'inherit' })

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ ${mode} tests passed!`)
    } else {
      console.log(`❌ ${mode} tests failed with code ${code}`)
      process.exit(code)
    }
  })
}

function generateTestReport() {
  console.log('📊 Generating test report...')
  
  const reportPath = path.join(__dirname, '..', 'test-report.html')
  const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html')
  
  if (fs.existsSync(coveragePath)) {
    fs.copyFileSync(coveragePath, reportPath)
    console.log(`📈 Test report generated: ${reportPath}`)
  } else {
    console.log('⚠️  Coverage report not found. Run tests with coverage first.')
  }
}

function runSecurityAuditOnSelf() {
  console.log('🔍 Running security audit on the security monitor itself...')
  
  const configPath = path.join(__dirname, '..', 'config', 'self-audit.config.json')
  const selfConfig = {
    project: {
      name: 'Security Monitor Self-Audit',
      description: 'Security audit of the security monitor project itself',
      version: '1.0.0'
    },
    packageManager: 'npm',
    checks: {
      dependencyAudit: {
        enabled: true,
        command: 'audit --json',
        severityThresholds: {
          critical: 0,
          high: 0,
          moderate: 5,
          low: 10
        }
      },
      environmentVariables: {
        enabled: false
      },
      securityHeaders: {
        enabled: false
      },
      apiSecurity: {
        enabled: false
      },
      databaseSecurity: {
        enabled: false
      }
    },
    output: {
      reportFile: 'self-audit-report.json',
      logLevel: 'info',
      includeRecommendations: true
    }
  }
  
  fs.writeFileSync(configPath, JSON.stringify(selfConfig, null, 2))
  
  const child = spawn('node', [path.join(__dirname, '..', '..', 'index.js'), configPath], {
    stdio: 'inherit'
  })
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Self-audit completed successfully!')
    } else {
      console.log('❌ Self-audit failed')
    }
    
    // Cleanup
    fs.unlinkSync(configPath)
  })
}

// CLI interface
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'unit':
  case 'integration':
  case 'e2e':
  case 'all':
  case 'watch':
    runTests(command)
    break
  case 'report':
    generateTestReport()
    break
  case 'self-audit':
    runSecurityAuditOnSelf()
    break
  case 'help':
  default:
    console.log(`
🧪 Security Monitor Test Runner

Usage: node test/scripts/test-runner.js <command>

Commands:
  unit        Run unit tests only
  integration Run integration tests only
  e2e         Run end-to-end tests only
  all         Run all tests (default)
  watch       Run tests in watch mode
  report      Generate test coverage report
  self-audit  Run security audit on the project itself
  help        Show this help message

Examples:
  node test/scripts/test-runner.js unit
  node test/scripts/test-runner.js watch
  node test/scripts/test-runner.js self-audit
`)
    break
}
