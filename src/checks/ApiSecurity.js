const fs = require('fs')
const path = require('path')
const BaseCheck = require('./BaseCheck')

class ApiSecurity extends BaseCheck {
  async run() {
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
}

module.exports = ApiSecurity
