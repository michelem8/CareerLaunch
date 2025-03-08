import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Sets up automatic cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://careerpathfinder.io',
    host: 'careerpathfinder.io',
    hostname: 'careerpathfinder.io',
    href: 'https://careerpathfinder.io',
    pathname: '/',
    protocol: 'https:',
  },
  writable: true,
});

// Mock console methods to not pollute test output
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn(); 