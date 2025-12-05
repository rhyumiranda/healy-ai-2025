import '@testing-library/jest-dom'

// Mock ResizeObserver (used by Radix UI components)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}))

// Mock matchMedia (used by responsive components)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
})

// Mock AppHeader component for tests
jest.mock('@/components/common', () => {
	const React = require('react')
	const MockAppHeader = ({ variant, showBackButton }) => {
		return React.createElement('div', {
			'data-testid': 'app-header',
			'data-variant': variant,
			'data-show-back-button': String(showBackButton),
		}, 'App Header')
	}
	MockAppHeader.displayName = 'MockAppHeader'
	return {
		AppHeader: MockAppHeader,
	}
})

// Mock RegistrationWizard component for tests
jest.mock('@/components/auth/registration-wizard', () => {
	const React = require('react')
	const MockRegistrationWizard = ({ onSubmit }) => {
		const handleClick = () => {
			if (onSubmit && typeof onSubmit === 'function') {
				onSubmit({
					fullName: 'Dr. John Doe',
					email: 'john@example.com',
					password: 'SecurePass123!',
					confirmPassword: 'SecurePass123!',
					medicalLicenseNumber: 'ML123456',
					specialty: 'Cardiology',
					phoneNumber: '+1234567890',
					acceptTerms: true,
				})
			}
		}
		return React.createElement('div', {
			'data-testid': 'registration-wizard',
		}, React.createElement('button', {
			onClick: handleClick,
			type: 'button',
		}, 'Submit Registration'))
	}
	MockRegistrationWizard.displayName = 'MockRegistrationWizard'
	return {
		RegistrationWizard: MockRegistrationWizard,
	}
})

// Mock fetch API for next-auth
global.fetch = jest.fn()

// Mock next-auth
jest.mock('next-auth/react', () => ({
	SessionProvider: ({ children }) => children,
	useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
	signIn: jest.fn().mockResolvedValue({
		error: null,
		ok: true,
		status: 200,
		url: null,
	}),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			pathname: '/',
			query: {},
			asPath: '/',
		}
	},
	usePathname() {
		return '/'
	},
	useSearchParams() {
		return new URLSearchParams()
	},
}))
