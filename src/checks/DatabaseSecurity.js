const fs = require('fs')
const path = require('path')
const BaseCheck = require('./BaseCheck')

class DatabaseSecurity extends BaseCheck {
  async run() {
    if (!this.config.checks.databaseSecurity?.enabled) {
      this.log('Database security check disabled in configuration')
      return
    }

    this.log('Checking database security configuration...')
    
    const dbConfig = this.config.checks.databaseSecurity
    const dbConfigPath = path.join(process.cwd(), dbConfig.configFile || 'lib/database.ts')
    
    if (!fs.existsSync(dbConfigPath)) {
      this.results.warnings.push(`Database configuration not found: ${dbConfigPath}`)
      this.results.checks.databaseSecurity = { status: 'warn', missing: 'config_file' }
      return
    }
    
    const content = fs.readFileSync(dbConfigPath, 'utf8')
    const securityIssues = []
    const checks = dbConfig.checks || ['sslValidation', 'connectionLimits', 'timeouts']
    
    // Check for SSL configuration
    if (checks.includes('sslValidation') && content.includes('rejectUnauthorized: false')) {
      securityIssues.push('SSL certificate validation disabled')
    }
    
    // Check for connection limits
    if (checks.includes('connectionLimits') && (!content.includes('max:') || !content.includes('min:'))) {
      securityIssues.push('Connection pool limits not configured')
    }
    
    // Check for timeouts
    if (checks.includes('timeouts') && !content.includes('timeout')) {
      securityIssues.push('Query timeouts not configured')
    }
    
    this.results.checks.databaseSecurity = {
      status: securityIssues.length === 0 ? 'pass' : 'warn',
      issues: securityIssues,
      configFile: dbConfig.configFile || 'lib/database.ts'
    }
    
    if (securityIssues.length > 0) {
      this.log(`Database security issues: ${securityIssues.join(', ')}`, 'warn')
    }
  }
}

module.exports = DatabaseSecurity
