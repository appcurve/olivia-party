/* eslint-disable */
export default {
  displayName: 'shared-react-animated',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/shared/react/animated',

  /**
   * Add mocks for IntersectionObserver and add jest matchers from @testing-library/jest-dom.
   *
   * @see {@link https://jestjs.io/docs/configuration#setupfilesafterenv-array}
   * @see tsconfig.spec.json
   */
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
}
