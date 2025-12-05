import Link from 'next/link'

export function LoginFormFooter() {
	return (
		<div className='text-center text-sm text-muted-foreground'>
			Don&apos;t have an account?{' '}
			<Link
				href='/auth/register'
				className='font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
			>
				Sign up
			</Link>
		</div>
	)
}
