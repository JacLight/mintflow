export default {
  preset: 'ts-jest',
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
  // You can keep the transformIgnorePatterns as is if there are no issues with other modules.
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mintflow/common)'],
  testMatch: ['**/test/**/*.test.ts'],
};
