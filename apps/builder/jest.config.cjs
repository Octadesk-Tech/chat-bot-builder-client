// Unit test config for builder helpers (added for CHAT-1630 fix — repo had only Playwright E2E).
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^models$': '<rootDir>/helpers/__models-enums.testbarrel.ts',
    '^utils$': '<rootDir>/../../packages/utils/src/utils.ts',
  },
  testMatch: ['<rootDir>/**/*.unit.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
  globals: {
    'ts-jest': { isolatedModules: true, diagnostics: false },
  },
}
