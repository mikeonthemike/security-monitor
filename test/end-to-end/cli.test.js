const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { setupTestProject, cleanupTestProject, testProjectDir } = require('../setup')

describe('CLI End-to-End Tests', () => {
  let originalCwd

  beforeAll(() => {
    setupTestProject()
  })

  afterAll(() => {
    cleanupTestProject()
  })

  beforeEach(() => {
    originalCwd = process.cwd()
    process.chdir(testProjectDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
  })

  test('should run with default configuration', (done) => {
    const configPath = path.join(__dirname, '..', 'config', 'test.config.json')
    const child = spawn('node', [path.join(__dirname, '..', '..', 'index.js'), configPath])
    
    let output = ''
    let errorOutput = ''
    
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    child.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('Starting security audit')
      expect(output).toContain('Security audit completed')
      expect(fs.existsSync(path.join(testProjectDir, 'test-security-report.json'))).toBe(true)
      done()
    })
  })

  test('should handle missing configuration file', (done) => {
    const child = spawn('node', [path.join(__dirname, '..', '..', 'index.js'), 'non-existent.json'])
    
    let errorOutput = ''
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    child.on('close', (code) => {
      expect(code).not.toBe(0)
      expect(errorOutput).toContain('Configuration file not found')
      done()
    })
  })

  test('should run with custom report file', (done) => {
    const customConfigPath = path.join(__dirname, '..', 'config', 'custom-report.config.json')
    
    // Create config with custom report file
    const customConfig = {
      project: { name: 'Custom Test' },
      packageManager: 'npm',
      checks: {
        dependencyAudit: { enabled: false },
        environmentVariables: { enabled: true, required: [] },
        securityHeaders: { enabled: false },
        apiSecurity: { enabled: false },
        databaseSecurity: { enabled: false }
      },
      output: { reportFile: 'custom-report.json' }
    }
    
    fs.writeFileSync(customConfigPath, JSON.stringify(customConfig, null, 2))
    
    const child = spawn('node', [path.join(__dirname, '..', '..', 'index.js'), customConfigPath])
    
    child.on('close', (code) => {
      expect(code).toBe(0)
      expect(fs.existsSync(path.join(testProjectDir, 'custom-report.json'))).toBe(true)
      
      // Cleanup
      fs.unlinkSync(customConfigPath)
      fs.unlinkSync(path.join(testProjectDir, 'custom-report.json'))
      done()
    })
  })
})
