const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Use babel-jest for transformation
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }],
  },
  
  // 🔑 KEY: Use ts-jest to automatically map TypeScript paths
  modulePaths: [compilerOptions.baseUrl || '.'],
  moduleNameMapper: {
    // Static assets first
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    
    // 🎯 SOLUTION: Auto-generate from tsconfig.json paths
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Module paths
  roots: ['<rootDir>'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  
  // Test patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // Coverage
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  
  // Environment setup
  testEnvironmentOptions: {
    customExportConditions: [],
  },
}

module.exports = config