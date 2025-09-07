const fs = require('fs')

class ConfigLoader {
  load(configPath) {
    try {
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`)
      }
      
      const configContent = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configContent)
      
      // Validate required configuration sections
      if (!config.checks) {
        throw new Error('Configuration must include "checks" section')
      }
      
      return config
    } catch (error) {
      console.error(`❌ Failed to load configuration: ${error.message}`)
      process.exit(1)
    }
  }
}

module.exports = ConfigLoader
