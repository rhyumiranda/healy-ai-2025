import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../page'

jest.mock('@/src/modules/common', () => ({
	AppHeader: ({ variant, showBackButton }: { variant: string; showBackButton: boolean }) => (
		<div data-testid="app-header" data-variant={variant} data-show-back-button={showBackButton}>
			App Header
		</div>
	),
}))

jest.mock('@/src/modules/auth/components/registration-wizard', () => ({
	RegistrationWizard: ({ onSubmit }: { onSubmit: (data: any) => Promise<void> }) => (
		<div data-testid="registration-wizard">
			<button
				onClick={() =>
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
			>
				Submit Registration
			</button>
		</div>
	),
}))

jest.mock('next/link', () => {
	return ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	)
})

describe('RegisterPage', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('Page Rendering', () => {
		it('should render the registration page with all main elements', () => {
			render(<RegisterPage />)

			expect(screen.getByTestId('app-header')).toBeInTheDocument()
			expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument()
			expect(screen.getByText(/enter your details to get started with medassist ai/i)).toBeInTheDocument()
		})

		it('should render the AppHeader with correct props', () => {
			render(<RegisterPage />)

			const header = screen.getByTestId('app-header')
			expect(header).toHaveAttribute('data-variant', 'auth')
			expect(header).toHaveAttribute('data-show-back-button', 'true')
		})

		it('should render the RegistrationWizard component', () => {
			render(<RegisterPage />)

			expect(screen.getByTestId('registration-wizard')).toBeInTheDocument()
		})
	})

	describe('Benefits Section', () => {
		it('should display the benefits card', () => {
			render(<RegisterPage />)

			expect(screen.getByText(/what you get/i)).toBeInTheDocument()
			expect(screen.getByText(/benefits of medassist ai/i)).toBeInTheDocument()
		})

		it('should list all key benefits', () => {
			render(<RegisterPage />)

			expect(screen.getByText(/ai-powered treatment recommendations/i)).toBeInTheDocument()
			expect(screen.getByText(/drug interaction warnings/i)).toBeInTheDocument()
			expect(screen.getByText(/risk assessment tools/i)).toBeInTheDocument()
			expect(screen.getByText(/secure patient management/i)).toBeInTheDocument()
		})

		it('should render CheckCircle2 icons for each benefit', () => {
			const { container } = render(<RegisterPage />)

			const checkIcons = container.querySelectorAll('.lucide-check-circle-2')
			expect(checkIcons.length).toBeGreaterThan(0)
		})
	})

	describe('Navigation Links', () => {
		it('should render link to login page', () => {
			render(<RegisterPage />)

			const signInLink = screen.getByRole('link', { name: /sign in/i })
			expect(signInLink).toBeInTheDocument()
			expect(signInLink).toHaveAttribute('href', '/auth/login')
		})

		it('should render link to terms of service', () => {
			render(<RegisterPage />)

			const termsLinks = screen.getAllByRole('link', { name: /terms of service/i })
			expect(termsLinks[0]).toBeInTheDocument()
			expect(termsLinks[0]).toHaveAttribute('href', '/terms')
		})

		it('should render link to privacy policy', () => {
			render(<RegisterPage />)

			const privacyLinks = screen.getAllByRole('link', { name: /privacy policy/i })
			expect(privacyLinks[0]).toBeInTheDocument()
			expect(privacyLinks[0]).toHaveAttribute('href', '/privacy')
		})
	})

	describe('Form Submission', () => {
		it('should handle registration submission', async () => {
			const user = userEvent.setup()
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

			render(<RegisterPage />)

			const submitButton = screen.getByRole('button', { name: /submit registration/i })
			await user.click(submitButton)

			expect(consoleSpy).toHaveBeenCalledWith('Registration data:', {
				fullName: 'Dr. John Doe',
				email: 'john@example.com',
				password: 'SecurePass123!',
				confirmPassword: 'SecurePass123!',
				medicalLicenseNumber: 'ML123456',
				specialty: 'Cardiology',
				phoneNumber: '+1234567890',
				acceptTerms: true,
			})

			consoleSpy.mockRestore()
		})

		it('should log success message after registration', async () => {
			const user = userEvent.setup()
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

			render(<RegisterPage />)

			const submitButton = screen.getByRole('button', { name: /submit registration/i })
			await user.click(submitButton)

			await new Promise((resolve) => setTimeout(resolve, 2100))

			expect(consoleSpy).toHaveBeenCalledWith('Registration submitted successfully')

			consoleSpy.mockRestore()
		})
	})

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', () => {
			const { container } = render(<RegisterPage />)

			const h1 = container.querySelector('h1')
			expect(h1).toHaveTextContent(/create an account/i)

			const h3 = container.querySelector('h3')
			expect(h3).toHaveTextContent(/what you get/i)
		})

		it('should use semantic HTML for benefits list', () => {
			const { container } = render(<RegisterPage />)

			const list = container.querySelector('ul')
			expect(list).toBeInTheDocument()

			const listItems = container.querySelectorAll('li')
			expect(listItems.length).toBe(4)
		})
	})

	describe('Responsive Layout', () => {
		it('should apply proper layout classes', () => {
			const { container } = render(<RegisterPage />)

			const mainContainer = container.querySelector('.flex.min-h-screen.flex-col')
			expect(mainContainer).toBeInTheDocument()

			const centerContainer = container.querySelector('.flex.flex-1.items-center.justify-center')
			expect(centerContainer).toBeInTheDocument()
		})

		it('should constrain form width appropriately', () => {
			const { container } = render(<RegisterPage />)

			const formContainer = container.querySelector('.max-w-lg')
			expect(formContainer).toBeInTheDocument()
		})
	})

	describe('Visual Elements', () => {
		it('should render dashed border card for benefits', () => {
			const { container } = render(<RegisterPage />)

			const dashedCard = container.querySelector('.border-dashed')
			expect(dashedCard).toBeInTheDocument()
		})

		it('should have proper spacing between sections', () => {
			const { container } = render(<RegisterPage />)

			const spacedDiv = container.querySelector('.space-y-6')
			expect(spacedDiv).toBeInTheDocument()
		})
	})

	describe('Content Accuracy', () => {
		it('should display correct page title', () => {
			render(<RegisterPage />)

			expect(screen.getByRole('heading', { level: 1, name: /create an account/i })).toBeInTheDocument()
		})

		it('should display correct page description', () => {
			render(<RegisterPage />)

			expect(screen.getByText(/enter your details to get started with medassist ai/i)).toBeInTheDocument()
		})

		it('should display correct benefits section title', () => {
			render(<RegisterPage />)

			expect(screen.getByText(/what you get/i)).toBeInTheDocument()
			expect(screen.getByText(/benefits of medassist ai/i)).toBeInTheDocument()
		})
	})
})
