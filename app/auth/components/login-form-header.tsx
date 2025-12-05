import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface LoginFormHeaderProps {
	title?: string
	description?: string
}

export function LoginFormHeader({
	title = 'Welcome Back',
	description = 'Sign in to your account to continue',
}: LoginFormHeaderProps) {
	return (
		<CardHeader className='space-y-1 text-center'>
			<CardTitle className='text-3xl font-bold tracking-tight'>
				{title}
			</CardTitle>
			<CardDescription className='text-base'>{description}</CardDescription>
		</CardHeader>
	)
}
