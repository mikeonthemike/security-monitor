const fs = require('fs')
const path = require('path')

class ReportGenerator {
  constructor(config, results) {
    this.config = config
    this.results = results
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  generateRecommendations() {
    if (!this.config.output?.includeRecommendations) {
      return
    }

    this.log('Generating security recommendations...')
    
    const packageManager = this.config.packageManager || 'npm'
    
    // Dependency vulnerabilities
    if (this.results.vulnerabilities.length > 0) {
      this.results.recommendations.push({
        priority: 'high',
        category: 'dependencies',
        title: 'Update vulnerable dependencies',
        description: `Found ${this.results.vulnerabilities.length} vulnerabilities. Run '${packageManager} update' to fix them.`
      })
    }
    
    // Environment variables
    if (this.results.checks.environmentVariables?.missing?.length > 0) {
      this.results.recommendations.push({
        priority: 'high',
        category: 'environment',
        title: 'Configure missing environment variables',
        description: 'Set up all required environment variables for production deployment.'
      })
    }
    
    // API security
    if (this.results.checks.apiSecurity?.unprotectedEndpoints > 0) {
      this.results.recommendations.push({
        priority: 'high',
        category: 'api',
        title: 'Protect API endpoints',
        description: 'Add authentication middleware to all sensitive API endpoints.'
      })
    }
    
    // Security headers
    if (this.results.checks.securityHeaders?.missing?.length > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        category: 'headers',
        title: 'Implement security headers',
        description: 'Add comprehensive security headers to prevent common attacks.'
      })
    }
    
    // Database security
    if (this.results.checks.databaseSecurity?.issues?.length > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        category: 'database',
        title: 'Improve database security',
        description: 'Configure proper SSL settings and connection limits.'
      })
    }
  }

  async generateReport() {
    this.log('Generating security report...')
    
    const reportFile = this.config.output?.reportFile || 'security-report.json'
    const reportPath = path.join(process.cwd(), reportFile)
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    
    this.log(`Security report saved to: ${reportPath}`)
    
    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log(`SECURITY AUDIT SUMMARY - ${this.results.project?.name || 'Security Monitor'}`)
    console.log('='.repeat(50))
    
    Object.entries(this.results.checks).forEach(([check, result]) => {
      const status = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'
      console.log(`${status} ${check}: ${result.status}`)
    })
    
    if (this.results.vulnerabilities.length > 0) {
      console.log(`\n🔍 Vulnerabilities found: ${this.results.vulnerabilities.length}`)
    }
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 Recommendations: ${this.results.recommendations.length}`)
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`)
      })
    }
    
    console.log('\n' + '='.repeat(50))
  }
}

module.exports = ReportGenerator
