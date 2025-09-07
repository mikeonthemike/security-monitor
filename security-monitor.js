#!/usr/bin/env node

/**
 * Security Monitoring Script
 * 
 * This script performs configurable security checks and monitoring:
 * - Dependency vulnerability scanning
 * - Environment variable validation
 * - Database security checks
 * - API endpoint security testing
 * - Security headers validation
 * 
 * Configuration is loaded from security-monitor.config.json
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class SecurityMonitor {
  constructor(configPath = 'security-monitor.config.json') {
    this.config = this.loadConfig(configPath)
    this.results = {
      timestamp: new Date().toISOString(),
      project: this.config.project,
      checks: {},
      vulnerabilities: [],
      warnings: [],
      recommendations: []
    }
  }

  loadConfig(configPath) {
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

  log(message, level = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async runDependencyAudit() {
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

  async checkEnvironmentVariables() {
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

  async checkSecurityHeaders() {
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

  async checkApiSecurity() {
    if (!this.config.checks.apiSecurity?.enabled) {
      this.log('API security check disabled in configuration')
      return
    }

    this.log('Checking API endpoint security...')
    
    const apiConfig = this.config.checks.apiSecurity
    const apiDir = path.join(process.cwd(), apiConfig.apiDirectory || 'app/api')
    
    if (!fs.existsSync(apiDir)) {
      this.results.warnings.push(`API directory not found: ${apiDir}`)
      this.results.checks.apiSecurity = { status: 'warn', missing: 'api_directory' }
      return
    }
    
    const apiFiles = this.findApiFiles(apiDir, apiConfig.filePatterns || ['route.ts', 'route.js'])
    const unprotectedEndpoints = []
    const missingValidation = []
    
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      
      // Check for authentication middleware
      const authMiddleware = apiConfig.authMiddleware || ['withAuth', 'withOptionalAuth']
      if (!authMiddleware.some(middleware => content.includes(middleware))) {
        unprotectedEndpoints.push(file)
      }
      
      // Check for input validation
      const validationMiddleware = apiConfig.validationMiddleware || ['withValidation', 'zod']
      if (!validationMiddleware.some(middleware => content.includes(middleware))) {
        missingValidation.push(file)
      }
    })
    
    this.results.checks.apiSecurity = {
      status: unprotectedEndpoints.length === 0 ? 'pass' : 'warn',
      unprotectedEndpoints: unprotectedEndpoints.length,
      missingValidation: missingValidation.length,
      totalFiles: apiFiles.length
    }
    
    if (unprotectedEndpoints.length > 0) {
      this.log(`Found ${unprotectedEndpoints.length} unprotected API endpoints`, 'warn')
    }
  }

  findApiFiles(dir, filePatterns = ['route.ts', 'route.js']) {
    const files = []
    
    const readDir = (currentDir) => {
      const items = fs.readdirSync(currentDir)
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          readDir(fullPath)
        } else if (filePatterns.includes(item)) {
          files.push(fullPath)
        }
      })
    }
    
    readDir(dir)
    return files
  }

  async checkDatabaseSecurity() {
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

  async run() {
    this.log(`Starting security audit for ${this.results.project?.name || 'project'}...`)
    
    // Run only enabled checks
    if (this.config.checks.dependencyAudit?.enabled) {
      await this.runDependencyAudit()
    }
    
    if (this.config.checks.environmentVariables?.enabled) {
      await this.checkEnvironmentVariables()
    }
    
    if (this.config.checks.securityHeaders?.enabled) {
      await this.checkSecurityHeaders()
    }
    
    if (this.config.checks.apiSecurity?.enabled) {
      await this.checkApiSecurity()
    }
    
    if (this.config.checks.databaseSecurity?.enabled) {
      await this.checkDatabaseSecurity()
    }
    
    this.generateRecommendations()
    await this.generateReport()
    
    this.log('Security audit completed!')
  }
}

// Run the security monitor
if (require.main === module) {
  const configPath = process.argv[2] || 'security-monitor.config.json'
  const monitor = new SecurityMonitor(configPath)
  monitor.run().catch(console.error)
}

module.exports = SecurityMonitor
