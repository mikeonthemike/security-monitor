# Universal Security Monitor

A configurable security monitoring script for any Node.js project. This tool performs automated security checks including dependency vulnerability scanning, environment variable validation, API security checks, and more.

## Features

- 🔍 **Dependency Vulnerability Scanning** - Automatically scan for known vulnerabilities in your dependencies
- 🔐 **Environment Variable Security** - Validate required environment variables and check for insecure patterns
- 🛡️ **Security Headers Validation** - Check for proper security headers configuration
- 🔒 **API Security Checks** - Scan API endpoints for authentication and validation middleware
- 🗄️ **Database Security** - Validate database configuration for security best practices
- 📊 **Detailed Reporting** - Generate comprehensive security reports with recommendations
- ⚙️ **Fully Configurable** - Customize all checks and thresholds via JSON configuration
- 🏗️ **Modular Architecture** - Clean, maintainable code structure with separate modules for each check type

## Installation

### Option 1: Direct Download
```bash
# Download the main files
curl -O https://raw.githubusercontent.com/mikeonthemike/security-monitor/main/index.js
curl -O https://raw.githubusercontent.com/mikeonthemike/security-monitor/main/security-monitor.config.json
# Download the src directory for the modular code
```

### Option 2: Clone Repository
```bash
git clone https://github.com/mikeonthemike/security-monitor.git
cd security-monitor
```

### Option 3: NPM Package (FUTURE!)
```bash
npm install -g security-monitor
```

## Quick Start

1. **Copy the configuration file:**
   ```bash
   cp security-monitor.config.json my-project.config.json
   ```

2. **Customize the configuration** for your project (see Configuration section below)

3. **Run the security monitor:**
   ```bash
   node index.js my-project.config.json
   ```

4. **View the results** in the generated `security-report.json` file

## Configuration

The security monitor is configured via a JSON file. Here's the structure:

### Basic Configuration Structure

```json
{
  "project": {
    "name": "Your Project Name",
    "description": "Project description",
    "version": "1.0.0"
  },
  "packageManager": "npm",
  "checks": {
    "dependencyAudit": { ... },
    "environmentVariables": { ... },
    "securityHeaders": { ... },
    "apiSecurity": { ... },
    "databaseSecurity": { ... }
  },
  "output": {
    "reportFile": "security-report.json",
    "logLevel": "info",
    "includeRecommendations": true
  }
}
```

### Check Configurations

#### Dependency Audit
```json
{
  "dependencyAudit": {
    "enabled": true,
    "command": "audit --json",
    "severityThresholds": {
      "critical": 0,
      "high": 0,
      "moderate": 5,
      "low": 10
    }
  }
}
```

#### Environment Variables
```json
{
  "environmentVariables": {
    "enabled": true,
    "required": ["DATABASE_URL", "API_KEY", "SECRET_KEY"],
    "optional": ["DEBUG", "LOG_LEVEL"],
    "minLength": 10,
    "patterns": {
      "insecure": ["password", "secret", "key"]
    }
  }
}
```

#### Security Headers
```json
{
  "securityHeaders": {
    "enabled": true,
    "configFile": "next.config.js",
    "required": [
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Strict-Transport-Security",
      "Content-Security-Policy"
    ]
  }
}
```

#### API Security
```json
{
  "apiSecurity": {
    "enabled": true,
    "apiDirectory": "pages/api",
    "filePatterns": ["*.ts", "*.js"],
    "authMiddleware": ["withAuth", "getServerSession"],
    "validationMiddleware": ["zod", "joi"]
  }
}
```

#### Database Security
```json
{
  "databaseSecurity": {
    "enabled": true,
    "configFile": "lib/database.ts",
    "checks": ["sslValidation", "connectionLimits", "timeouts"]
  }
}
```

## Example Configurations

We provide example configurations for different project types:

- **Next.js**: `examples/nextjs.config.json`
- **Express.js**: `examples/express.config.json`
- **Minimal**: `examples/minimal.config.json`

To use an example configuration:

```bash
# Copy the example configuration
cp examples/nextjs.config.json my-project.config.json

# Run with the example configuration
node security-monitor.js my-project.config.json
```

## Usage

### Basic Usage
```bash
# Run with default configuration
node index.js

# Run with custom configuration
node index.js my-custom.config.json
```

### Package Manager Support

The script supports different package managers:

- **npm**: `"packageManager": "npm"`
- **yarn**: `"packageManager": "yarn"`
- **pnpm**: `"packageManager": "pnpm"`

