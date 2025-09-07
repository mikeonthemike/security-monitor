const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const SecurityMonitor = require('../../src/SecurityMonitor')
const { setupTestProject, cleanupTestProject, testProjectDir } = require('../setup')

// Mock execSync for dependency audit
jest.mock('child_process', () => ({
  execSync: jest.fn()
}))

describe('SecurityMonitor Integration', () => {
  let originalCwd
  let testConfigPath

  beforeAll(() => {
    setupTestProject()
    testConfigPath = path.join(__dirname, '..', 'config', 'test.config.json')
  })

  afterAll(() => {
    cleanupTestProject()
  })

  beforeEach(() => {
    originalCwd = process.cwd()
    process.chdir(testProjectDir)
    
    // Mock successful npm audit
    execSync.mockReturnValue(JSON.stringify({
      vulnerabilities: {}
    }))
  })

  afterEach(() => {
    process.chdir(originalCwd)
  })

  test('should run complete security audit', async () => {
    const monitor = new SecurityMonitor(testConfigPath)
    
    await monitor.run()
    
    expect(monitor.results.checks).toBeDefined()
    expect(monitor.results.checks.dependencyAudit).toBeDefined()
    expect(monitor.results.checks.environmentVariables).toBeDefined()
    expect(monitor.results.checks.securityHeaders).toBeDefined()
    expect(monitor.results.checks.apiSecurity).toBeDefined()
    expect(monitor.results.checks.databaseSecurity).toBeDefined()
  })

  test('should generate security report', async () => {
    const monitor = new SecurityMonitor(testConfigPath)
    
    await monitor.run()
    
    const reportPath = path.join(testProjectDir, 'test-security-report.json')
    expect(fs.existsSync(reportPath)).toBe(true)
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
    expect(report.project.name).toBe('Test Project')
    expect(report.checks).toBeDefined()
    expect(report.timestamp).toBeDefined()
  })

  test('should handle dependency vulnerabilities', async () => {
    // Mock npm audit with vulnerabilities
    execSync.mockReturnValue(JSON.stringify({
      vulnerabilities: {
        'lodash': {
          severity: 'high',
          title: 'Prototype Pollution',
          description: 'A vulnerability in lodash',
          recommendation: 'Update to version 4.17.21'
        }
      }
    }))
    
    const monitor = new SecurityMonitor(testConfigPath)
    await monitor.run()
    
    expect(monitor.results.vulnerabilities).toHaveLength(1)
    expect(monitor.results.vulnerabilities[0].package).toBe('lodash')
    expect(monitor.results.vulnerabilities[0].severity).toBe('high')
  })

  test('should skip disabled checks', async () => {
    const disabledConfigPath = path.join(__dirname, '..', 'config', 'disabled.config.json')
    
    // Create config with some checks disabled
    const disabledConfig = {
      project: { name: 'Test' },
      packageManager: 'npm',
      checks: {
        dependencyAudit: { enabled: false },
        environmentVariables: { enabled: true, required: [] },
        securityHeaders: { enabled: false },
        apiSecurity: { enabled: false },
        databaseSecurity: { enabled: false }
      },
      output: { reportFile: 'test-report.json' }
    }
    
    fs.writeFileSync(disabledConfigPath, JSON.stringify(disabledConfig, null, 2))
    
    const monitor = new SecurityMonitor(disabledConfigPath)
    await monitor.run()
    
    expect(monitor.results.checks.dependencyAudit).toBeUndefined()
    expect(monitor.results.checks.environmentVariables).toBeDefined()
    expect(monitor.results.checks.securityHeaders).toBeUndefined()
    expect(monitor.results.checks.apiSecurity).toBeUndefined()
    expect(monitor.results.checks.databaseSecurity).toBeUndefined()
    
    // Cleanup
    fs.unlinkSync(disabledConfigPath)
  })

  test('should handle missing files gracefully', async () => {
    // Remove some test files to simulate missing files
    fs.unlinkSync(path.join(testProjectDir, 'next.config.js'))
    fs.rmSync(path.join(testProjectDir, 'pages'), { recursive: true, force: true })
    
    const monitor = new SecurityMonitor(testConfigPath)
    await monitor.run()
    
    expect(monitor.results.warnings).toContain('next.config.js not found')
    expect(monitor.results.warnings).toContain('API directory not found: pages/api')
  })
})
