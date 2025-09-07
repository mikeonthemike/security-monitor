const EnvironmentVariables = require('../../../src/checks/EnvironmentVariables')

describe('EnvironmentVariables', () => {
  let check
  let mockConfig
  let mockResults

  beforeEach(() => {
    mockConfig = {
      checks: {
        environmentVariables: {
          enabled: true,
          required: ['DATABASE_URL', 'API_KEY'],
          optional: ['DEBUG'],
          minLength: 5,
          patterns: {
            insecure: ['password', 'secret']
          }
        }
      }
    }
    
    mockResults = {
      checks: {},
      warnings: []
    }
    
    check = new EnvironmentVariables(mockConfig, mockResults)
    
    // Clear environment variables
    delete process.env.DATABASE_URL
    delete process.env.API_KEY
    delete process.env.DEBUG
  })

  test('should pass when all required variables are present and secure', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.API_KEY = 'secure-api-key-12345'
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables.status).toBe('pass')
    expect(mockResults.checks.environmentVariables.missing).toHaveLength(0)
    expect(mockResults.checks.environmentVariables.insecure).toHaveLength(0)
  })

  test('should warn when required variables are missing', async () => {
    process.env.API_KEY = 'secure-api-key-12345'
    // DATABASE_URL is missing
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables.status).toBe('warn')
    expect(mockResults.checks.environmentVariables.missing).toContain('DATABASE_URL')
  })

  test('should warn when variables are too short', async () => {
    process.env.DATABASE_URL = 'short'
    process.env.API_KEY = 'key'
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables.status).toBe('warn')
    expect(mockResults.checks.environmentVariables.insecure).toContain('DATABASE_URL')
    expect(mockResults.checks.environmentVariables.insecure).toContain('API_KEY')
  })

  test('should warn when variables contain insecure patterns', async () => {
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db'
    process.env.API_KEY = 'secret-key'
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables.status).toBe('warn')
    expect(mockResults.checks.environmentVariables.insecure).toContain('DATABASE_URL')
    expect(mockResults.checks.environmentVariables.insecure).toContain('API_KEY')
  })

  test('should skip when disabled in configuration', async () => {
    mockConfig.checks.environmentVariables.enabled = false
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables).toBeUndefined()
  })

  test('should handle empty required variables array', async () => {
    mockConfig.checks.environmentVariables.required = []
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables.status).toBe('pass')
  })
})
