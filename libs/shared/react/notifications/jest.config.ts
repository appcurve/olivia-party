/* eslint-disable */
export default {
  displayName: 'shared-react-notifications',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/shared/react/notifications',

  /**
   * Enable `@testing-library/jest-dom` matchers.
   * Also see related include in `tsconfig.spec.json`.
   *
   * @see {@link https://jestjs.io/docs/configuration#setupfilesafterenv-array}
   */
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
}