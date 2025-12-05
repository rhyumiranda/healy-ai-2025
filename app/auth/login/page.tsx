'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Shield, CheckCircle2 } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { AppHeader } from '@/components/common'
import { LoginFormModern } from '../components/login-form-modern'
import type { LoginFormData } from '../types'
import { Suspense } from 'react'

function LoginContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const verified = searchParams.get('verified')

	const handleLogin = async (data: LoginFormData) => {
		try {
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			})

			if (result?.error) {
				throw new Error(result.error)
			}

			if (result?.ok) {
				router.push('/dashboard')
				router.refresh()
			}
		} catch (error) {
			throw error
		}
	}

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader variant="auth" showBackButton />

			<div className="flex flex-1 items-center justify-center px-4 py-12">
				<div className="mx-auto w-full max-w-sm">
					{verified && (
						<div className="mb-6 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
								<p className="text-sm font-medium text-green-900 dark:text-green-100">
									Email verified successfully! You can now sign in.
								</p>
							</div>
						</div>
					)}

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

export default function LoginPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoginContent />
		</Suspense>
	)
}
