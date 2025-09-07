const fs = require('fs')
const path = require('path')
const ConfigLoader = require('../../src/ConfigLoader')

describe('ConfigLoader', () => {
  let configLoader
  let testConfigPath

  beforeEach(() => {
    configLoader = new ConfigLoader()
    testConfigPath = path.join(__dirname, '..', 'config', 'test.config.json')
  })

  test('should load valid configuration file', () => {
    const config = configLoader.load(testConfigPath)
    
    expect(config).toBeDefined()
    expect(config.project.name).toBe('Test Project')
    expect(config.checks).toBeDefined()
    expect(config.checks.dependencyAudit.enabled).toBe(true)
  })

  test('should throw error for non-existent file', () => {
    const nonExistentPath = 'non-existent-config.json'
    
    expect(() => {
      configLoader.load(nonExistentPath)
    }).toThrow('Configuration file not found')
  })

  test('should throw error for invalid JSON', () => {
    const invalidJsonPath = path.join(__dirname, '..', 'fixtures', 'invalid.json')
    
    // Create invalid JSON file
    fs.writeFileSync(invalidJsonPath, '{ invalid json }')
    
    expect(() => {
      configLoader.load(invalidJsonPath)
    }).toThrow()
    
    // Cleanup
    fs.unlinkSync(invalidJsonPath)
  })

  test('should throw error for missing checks section', () => {
    const invalidConfigPath = path.join(__dirname, '..', 'fixtures', 'missing-checks.json')
    
    // Create config without checks section
    fs.writeFileSync(invalidConfigPath, JSON.stringify({
      project: { name: 'Test' }
    }))
    
    expect(() => {
      configLoader.load(invalidConfigPath)
    }).toThrow('Configuration must include "checks" section')
    
    // Cleanup
    fs.unlinkSync(invalidConfigPath)
  })
})
