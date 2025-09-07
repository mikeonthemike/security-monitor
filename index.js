#!/usr/bin/env node

/**
 * Universal Security Monitor - Main Entry Point
 * 
 * A configurable security monitoring script for any Node.js project
 */

const SecurityMonitor = require('./src/SecurityMonitor')

// Run the security monitor
if (require.main === module) {
  const configPath = process.argv[2] || 'security-monitor.config.json'
  const monitor = new SecurityMonitor(configPath)
  monitor.run().catch(console.error)
}

module.exports = SecurityMonitor
