const nextJest = require('next/jest')

const createJestConfig = nextJest({
	dir: './',
})

const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	testEnvironment: 'jest-environment-jsdom',

	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},

	collectCoverageFrom: [
		'app/**/*.{js,jsx,ts,tsx}',
		'src/**/*.{js,jsx,ts,tsx}',
		'components/**/*.{js,jsx,ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/.next/**',
		'!**/coverage/**',
		'!**/jest.config.js',
	],

	testMatch: [
		'**/__tests__/**/*.[jt]s?(x)',
		'**/?(*.)+(spec|test).[jt]s?(x)',
	],

	testPathIgnorePatterns: ['/node_modules/', '/.next/'],
	transformIgnorePatterns: [
		'/node_modules/',
		'^.+\\.module\\.(css|sass|scss)$',
	],
}

module.exports = createJestConfig(customJestConfig)
