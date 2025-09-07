const BaseCheck = require('./BaseCheck')

class EnvironmentVariables extends BaseCheck {
  async run() {
    if (!this.config.checks.environmentVariables?.enabled) {
      this.log('Environment variable check disabled in configuration')
      return
    }

    this.log('Checking environment variable security...')
    
    const envConfig = this.config.checks.environmentVariables
    const requiredVars = envConfig.required || []
    const optionalVars = envConfig.optional || []
    const minLength = envConfig.minLength || 10
    const insecurePatterns = envConfig.patterns?.insecure || ['password', 'secret', 'key']
    
    const missingVars = []
    const insecureVars = []
    
    // Check required variables
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName)
      } else if (process.env[varName].length < minLength) {
        insecureVars.push(varName)
      }
    })
    
    // Check for insecure patterns in all environment variables
    Object.entries(process.env).forEach(([key, value]) => {
      if (value && insecurePatterns.some(pattern => value.toLowerCase().includes(pattern))) {
        if (value.length < (minLength * 2)) {
          insecureVars.push(key)
        }
      }
    })
    
    this.results.checks.environmentVariables = {
      status: missingVars.length === 0 && insecureVars.length === 0 ? 'pass' : 'warn',
      missing: missingVars,
      insecure: insecureVars,
      checked: requiredVars.length + optionalVars.length
    }
    
    if (missingVars.length > 0) {
      this.log(`Missing environment variables: ${missingVars.join(', ')}`, 'warn')
    }
    
    if (insecureVars.length > 0) {
      this.log(`Potentially insecure environment variables: ${insecureVars.join(', ')}`, 'warn')
    }
  }
}

module.exports = EnvironmentVariables
