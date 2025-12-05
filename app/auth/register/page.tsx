'use client'

import Link from 'next/link'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RegistrationForm } from '@/src/modules/auth/components/registration-form'
import type { DoctorRegistrationForm } from '@/src/modules/auth/types'

export default function RegisterPage() {
	async function handleRegistration(data: DoctorRegistrationForm) {
		console.log('Registration data:', data)
		await new Promise((resolve) => setTimeout(resolve, 2000))
		console.log('Registration submitted successfully')
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-background to-muted/20">
			<div className="container relative flex min-h-screen flex-col items-center justify-center py-12 md:py-16">
				<Link
					href="/"
					className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:left-8 md:top-8"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Home
				</Link>

				<div className="mx-auto w-full max-w-2xl space-y-8">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Stethoscope className="h-8 w-8 text-primary" />
						</div>
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
								Create Your Account
							</h1>
							<p className="text-base text-muted-foreground md:text-lg">
								Join our AI-powered treatment planning platform
							</p>
						</div>
					</div>

					<Card className="border-2">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl">
								Doctor Registration
							</CardTitle>
							<CardDescription>
								Enter your professional details to create your account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RegistrationForm onSubmit={handleRegistration} />
						</CardContent>
					</Card>

					<p className="text-center text-sm text-muted-foreground">
						Already have an account?{' '}
						<Link
							href="/auth/login"
							className="font-medium text-primary hover:underline"
						>
							Sign in here
						</Link>
					</p>

					<div className="mx-auto max-w-md space-y-4 rounded-lg border bg-muted/50 p-6">
						<h3 className="text-sm font-semibold">
							Why join our platform?
						</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-primary">✓</span>
								<span>
									AI-powered treatment recommendations in seconds
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-primary">✓</span>
								<span>
									Comprehensive drug interaction warnings
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-primary">✓</span>
								<span>Risk assessment for every treatment plan</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-primary">✓</span>
								<span>Secure patient record management</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