### Disabling Checks

You can disable any check by setting `"enabled": false`:

```json
{
  "checks": {
    "databaseSecurity": {
      "enabled": false
    }
  }
}
```

## Output

The security monitor generates:

1. **Console Output**: Real-time status updates and summary
2. **JSON Report**: Detailed results saved to `security-report.json` (or custom filename)

### Report Structure

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "project": {
    "name": "Your Project",
    "description": "Project description",
    "version": "1.0.0"
  },
  "checks": {
    "dependencyAudit": {
      "status": "pass",
      "vulnerabilities": 0,
      "critical": 0,
      "high": 0,
      "moderate": 0,
      "low": 0
    }
  },
  "vulnerabilities": [],
  "warnings": [],
  "recommendations": []
}
```

## Integration

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Security Audit
  run: |
    node security-monitor.js my-project.config.json
    if [ $? -ne 0 ]; then
      echo "Security audit failed"
      exit 1
    fi
```

### Pre-commit Hook

Add to your `package.json`:

```json
{
  "scripts": {
    "precommit": "node security-monitor.js"
  }
}
```

### Scheduled Monitoring

Set up a cron job for regular security monitoring:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project && node index.js
```

## Architecture

The security monitor uses a modular architecture for better maintainability and extensibility:

```
src/
├── SecurityMonitor.js      # Main orchestrator class
├── ConfigLoader.js         # Configuration loading and validation
├── ReportGenerator.js      # Report generation and output
└── checks/
    ├── BaseCheck.js        # Base class for all security checks
    ├── DependencyAudit.js  # Dependency vulnerability scanning
    ├── EnvironmentVariables.js # Environment variable validation
    ├── SecurityHeaders.js  # Security headers validation
    ├── ApiSecurity.js      # API endpoint security checks
    └── DatabaseSecurity.js # Database security validation
```

### Benefits of Modular Structure

- **Maintainability**: Each check is isolated and can be modified independently
- **Testability**: Individual modules can be unit tested
- **Extensibility**: Easy to add new security checks
- **Reusability**: Check modules can be reused in other projects
- **Separation of Concerns**: Clear separation between different responsibilities

## Customization

### Adding Custom Checks

To add custom security checks, create a new module in `src/checks/`:

```javascript
const BaseCheck = require('./BaseCheck')

class CustomCheck extends BaseCheck {
  async run() {
    if (!this.config.checks.customCheck?.enabled) {
      this.log('Custom check disabled in configuration')
      return
    }

    this.log('Running custom security check...')
    
    // Your custom check logic here
    this.results.checks.customCheck = {
      status: 'pass',
      // ... other results
    }
  }
}

module.exports = CustomCheck
```

Then add it to the `SecurityMonitor` constructor in `src/SecurityMonitor.js`:

```javascript
const CustomCheck = require('./checks/CustomCheck')

// In constructor:
this.checks = {
  // ... existing checks
  customCheck: new CustomCheck(this.config, this.results)
}
```

### Custom File Patterns

You can customize which files are checked for API security:

```json
{
  "apiSecurity": {
    "filePatterns": ["*.ts", "*.js", "*.mjs"],
    "apiDirectory": "src/api"
  }
}
```

## Troubleshooting

### Common Issues

1. **Configuration file not found**
   - Ensure the configuration file exists and is readable
   - Check the file path is correct

2. **Package manager command failed**
   - Verify the package manager is installed
   - Check if `package.json` exists in the project directory

3. **Permission denied**
   - Ensure the script has read permissions for project files
   - Check write permissions for the output directory

### Debug Mode

Enable verbose logging by setting the log level:

```json
{
  "output": {
    "logLevel": "debug"
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Testing

The project includes comprehensive tests to ensure reliability and maintainability.

### Quick Test
Run a quick smoke test to verify everything works:

```bash
node test-quick.js
```

### Full Test Suite
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Run with coverage
npm run test:coverage

# Run security audit on the project itself
npm run test:self-audit
```

### Test Structure
- **Unit Tests**: Test individual modules in isolation
- **Integration Tests**: Test module interactions with real file system
- **End-to-End Tests**: Test complete CLI workflows
- **Custom Test Runner**: Additional testing utilities

See [TESTING.md](TESTING.md) for detailed testing documentation.

## Support

- Create an issue for bug reports or feature requests
- Check the examples directory for configuration templates
- Review the troubleshooting section for common issues
- See TESTING.md for testing guidance
