const fs = require('fs')
const path = require('path')
const BaseCheck = require('./BaseCheck')

class SecurityHeaders extends BaseCheck {
  async run() {
    if (!this.config.checks.securityHeaders?.enabled) {
      this.log('Security headers check disabled in configuration')
      return
    }

    this.log('Checking security headers configuration...')
    
    const headersConfig = this.config.checks.securityHeaders
    const configFile = headersConfig.configFile || 'next.config.mjs'
    const configPath = path.join(process.cwd(), configFile)
    
    if (!fs.existsSync(configPath)) {
      this.results.warnings.push(`${configFile} not found`)
      this.results.checks.securityHeaders = { status: 'warn', missing: 'config_file' }
      return
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8')
    const requiredHeaders = headersConfig.required || []
    
    const missingHeaders = requiredHeaders.filter(header => 
      !configContent.includes(header)
    )
    
    this.results.checks.securityHeaders = {
      status: missingHeaders.length === 0 ? 'pass' : 'warn',
      missing: missingHeaders,
      configFile: configFile
    }
    
    if (missingHeaders.length > 0) {
      this.log(`Missing security headers: ${missingHeaders.join(', ')}`, 'warn')
    }
  }
}

module.exports = SecurityHeaders
