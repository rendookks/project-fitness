module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/domain/**/*.ts', 'src/storage/**/*.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
};
