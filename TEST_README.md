# Testing Documentation

## Overview

This document provides comprehensive information about the test suite for the authentication pages (login and register) in the AI-Powered Treatment Plan Assistant application.

## Test Structure

```
app/auth/
├── login/
│   ├── __tests__/
│   │   └── page.test.tsx
│   └── page.tsx
├── register/
│   ├── __tests__/
│   │   └── page.test.tsx
│   └── page.tsx
└── components/
    ├── __tests__/
    │   └── login-form-modern.test.tsx
    └── login-form-modern.tsx
```

## Technology Stack

- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers

## Setup

### Installation

Install the required dependencies:

```bash
npm install
```

### Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Test Coverage

### Login Page Tests (`app/auth/login/__tests__/page.test.tsx`)

**Test Suites:**
1. **Page Rendering**
   - Renders all main elements
   - AppHeader with correct props
   - Shield icon display

2. **Navigation Links**
   - Registration page link
   - Terms of service link
   - Privacy policy link

3. **Login Form**
   - Email and password fields
   - Remember me checkbox
   - Forgot password link

4. **Form Submission**
   - Successful login submission
   - Remember me functionality
   - Form data validation

5. **Accessibility**
   - Heading hierarchy
   - Form labels
   - Semantic HTML

6. **Responsive Layout**
   - Layout classes
   - Form width constraints

**Total Tests**: 19

### Register Page Tests (`app/auth/register/__tests__/page.test.tsx`)

**Test Suites:**
1. **Page Rendering**
   - Main elements display
   - AppHeader configuration
   - RegistrationWizard component

2. **Benefits Section**
   - Benefits card display
   - Key benefits listing
   - CheckCircle2 icons

3. **Navigation Links**
   - Login page link
   - Terms and privacy links

4. **Form Submission**
   - Registration data handling
   - Success message logging

5. **Accessibility**
   - Heading hierarchy
   - Semantic HTML for lists

6. **Responsive Layout**
   - Layout classes
   - Form width constraints

7. **Visual Elements**
   - Dashed border card
   - Section spacing

8. **Content Accuracy**
   - Page title and description
   - Benefits section content

**Total Tests**: 22

### Login Form Component Tests (`app/auth/components/__tests__/login-form-modern.test.tsx`)

**Test Suites:**
1. **Form Rendering**
   - All form fields present
   - Forgot password link
   - Input attributes

2. **Password Visibility Toggle**
   - Toggle functionality
   - Input type changes

3. **Form Validation**
   - Empty email validation
   - Invalid email format
   - Empty password validation
   - Password length validation
   - Error clearing on correction

4. **Form Submission**
   - Valid data submission
   - Remember me functionality
   - Form disable during submission
   - Error handling
   - Unknown error handling

5. **Accessibility**
   - Form labels
   - Error alert roles
   - noValidate attribute

6. **User Interactions**
   - Email field updates
   - Password field updates
   - Checkbox toggling

**Total Tests**: 24

## Test Best Practices

### 1. Arrange-Act-Assert Pattern

All tests follow the AAA pattern:

```typescript
it('should submit form with valid data', async () => {
	const user = userEvent.setup()
	render(<LoginFormModern onSubmit={mockOnSubmit} />)

	await user.type(emailInput, 'test@example.com')
	await user.type(passwordInput, 'password123')
	await user.click(submitButton)

	await waitFor(() => {
		expect(mockOnSubmit).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123',
			rememberMe: false,
		})
	})
})
```

### 2. User-Centric Testing

Tests focus on user interactions rather than implementation details:
- Use `screen.getByRole()` and `screen.getByLabelText()`
- Simulate real user events with `userEvent`
- Test accessibility features

### 3. Mocking Strategy

External dependencies are properly mocked:
```typescript
jest.mock('next/link', () => {
	return ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	)
})
```

### 4. Async Testing

Async operations use proper waiting:
```typescript
await waitFor(() => {
	expect(mockOnSubmit).toHaveBeenCalled()
})
```

### 5. Cleanup

Each test suite includes cleanup:
```typescript
beforeEach(() => {
	jest.clearAllMocks()
})
```

## Common Testing Patterns

### Testing Form Submission

```typescript
const user = userEvent.setup()
render(<LoginFormModern onSubmit={mockOnSubmit} />)

const emailInput = screen.getByLabelText(/email/i)
const passwordInput = screen.getByLabelText(/^password$/i)
const submitButton = screen.getByRole('button', { name: /sign in/i })

await user.type(emailInput, 'test@example.com')
await user.type(passwordInput, 'password123')
await user.click(submitButton)

await waitFor(() => {
	expect(mockOnSubmit).toHaveBeenCalled()
})
```

### Testing Validation Errors

```typescript
const user = userEvent.setup()
render(<LoginFormModern onSubmit={mockOnSubmit} />)

const submitButton = screen.getByRole('button', { name: /sign in/i })
await user.click(submitButton)

expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
expect(mockOnSubmit).not.toHaveBeenCalled()
```

### Testing Loading States

```typescript
mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

render(<LoginFormModern onSubmit={mockOnSubmit} />)

await user.click(submitButton)

expect(submitButton).toBeDisabled()
expect(screen.getByText(/signing in/i)).toBeInTheDocument()

await waitFor(() => {
	expect(submitButton).not.toBeDisabled()
})
```

## Accessibility Testing

All tests include accessibility checks:

1. **Semantic HTML**: Verify proper use of semantic elements
2. **ARIA Attributes**: Check for proper ARIA roles and labels
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Screen Reader Support**: Test with proper labels and descriptions
5. **Focus Management**: Verify focus handling

## Code Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests should be run:
- On every commit (pre-commit hook)
- On pull requests
- Before deployment

## Troubleshooting

### Common Issues

1. **ResizeObserver errors**: Already mocked in `jest.setup.js`
2. **matchMedia errors**: Already mocked in `jest.setup.js`
3. **Next.js Link errors**: Mock Next.js components in test files

### Debugging Tests

```bash
npm test -- --verbose
npm test -- --watch
npm test -- path/to/test.tsx
```

## Future Improvements

1. Add integration tests for complete user flows
2. Add visual regression testing
3. Add performance testing
4. Add E2E tests with Playwright
5. Add API mocking for backend calls
6. Add snapshot testing for components

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests follow existing patterns
3. Maintain minimum coverage thresholds
4. Update this documentation if needed

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
