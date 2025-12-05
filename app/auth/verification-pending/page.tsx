'use client'

import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/common'

export default function VerificationPendingPage() {
	return (
		<div className='flex min-h-screen flex-col'>
			<AppHeader variant='auth' showBackButton={false} />
			
			<div className='flex flex-1 items-center justify-center px-4 py-12'>
				<div className='mx-auto w-full max-w-md'>
					<Card>
						<CardHeader className='text-center'>
							<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
								<Mail className='h-8 w-8 text-primary' />
							</div>
							<CardTitle className='text-2xl'>Check your email</CardTitle>
							<CardDescription>
								We&apos;ve sent you a verification link
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground'>
								<p className='mb-2'>
									We&apos;ve sent a verification email to your registered email address.
								</p>
								<p>
									Please click the verification link in the email to activate your account and complete the registration process.
								</p>
							</div>

							<div className='space-y-3 pt-4'>
								<h4 className='text-sm font-medium'>Next steps:</h4>
								<ol className='space-y-2 text-sm text-muted-foreground'>
									<li className='flex gap-2'>
										<span className='font-semibold text-foreground'>1.</span>
										<span>Check your inbox (and spam folder)</span>
									</li>
									<li className='flex gap-2'>
										<span className='font-semibold text-foreground'>2.</span>
										<span>Click the verification link in the email</span>
									</li>
									<li className='flex gap-2'>
										<span className='font-semibold text-foreground'>3.</span>
										<span>Sign in to your account</span>
									</li>
								</ol>
							</div>

							<div className='pt-6 space-y-3'>
								<Link href='/auth/login' className='block'>
									<Button className='w-full' variant='default'>
										Go to Login
									</Button>
								</Link>
								<Link href='/' className='block'>
									<Button className='w-full' variant='outline'>
										<ArrowLeft className='mr-2 h-4 w-4' />
										Back to Home
									</Button>
								</Link>
							</div>

							<div className='pt-4 text-center text-xs text-muted-foreground'>
								<p>Didn&apos;t receive the email?</p>
								<p className='mt-1'>
									Check your spam folder or contact support for assistance.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
