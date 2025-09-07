const fs = require('fs')
const path = require('path')
const SecurityHeaders = require('../../../src/checks/SecurityHeaders')

// Mock fs module
jest.mock('fs')

describe('SecurityHeaders', () => {
  let check
  let mockConfig
  let mockResults

  beforeEach(() => {
    mockConfig = {
      checks: {
        securityHeaders: {
          enabled: true,
          configFile: 'next.config.js',
          required: ['X-Frame-Options', 'X-Content-Type-Options']
        }
      }
    }
    
    mockResults = {
      checks: {},
      warnings: []
    }
    
    check = new SecurityHeaders(mockConfig, mockResults)
  })

  test('should pass when all required headers are present', async () => {
    const configContent = `
      module.exports = {
        async headers() {
          return [{
            headers: [
              { key: 'X-Frame-Options', value: 'DENY' },
              { key: 'X-Content-Type-Options', value: 'nosniff' }
            ]
          }]
        }
      }
    `
    
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)
    
    await check.run()
    
    expect(mockResults.checks.securityHeaders.status).toBe('pass')
    expect(mockResults.checks.securityHeaders.missing).toHaveLength(0)
  })

  test('should warn when headers are missing', async () => {
    const configContent = `
      module.exports = {
        async headers() {
          return [{
            headers: [
              { key: 'X-Frame-Options', value: 'DENY' }
              // Missing X-Content-Type-Options
            ]
          }]
        }
      }
    `
    
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)
    
    await check.run()
    
    expect(mockResults.checks.securityHeaders.status).toBe('warn')
    expect(mockResults.checks.securityHeaders.missing).toContain('X-Content-Type-Options')
  })

  test('should warn when config file does not exist', async () => {
    fs.existsSync.mockReturnValue(false)
    
    await check.run()
    
    expect(mockResults.checks.securityHeaders.status).toBe('warn')
    expect(mockResults.checks.securityHeaders.missing).toBe('config_file')
    expect(mockResults.warnings).toContain('next.config.js not found')
  })

  test('should skip when disabled in configuration', async () => {
    mockConfig.checks.securityHeaders.enabled = false
    
    await check.run()
    
    expect(mockResults.checks.securityHeaders).toBeUndefined()
  })

  test('should use default config file when not specified', async () => {
    delete mockConfig.checks.securityHeaders.configFile
    
    fs.existsSync.mockReturnValue(false)
    
    await check.run()
    
    expect(fs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining('next.config.mjs')
    )
  })
})
