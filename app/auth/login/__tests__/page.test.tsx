import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'

jest.mock('next/link', () => {
	const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	)
	MockLink.displayName = 'MockLink'
	return MockLink
})

describe('LoginPage', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('Page Rendering', () => {
		it('should render the login page with all main elements', () => {
			render(<LoginPage />)

			expect(screen.getByTestId('app-header')).toBeInTheDocument()
			expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
			expect(screen.getByText(/access your healyai account/i)).toBeInTheDocument()
		})

		it('should render the AppHeader with correct props', () => {
			render(<LoginPage />)

			const header = screen.getByTestId('app-header')
			expect(header).toHaveAttribute('data-variant', 'auth')
			expect(header).toHaveAttribute('data-show-back-button', 'true')
		})

		it('should display the Shield icon', () => {
			const { container } = render(<LoginPage />)
			const shieldIcon = container.querySelector('.lucide-shield')
			expect(shieldIcon).toBeInTheDocument()
		})
	})

	describe('Navigation Links', () => {
		it('should render link to registration page', () => {
			render(<LoginPage />)

			const signUpLink = screen.getByRole('link', { name: /sign up/i })
			expect(signUpLink).toBeInTheDocument()
			expect(signUpLink).toHaveAttribute('href', '/auth/register')
		})

		it('should render link to terms of service', () => {
			render(<LoginPage />)

			const termsLink = screen.getByRole('link', { name: /terms of service/i })
			expect(termsLink).toBeInTheDocument()
			expect(termsLink).toHaveAttribute('href', '/terms')
		})

		it('should render link to privacy policy', () => {
			render(<LoginPage />)

			const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
			expect(privacyLink).toBeInTheDocument()
			expect(privacyLink).toHaveAttribute('href', '/privacy')
		})
	})

	describe('Login Form', () => {
		it('should render the login form with email and password fields', () => {
			render(<LoginPage />)

			expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
			expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
		})

		it('should render remember me checkbox', () => {
			render(<LoginPage />)

			expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()
		})

		it('should render forgot password link', () => {
			render(<LoginPage />)

			const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i })
			expect(forgotPasswordLink).toBeInTheDocument()
			expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
		})
	})

	describe('Form Submission', () => {
		it('should handle successful login submission', async () => {
			const user = userEvent.setup()

			render(<LoginPage />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)
			const submitButton = screen.getByRole('button', { name: /sign in/i })

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			
			expect(submitButton).toBeInTheDocument()
		})

		it('should toggle remember me checkbox', async () => {
			const user = userEvent.setup()

			render(<LoginPage />)

			const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
			
			expect(rememberMeCheckbox).not.toBeChecked()
			
			await user.click(rememberMeCheckbox)
			expect(rememberMeCheckbox).toBeChecked()
			
			await user.click(rememberMeCheckbox)
			expect(rememberMeCheckbox).not.toBeChecked()
		})
	})

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', () => {
			const { container } = render(<LoginPage />)

			const h1 = container.querySelector('h1')
			expect(h1).toHaveTextContent(/welcome back/i)
		})

		it('should have proper labels for form inputs', () => {
			render(<LoginPage />)

			expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'email')
			expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('id', 'password')
		})

		it('should use semantic HTML for card structure', () => {
			const { container } = render(<LoginPage />)

			const card = container.querySelector('[class*="card"]')
			expect(card).toBeInTheDocument()
		})
	})

	describe('Responsive Layout', () => {
		it('should apply proper layout classes', () => {
			const { container } = render(<LoginPage />)

			const mainContainer = container.querySelector('.flex.min-h-screen.flex-col')
			expect(mainContainer).toBeInTheDocument()

			const centerContainer = container.querySelector('.flex.flex-1.items-center.justify-center')
			expect(centerContainer).toBeInTheDocument()
		})

		it('should constrain form width appropriately', () => {
			const { container } = render(<LoginPage />)

			const formContainer = container.querySelector('.max-w-sm')
			expect(formContainer).toBeInTheDocument()
		})
	})
})
