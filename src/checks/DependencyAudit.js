const { execSync } = require('child_process')
const BaseCheck = require('./BaseCheck')

class DependencyAudit extends BaseCheck {
  async run() {
    if (!this.config.checks.dependencyAudit?.enabled) {
      this.log('Dependency audit disabled in configuration')
      return
    }

    this.log('Running dependency security audit...')
    
    try {
      const packageManager = this.config.packageManager || 'npm'
      const command = `${packageManager} ${this.config.checks.dependencyAudit.command}`
      const auditOutput = execSync(command, { encoding: 'utf8' })
      const auditData = JSON.parse(auditOutput)
      
      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]) => {
          this.results.vulnerabilities.push({
            package: pkg,
            severity: vuln.severity,
            title: vuln.title,
            description: vuln.description,
            recommendation: vuln.recommendation
          })
        })
      }
      
      const thresholds = this.config.checks.dependencyAudit.severityThresholds || {}
      const criticalCount = this.results.vulnerabilities.filter(v => v.severity === 'critical').length
      const highCount = this.results.vulnerabilities.filter(v => v.severity === 'high').length
      const moderateCount = this.results.vulnerabilities.filter(v => v.severity === 'moderate').length
      const lowCount = this.results.vulnerabilities.filter(v => v.severity === 'low').length
      
      // Check against thresholds
      const exceedsThresholds = 
        criticalCount > (thresholds.critical || 0) ||
        highCount > (thresholds.high || 0) ||
        moderateCount > (thresholds.moderate || 5) ||
        lowCount > (thresholds.low || 10)
      
      this.results.checks.dependencyAudit = {
        status: exceedsThresholds ? 'fail' : 'pass',
        vulnerabilities: this.results.vulnerabilities.length,
        critical: criticalCount,
        high: highCount,
        moderate: moderateCount,
        low: lowCount,
        thresholds: thresholds
      }
      
      this.log(`Found ${this.results.vulnerabilities.length} vulnerabilities`)
      
    } catch (error) {
      this.log(`Dependency audit failed: ${error.message}`, 'error')
      this.results.checks.dependencyAudit = { status: 'error', error: error.message }
    }
  }
}

module.exports = DependencyAudit
