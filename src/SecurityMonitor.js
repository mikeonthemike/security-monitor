/**
 * Core Security Monitor Class
 * 
 * Orchestrates security checks and manages the overall monitoring process
 */

const ConfigLoader = require('./ConfigLoader')
const DependencyAudit = require('./checks/DependencyAudit')
const EnvironmentVariables = require('./checks/EnvironmentVariables')
const SecurityHeaders = require('./checks/SecurityHeaders')
const ApiSecurity = require('./checks/ApiSecurity')
const DatabaseSecurity = require('./checks/DatabaseSecurity')
const ReportGenerator = require('./ReportGenerator')

class SecurityMonitor {
  constructor(configPath = 'security-monitor.config.json') {
    this.config = new ConfigLoader().load(configPath)
    this.results = {
      timestamp: new Date().toISOString(),
      project: this.config.project,
      checks: {},
      vulnerabilities: [],
      warnings: [],
      recommendations: []
    }
    
    // Initialize check modules
    this.checks = {
      dependencyAudit: new DependencyAudit(this.config, this.results),
      environmentVariables: new EnvironmentVariables(this.config, this.results),
      securityHeaders: new SecurityHeaders(this.config, this.results),
      apiSecurity: new ApiSecurity(this.config, this.results),
      databaseSecurity: new DatabaseSecurity(this.config, this.results)
    }
    
    this.reportGenerator = new ReportGenerator(this.config, this.results)
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async run() {
    this.log(`Starting security audit for ${this.results.project?.name || 'project'}...`)
    
    // Run only enabled checks
    for (const [checkName, checkModule] of Object.entries(this.checks)) {
      if (this.config.checks[checkName]?.enabled) {
        try {
          await checkModule.run()
        } catch (error) {
          this.log(`Check ${checkName} failed: ${error.message}`, 'error')
          this.results.checks[checkName] = { status: 'error', error: error.message }
        }
      } else {
        this.log(`${checkName} check disabled in configuration`)
      }
    }
    
    this.reportGenerator.generateRecommendations()
    await this.reportGenerator.generateReport()
    
    this.log('Security audit completed!')
  }
}

module.exports = SecurityMonitor
