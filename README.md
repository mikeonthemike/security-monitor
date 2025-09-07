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

## Installation

### Option 1: Direct Download
```bash
# Download the script and configuration file
curl -O https://raw.githubusercontent.com/your-username/universal-security-monitor/main/security-monitor.js
curl -O https://raw.githubusercontent.com/your-username/universal-security-monitor/main/security-monitor.config.json
```

### Option 2: Clone Repository
```bash
git clone https://github.com/your-username/universal-security-monitor.git
cd universal-security-monitor
```

### Option 3: NPM Package (if published)
```bash
npm install -g universal-security-monitor
```

## Quick Start

1. **Copy the configuration file:**
   ```bash
   cp security-monitor.config.json my-project.config.json
   ```

2. **Customize the configuration** for your project (see Configuration section below)

3. **Run the security monitor:**
   ```bash
   node security-monitor.js my-project.config.json
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
node security-monitor.js

# Run with custom configuration
node security-monitor.js my-custom.config.json
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
0 2 * * * cd /path/to/project && node security-monitor.js
```

## Customization

### Adding Custom Checks

To add custom security checks, extend the `SecurityMonitor` class:

```javascript
class CustomSecurityMonitor extends SecurityMonitor {
  async checkCustomSecurity() {
    // Your custom security check logic
  }
  
  async run() {
    await super.run()
    await this.checkCustomSecurity()
  }
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

## Support

- Create an issue for bug reports or feature requests
- Check the examples directory for configuration templates
- Review the troubleshooting section for common issues
