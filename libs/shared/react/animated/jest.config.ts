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
   * Enable `@testing-library/jest-dom` matchers.
   * Also see related include in `tsconfig.spec.json`.
   *
   * Reminder: `setupTests.ts` was added to `tsconfig.lib.json` "excludes" list alongside the already-present
   * `jest.config.ts` to resolve a blocking build issue re paths.
   *
   * @see {@link https://jestjs.io/docs/configuration#setupfilesafterenv-array}
   */
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
}
