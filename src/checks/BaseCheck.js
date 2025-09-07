/**
 * Base class for all security checks
 */

class BaseCheck {
  constructor(config, results) {
    this.config = config
    this.results = results
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async run() {
    throw new Error('run() method must be implemented by subclass')
  }
}

module.exports = BaseCheck
