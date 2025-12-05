/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module '@jest/globals' {
	interface Matchers<R = void, T = unknown>
		extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}
