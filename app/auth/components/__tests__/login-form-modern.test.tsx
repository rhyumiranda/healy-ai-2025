import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginFormModern } from '../login-form-modern'
import type { LoginFormData } from '../../types'

jest.mock('next/link', () => {
	const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	)
	MockLink.displayName = 'MockLink'
	return MockLink
})

describe('LoginFormModern', () => {
	const mockOnSubmit = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
		mockOnSubmit.mockResolvedValue(undefined)
	})

	describe('Form Rendering', () => {
		it('should render all form fields', () => {
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
			expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
			expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
		})

		it('should render forgot password link', () => {
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i })
			expect(forgotPasswordLink).toBeInTheDocument()
			expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
		})

		it('should have proper input attributes', () => {
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)

			expect(emailInput).toHaveAttribute('type', 'email')
			expect(emailInput).toHaveAttribute('placeholder', 'name@example.com')
			expect(emailInput).toHaveAttribute('autocomplete', 'email')

			expect(passwordInput).toHaveAttribute('type', 'password')
			expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
			expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
		})
	})

	describe('Password Visibility Toggle', () => {
		it('should toggle password visibility when eye icon is clicked', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const passwordInput = screen.getByLabelText(/^password$/i)
			expect(passwordInput).toHaveAttribute('type', 'password')

			const toggleButton = screen.getByRole('button', { name: '' })
			await user.click(toggleButton)

			expect(passwordInput).toHaveAttribute('type', 'text')

			await user.click(toggleButton)
			expect(passwordInput).toHaveAttribute('type', 'password')
		})
	})

	describe('Form Validation', () => {
		it('should show error when email is empty', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
			expect(mockOnSubmit).not.toHaveBeenCalled()
		})

		it('should show error when email format is invalid', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			await user.type(emailInput, 'invalid-email')

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
			expect(mockOnSubmit).not.toHaveBeenCalled()
		})

		it('should show error when password is empty', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			await user.type(emailInput, 'test@example.com')

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
			expect(mockOnSubmit).not.toHaveBeenCalled()
		})

		it('should show error when password is too short', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'short')

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument()
			expect(mockOnSubmit).not.toHaveBeenCalled()
		})

		it('should clear errors when user corrects input', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const submitButton = screen.getByRole('button', { name: /sign in/i })

			await user.click(submitButton)

			expect(await screen.findByText(/email is required/i)).toBeInTheDocument()

			await user.type(emailInput, 'test@example.com')

			await waitFor(() => {
				expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
			})
		})
	})

	describe('Form Submission', () => {
		it('should submit form with valid data', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					email: 'test@example.com',
					password: 'password123',
					rememberMe: false,
				})
			})
		})

		it('should submit form with rememberMe checked', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)
			const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			await user.click(rememberMeCheckbox)

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					email: 'test@example.com',
					password: 'password123',
					rememberMe: true,
				})
			})
		})

		it('should disable form during submission', async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)
			const submitButton = screen.getByRole('button', { name: /sign in/i })

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			await user.click(submitButton)

			expect(submitButton).toBeDisabled()
			expect(emailInput).toBeDisabled()
			expect(passwordInput).toBeDisabled()
			expect(screen.getByText(/signing in/i)).toBeInTheDocument()

			await waitFor(() => {
				expect(submitButton).not.toBeDisabled()
			})
		})

		it('should handle submission errors', async () => {
			const user = userEvent.setup()
			const errorMessage = 'Invalid credentials'
			mockOnSubmit.mockRejectedValue(new Error(errorMessage))

			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(errorMessage)).toBeInTheDocument()
			})

			expect(screen.getByRole('alert')).toBeInTheDocument()
		})

		it('should handle unknown submission errors', async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockRejectedValue('Unknown error')

			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')

			const submitButton = screen.getByRole('button', { name: /sign in/i })
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/login failed. please try again./i)).toBeInTheDocument()
			})
		})
	})

	describe('Accessibility', () => {
		it('should have proper form labels', () => {
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'email')
			expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('id', 'password')
			expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'rememberMe')
		})

		it('should display error alert with proper role', async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockRejectedValue(new Error('Test error'))

			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i)
			const passwordInput = screen.getByLabelText(/^password$/i)

			await user.type(emailInput, 'test@example.com')
			await user.type(passwordInput, 'password123')
			await user.click(screen.getByRole('button', { name: /sign in/i }))

			await waitFor(() => {
				const alert = screen.getByRole('alert')
				expect(alert).toBeInTheDocument()
			})
		})

		it('should have noValidate attribute on form', () => {
			const { container } = render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const form = container.querySelector('form')
			expect(form).toHaveAttribute('noValidate')
		})
	})

	describe('User Interactions', () => {
		it('should update email field value on input', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
			await user.type(emailInput, 'test@example.com')

			expect(emailInput.value).toBe('test@example.com')
		})

		it('should update password field value on input', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
			await user.type(passwordInput, 'password123')

			expect(passwordInput.value).toBe('password123')
		})

		it('should toggle remember me checkbox', async () => {
			const user = userEvent.setup()
			render(<LoginFormModern onSubmit={mockOnSubmit} />)

			const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
			expect(checkbox).not.toBeChecked()

			await user.click(checkbox)
			expect(checkbox).toBeChecked()

			await user.click(checkbox)
			expect(checkbox).not.toBeChecked()
		})
	})
})
