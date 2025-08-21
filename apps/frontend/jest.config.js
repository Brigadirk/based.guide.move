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
  
  // Very explicit module name mapping - CI seems to have issues with regex groups
  moduleNameMapper: {
    // Static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Explicit mappings for common paths that we know exist
    '^@/lib/hooks/use-currencies$': '<rootDir>/lib/hooks/use-currencies.ts',
    '^@/lib/hooks/use-alternative-interests$': '<rootDir>/lib/hooks/use-alternative-interests.ts',
    '^@/lib/hooks/use-auto-save$': '<rootDir>/lib/hooks/use-auto-save.ts',
    '^@/lib/hooks/use-hydrated-store$': '<rootDir>/lib/hooks/use-hydrated-store.ts',
    '^@/lib/hooks/use-section-info$': '<rootDir>/lib/hooks/use-section-info.ts',
    '^@/data/country_info.json$': '<rootDir>/data/country_info.json',
    '^@/data/eu-countries.json$': '<rootDir>/data/eu-countries.json',
    
    // Fallback patterns - these should work after explicit mappings
    '^@/lib/(.+)$': '<rootDir>/lib/$1',
    '^@/components/(.+)$': '<rootDir>/components/$1',
    '^@/app/(.+)$': '<rootDir>/app/$1',
    '^@/types/(.+)$': '<rootDir>/types/$1',
    '^@/data/(.+)$': '<rootDir>/data/$1',
    
    // Final catch-all
    '^@/(.+)$': '<rootDir>/$1',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Module paths
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  
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