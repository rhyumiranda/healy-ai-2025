'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/common'
import type { VerificationResponse } from '@/src/modules/auth/types'

function VerifyEmailContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
	const [message, setMessage] = useState('')

	useEffect(() => {
		async function verifyEmail() {
			if (!token) {
				setStatus('error')
				setMessage('Verification token is missing')
				return
			}

			try {
				const response = await fetch(`/api/auth/verify-email?token=${token}`)
				const data: VerificationResponse = await response.json()

				if (response.ok && data.success) {
					setStatus('success')
					setMessage(data.message)
					
					setTimeout(() => {
						router.push('/auth/login?verified=true')
					}, 3000)
				} else {
					setStatus('error')
					setMessage(data.error || 'Verification failed')
				}
			} catch (error) {
				setStatus('error')
				setMessage('An error occurred during verification. Please try again.')
			}
		}

		verifyEmail()
	}, [token, router])

	return (
		<div className='flex min-h-screen flex-col'>
			<AppHeader variant='auth' showBackButton={false} />
			
			<div className='flex flex-1 items-center justify-center px-4 py-12'>
				<div className='mx-auto w-full max-w-md'>
					<Card>
						<CardHeader className='text-center'>
							<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
								{status === 'loading' && (
									<Loader2 className='h-8 w-8 text-primary animate-spin' />
								)}
								{status === 'success' && (
									<CheckCircle2 className='h-8 w-8 text-green-600' />
								)}
								{status === 'error' && (
									<XCircle className='h-8 w-8 text-destructive' />
								)}
							</div>
							<CardTitle className='text-2xl'>
								{status === 'loading' && 'Verifying your email...'}
								{status === 'success' && 'Email verified!'}
								{status === 'error' && 'Verification failed'}
							</CardTitle>
							<CardDescription>{message}</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{status === 'loading' && (
								<div className='text-center text-sm text-muted-foreground'>
									<p>Please wait while we verify your email address.</p>
								</div>
							)}

							{status === 'success' && (
								<div className='space-y-4'>
									<div className='rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-sm'>
										<p className='text-green-900 dark:text-green-100'>
											Your email has been successfully verified! You can now sign in to your account.
										</p>
									</div>
									<p className='text-center text-sm text-muted-foreground'>
										Redirecting you to the login page in 3 seconds...
									</p>
									<Link href='/auth/login' className='block'>
										<Button className='w-full'>
											Go to Login Now
										</Button>
									</Link>
								</div>
							)}

							{status === 'error' && (
								<div className='space-y-4'>
									<div className='rounded-lg bg-destructive/10 p-4 text-sm'>
										<p className='text-destructive'>
											{message}
										</p>
									</div>
									<div className='text-sm text-muted-foreground space-y-2'>
										<p>Possible reasons:</p>
										<ul className='list-disc list-inside space-y-1 ml-2'>
											<li>The verification link has expired</li>
											<li>The link has already been used</li>
											<li>The link is invalid or corrupted</li>
										</ul>
									</div>
									<div className='space-y-3'>
										<Link href='/auth/register' className='block'>
											<Button className='w-full' variant='default'>
												Try Registering Again
											</Button>
										</Link>
										<Link href='/' className='block'>
											<Button className='w-full' variant='outline'>
												Back to Home
											</Button>
										</Link>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={
			<div className='flex min-h-screen items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		}>
			<VerifyEmailContent />
		</Suspense>
	)
}
