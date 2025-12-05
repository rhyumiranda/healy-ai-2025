'use client'

import { LoginForm } from '../components/login-form'
import type { LoginFormData } from '../types'

export default function LoginPage() {
	const handleLogin = async (data: LoginFormData) => {
		await new Promise((resolve) => setTimeout(resolve, 1500))

		console.log('Login submitted:', {
			email: data.email,
			rememberMe: data.rememberMe,
		})
	}

	return (
		<main className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center space-y-2'>
					<h1 className='text-4xl font-bold tracking-tight text-foreground'>
						AI Treatment Plan Assistant
					</h1>
					<p className='text-muted-foreground'>
						Intelligent clinical decision support for healthcare professionals
					</p>
				</div>

				<LoginForm onSubmit={handleLogin} />

				<div className='text-center'>
					<p className='text-xs text-muted-foreground'>
						By signing in, you agree to our{' '}
						<a
							href='/terms'
							className='underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
						>
							Terms of Service
						</a>{' '}
						and{' '}
						<a
							href='/privacy'
							className='underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
						>
							Privacy Policy
						</a>
					</p>
				</div>
			</div>
		</main>
	)
}
