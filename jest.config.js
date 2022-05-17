/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./config/jest-setup-files.js'],
  testEnvironment: 'node',
};
