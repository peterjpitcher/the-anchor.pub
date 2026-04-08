const nextJest = require('next/jest')

// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/*.stories.tsx',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// We wrap it to override transformIgnorePatterns after next/jest sets defaults
module.exports = async () => {
  const jestConfig = await createJestConfig(customJestConfig)()
  return {
    ...jestConfig,
    transformIgnorePatterns: [
      '/node_modules/(?!@marsidev/react-turnstile/).+\\.js$',
    ],
  }
}