import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Setup for React Testing Library
afterEach(() => {
  cleanup()
})

// Global test environment setup
beforeAll(() => {
  // Mock environment variables
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  // Clean up after all tests
})