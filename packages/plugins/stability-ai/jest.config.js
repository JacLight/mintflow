export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.test.json'
      }
    ],
  },
  moduleNameMapper: {
    '^@mintflow/common$': '<rootDir>/../../common/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // Transform ESM modules
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mintflow/common)'],
  testMatch: ['**/test/**/*.test.ts'],
};
