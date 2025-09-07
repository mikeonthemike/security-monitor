# Security Monitor - Source Code

This directory contains the modular source code for the Universal Security Monitor.

## Structure

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

## Architecture

### Core Components

- **SecurityMonitor**: Main orchestrator that manages the overall security audit process
- **ConfigLoader**: Handles loading and validating configuration files
- **ReportGenerator**: Generates reports and recommendations

### Security Checks

All security checks extend the `BaseCheck` class and implement the `run()` method:

- **DependencyAudit**: Scans for vulnerable dependencies using package manager audit commands
- **EnvironmentVariables**: Validates environment variables for security best practices
- **SecurityHeaders**: Checks configuration files for required security headers
- **ApiSecurity**: Scans API endpoints for authentication and validation middleware
- **DatabaseSecurity**: Validates database configuration for security settings

### Adding New Checks

To add a new security check:

1. Create a new file in `src/checks/`
2. Extend the `BaseCheck` class
3. Implement the `run()` method
4. Add the check to the `SecurityMonitor` constructor
5. Update the configuration schema if needed

Example:

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

## Benefits of Modular Structure

1. **Maintainability**: Each check is isolated and can be modified independently
2. **Testability**: Individual modules can be unit tested
3. **Extensibility**: Easy to add new security checks
4. **Reusability**: Check modules can be reused in other projects
5. **Separation of Concerns**: Clear separation between different responsibilities
