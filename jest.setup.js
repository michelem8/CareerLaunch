// Set a longer timeout for tests since API tests can take longer
jest.setTimeout(30000);

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-key';
process.env.RAPID_API_KEY = 'test-key';

// Mock console methods to reduce noise in test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Silence console output during tests to reduce noise
// Comment these out if you need to debug tests
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

// Reset console methods after tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}); 