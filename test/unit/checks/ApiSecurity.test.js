const fs = require('fs')
const path = require('path')
const ApiSecurity = require('../../../src/checks/ApiSecurity')

// Mock fs module
jest.mock('fs')

describe('ApiSecurity', () => {
  let check
  let mockConfig
  let mockResults

  beforeEach(() => {
    mockConfig = {
      checks: {
        apiSecurity: {
          enabled: true,
          apiDirectory: 'pages/api',
          filePatterns: ['route.ts'],
          authMiddleware: ['withAuth'],
          validationMiddleware: ['withValidation']
        }
      }
    }
    
    mockResults = {
      checks: {},
      warnings: []
    }
    
    check = new ApiSecurity(mockConfig, mockResults)
  })

  test('should pass when all endpoints are protected', async () => {
    const protectedContent = `
      import { withAuth } from '@/lib/auth'
      import { withValidation } from '@/lib/validation'
      
      export default withAuth(withValidation(async (req, res) => {
        res.json({ message: 'Protected' })
      }))
    `
    
    fs.existsSync.mockReturnValue(true)
    fs.readdirSync.mockReturnValue(['protected'])
    fs.statSync.mockReturnValue({ isDirectory: () => true })
    fs.readFileSync.mockReturnValue(protectedContent)
    
    // Mock the recursive directory reading
    const originalReadDir = check.findApiFiles
    check.findApiFiles = jest.fn().mockReturnValue(['pages/api/protected/route.ts'])
    
    await check.run()
    
    expect(mockResults.checks.apiSecurity.status).toBe('pass')
    expect(mockResults.checks.apiSecurity.unprotectedEndpoints).toBe(0)
    expect(mockResults.checks.apiSecurity.missingValidation).toBe(0)
  })

  test('should warn when endpoints are unprotected', async () => {
    const unprotectedContent = `
      export default async (req, res) => {
        res.json({ message: 'Unprotected' })
      }
    `
    
    fs.existsSync.mockReturnValue(true)
    check.findApiFiles = jest.fn().mockReturnValue(['pages/api/public/route.ts'])
    fs.readFileSync.mockReturnValue(unprotectedContent)
    
    await check.run()
    
    expect(mockResults.checks.apiSecurity.status).toBe('warn')
    expect(mockResults.checks.apiSecurity.unprotectedEndpoints).toBe(1)
    expect(mockResults.checks.apiSecurity.missingValidation).toBe(1)
  })

  test('should warn when API directory does not exist', async () => {
    fs.existsSync.mockReturnValue(false)
    
    await check.run()
    
    expect(mockResults.checks.apiSecurity.status).toBe('warn')
    expect(mockResults.checks.apiSecurity.missing).toBe('api_directory')
    expect(mockResults.warnings).toContain('API directory not found: pages/api')
  })

  test('should skip when disabled in configuration', async () => {
    mockConfig.checks.apiSecurity.enabled = false
    
    await check.run()
    
    expect(mockResults.checks.apiSecurity).toBeUndefined()
  })

  test('should find API files with correct patterns', () => {
    const mockItems = ['route.ts', 'index.js', 'other.txt']
    fs.readdirSync.mockReturnValue(mockItems)
    fs.statSync.mockImplementation((filePath) => ({
      isDirectory: () => filePath.includes('subdir'),
      isFile: () => !filePath.includes('subdir')
    }))
    
    const files = check.findApiFiles('/test/api', ['route.ts', 'index.js'])
    
    expect(files).toContain('/test/api/route.ts')
    expect(files).toContain('/test/api/index.js')
    expect(files).not.toContain('/test/api/other.txt')
  })
})
