'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { AppHeader } from '@/src/modules/common'
import { LoginFormModern } from '../components/login-form-modern'
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
		<div className="flex min-h-screen flex-col">
			<AppHeader variant="auth" showBackButton />

			<div className="flex flex-1 items-center justify-center px-4 py-12">
				<div className="mx-auto w-full max-w-sm">
					<div className="flex flex-col space-y-2 text-center mb-8">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary mb-2">
							<Shield className="h-6 w-6 text-primary-foreground" />
						</div>
						<h1 className="text-2xl font-semibold tracking-tight">
							Welcome back
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your email to sign in to your account
						</p>
					</div>

					<Card>
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl">Sign in</CardTitle>
							<CardDescription>
								Access your MedAssist AI account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LoginFormModern onSubmit={handleLogin} />

							<div className="mt-4 text-center text-sm">
								Don&apos;t have an account?{' '}
								<Link
									href="/auth/register"
									className="font-medium text-primary underline-offset-4 hover:underline"
								>
									Sign up
								</Link>
							</div>
						</CardContent>
					</Card>

					<p className="mt-8 px-8 text-center text-xs text-muted-foreground">
						By clicking continue, you agree to our{' '}
						<Link
							href="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href="/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	)
}
