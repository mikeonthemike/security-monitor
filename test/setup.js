/**
 * Test setup and utilities
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Create a test project directory structure
const testProjectDir = path.join(__dirname, 'fixtures', 'test-project')

function setupTestProject() {
  // Create test project directory
  if (!fs.existsSync(testProjectDir)) {
    fs.mkdirSync(testProjectDir, { recursive: true })
  }

  // Create package.json for testing
  const packageJson = {
    name: 'test-project',
    version: '1.0.0',
    dependencies: {
      'express': '^4.18.0',
      'lodash': '^4.17.0'
    }
  }
  fs.writeFileSync(
    path.join(testProjectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create test API files
  const apiDir = path.join(testProjectDir, 'pages', 'api')
  fs.mkdirSync(apiDir, { recursive: true })

  // Protected API endpoint
  fs.writeFileSync(
    path.join(apiDir, 'protected', 'route.ts'),
    `import { withAuth } from '@/lib/auth'
import { withValidation } from '@/lib/validation'

export default withAuth(withValidation(async (req, res) => {
  res.json({ message: 'Protected endpoint' })
}))`
  )

  // Unprotected API endpoint
  fs.writeFileSync(
    path.join(apiDir, 'public', 'route.ts'),
    `export default async (req, res) => {
  res.json({ message: 'Public endpoint' })
}`
  )

  // Create next.config.js
  fs.writeFileSync(
    path.join(testProjectDir, 'next.config.js'),
    `module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}`
  )

  // Create database config
  const libDir = path.join(testProjectDir, 'lib')
  fs.mkdirSync(libDir, { recursive: true })
  fs.writeFileSync(
    path.join(libDir, 'database.ts'),
    `const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  },
  max: 10,
  min: 2,
  timeout: 30000
}

export default config`
  )

  // Create .env file
  fs.writeFileSync(
    path.join(testProjectDir, '.env'),
    `DATABASE_URL=postgresql://user:password@localhost:5432/testdb
API_KEY=test-api-key-12345
SECRET_KEY=super-secret-key-67890
DEBUG=true`
  )
}

function cleanupTestProject() {
  if (fs.existsSync(testProjectDir)) {
    fs.rmSync(testProjectDir, { recursive: true, force: true })
  }
}

module.exports = {
  setupTestProject,
  cleanupTestProject,
  testProjectDir
}
