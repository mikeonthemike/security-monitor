# Testing Guide

This document explains how to test the Universal Security Monitor project.

## Test Structure

```
test/
├── setup.js                    # Test utilities and fixtures
├── config/
│   └── test.config.json        # Test configuration
├── unit/                       # Unit tests
│   ├── ConfigLoader.test.js
│   └── checks/
│       ├── EnvironmentVariables.test.js
│       ├── SecurityHeaders.test.js
│       └── ApiSecurity.test.js
├── integration/                # Integration tests
│   └── SecurityMonitor.test.js
├── end-to-end/                 # End-to-end tests
│   └── cli.test.js
└── scripts/
    └── test-runner.js          # Custom test runner
```

## Test Types

### 1. Unit Tests
Test individual modules in isolation with mocked dependencies.

**Run unit tests:**
```bash
npm run test:unit
```

**What they test:**
- Configuration loading and validation
- Individual security check logic
- Error handling
- Edge cases

### 2. Integration Tests
Test how modules work together with real file system operations.

**Run integration tests:**
```bash
npm run test:integration
```

**What they test:**
- Complete security audit workflow
- File system interactions
- Report generation
- Configuration-driven behavior

### 3. End-to-End Tests
Test the CLI interface and complete user workflows.

**Run E2E tests:**
```bash
npm run test:e2e
```

**What they test:**
- CLI argument handling
- Complete audit execution
- Error scenarios
- Output validation

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Using the Custom Test Runner

```bash
# Run all tests
npm run test:runner

# Run specific test types
npm run test:runner unit
npm run test:runner integration
npm run test:runner e2e

# Generate test report
npm run test:runner report

# Run security audit on the project itself
npm run test:self-audit
```

## Test Configuration

### Jest Configuration
The project uses Jest for testing with the following configuration (`jest.config.js`):

- **Test Environment**: Node.js
- **Test Pattern**: `**/test/**/*.test.js`
- **Coverage**: Collected from `src/**/*.js`
- **Timeout**: 10 seconds
- **Setup**: Uses `test/setup.js` for test utilities

### Test Fixtures
The test setup creates a temporary project structure with:

- `package.json` with test dependencies
- API endpoints (protected and unprotected)
- Configuration files
- Environment variables
- Database configuration

## Writing Tests

### Unit Test Example

```javascript
const EnvironmentVariables = require('../../../src/checks/EnvironmentVariables')

describe('EnvironmentVariables', () => {
  let check
  let mockConfig
  let mockResults

  beforeEach(() => {
    mockConfig = {
      checks: {
        environmentVariables: {
          enabled: true,
          required: ['DATABASE_URL'],
          minLength: 5
        }
      }
    }
    mockResults = { checks: {}, warnings: [] }
    check = new EnvironmentVariables(mockConfig, mockResults)
  })

  test('should pass when required variables are present', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
    
    await check.run()
    
    expect(mockResults.checks.environmentVariables.status).toBe('pass')
  })
})
```

### Integration Test Example

```javascript
const SecurityMonitor = require('../../src/SecurityMonitor')
const { setupTestProject, cleanupTestProject } = require('../setup')

describe('SecurityMonitor Integration', () => {
  beforeAll(() => {
    setupTestProject()
  })

  afterAll(() => {
    cleanupTestProject()
  })

  test('should run complete security audit', async () => {
    const monitor = new SecurityMonitor('test/config/test.config.json')
    await monitor.run()
    
    expect(monitor.results.checks).toBeDefined()
  })
})
```

## Test Coverage

### Coverage Reports
Generate coverage reports to see which code is tested:

```bash
npm run test:coverage
```

This creates:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools
- Console output with coverage summary

### Coverage Goals
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hooks
Add tests to pre-commit hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit"
    }
  }
}
```

## Debugging Tests

### Debug Mode
Run tests with debug output:

```bash
DEBUG=* npm test
```

### Individual Test Files
Run specific test files:

```bash
npx jest test/unit/ConfigLoader.test.js
npx jest test/integration/SecurityMonitor.test.js
```

### Watch Mode
Run tests in watch mode for development:

```bash
npm run test:watch
```

## Test Data Management

### Fixtures
Test fixtures are created in `test/setup.js`:

- **Setup**: Creates temporary project structure
- **Cleanup**: Removes test files after tests
- **Isolation**: Each test runs in a clean environment

### Mocking
Use Jest mocks for external dependencies:

```javascript
// Mock file system
jest.mock('fs')

// Mock child process
jest.mock('child_process', () => ({
  execSync: jest.fn()
}))
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Don't rely on external services
5. **Test Edge Cases**: Include error scenarios and boundary conditions
6. **Keep Tests Fast**: Avoid slow operations in unit tests
7. **Maintain Test Data**: Keep test fixtures up to date

## Troubleshooting

### Common Issues

1. **Tests Failing**: Check if test fixtures are properly set up
2. **Timeout Errors**: Increase timeout in Jest config
3. **Mock Issues**: Ensure mocks are properly configured
4. **File System Errors**: Check file permissions and paths

### Getting Help

- Check Jest documentation: https://jestjs.io/docs/getting-started
- Review test examples in the `test/` directory
- Run tests with verbose output: `npm test -- --verbose`
