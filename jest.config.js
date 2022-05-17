/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  preset: 'ts-jest',
  setupFiles: ['./config/jest-setup-files.js'],
  testEnvironment: 'node',
};
