/**
 * Enable `@testing-library/jest-dom` matchers including `toBeInTheDocument()`.
 * Refer to `jest.config.ts` and `tsconfig.spec.json` for related configuration.
 */
import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'

/**
 * Mock of IntersectionObserver for testing.
 * For more elaborate testing see the `test-utils.ts` of the `react-intersection-observer` npm package on GitHub.
 *
 * @see {@link https://github.com/thebuilder/react-intersection-observer#testing}
 * @see {@link https://github.com/thebuilder/react-intersection-observer/blob/master/src/test-utils.ts}
 */
class IntersectionObserverMock {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})
