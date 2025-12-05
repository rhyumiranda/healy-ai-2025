'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import {
	Card,
	CardContent,
} from '@/components/ui/card'
import { AppHeader } from '@/components/common'
import { RegistrationWizard } from '@/components/auth/registration-wizard'

export default function RegisterPage() {
	return (
		<div className='flex min-h-screen flex-col'>
			<AppHeader variant='auth' showBackButton />
			
			<div className='flex flex-1 items-center justify-center px-4 py-12'>
				<div className='mx-auto w-full max-w-lg'>
					<div className='flex flex-col space-y-2 text-center mb-8'>
						<h1 className='text-2xl font-semibold tracking-tight'>
							Create an account
						</h1>
						<p className='text-sm text-muted-foreground'>
							Enter your details to get started with MedAssist AI
						</p>
					</div>

					<div className='space-y-6'>
						<RegistrationWizard />

						<Card className='border-dashed'>
							<CardContent className='pt-6'>
								<div className='space-y-4'>
									<div className='flex items-center gap-2'>
										<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
											<CheckCircle2 className='h-4 w-4 text-primary' />
						</div>
										<div>
											<h3 className='text-sm font-semibold'>What you get</h3>
											<p className='text-xs text-muted-foreground'>
												Benefits of MedAssist AI
							</p>
						</div>
					</div>

									<ul className='space-y-2 text-sm text-muted-foreground'>
										<li className='flex items-center gap-2'>
											<CheckCircle2 className='h-4 w-4 text-primary' />
											<span>AI-powered treatment recommendations</span>
										</li>
										<li className='flex items-center gap-2'>
											<CheckCircle2 className='h-4 w-4 text-primary' />
											<span>Drug interaction warnings</span>
										</li>
										<li className='flex items-center gap-2'>
											<CheckCircle2 className='h-4 w-4 text-primary' />
											<span>Risk assessment tools</span>
										</li>
										<li className='flex items-center gap-2'>
											<CheckCircle2 className='h-4 w-4 text-primary' />
											<span>Secure patient management</span>
										</li>
									</ul>
								</div>
						</CardContent>
					</Card>

						<div className='text-center text-sm'>
						Already have an account?{' '}
							<Link
								href='/auth/login'
								className='font-medium text-primary underline-offset-4 hover:underline'
							>
								Sign in
							</Link>
						</div>
					</div>

					<p className='mt-8 px-8 text-center text-xs text-muted-foreground'>
						By clicking continue, you agree to our{' '}
						<Link
							href='/terms'
							className='underline underline-offset-4 hover:text-primary'
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href='/privacy'
							className='underline underline-offset-4 hover:text-primary'
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
