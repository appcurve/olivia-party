/**
 * Enable `@testing-library/jest-dom` matchers including `toBeInTheDocument()`.
 * Refer to `jest.config.ts` and `tsconfig.spec.json` for complete configuration.
 */
import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'

/**
 * Mock of matchMedia.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated method
    removeListener: jest.fn(), // deprecated method
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

/**
 * Mock of getBoundingClientRect.
 */
Element.prototype.getBoundingClientRect = jest.fn(() => {
  return {
    width: 300,
    height: 120,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    toJSON: (): string => '{}',
  }
})
