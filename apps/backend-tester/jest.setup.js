// Jest setup file
import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn()

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
}

// Setup default fetch responses
beforeEach(() => {
  fetch.mockClear()
})
