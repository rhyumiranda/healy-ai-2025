import { AlertCircle } from 'lucide-react'

interface LoginFormErrorProps {
	message?: string
}

export function LoginFormError({ message }: LoginFormErrorProps) {
	if (!message) return null

	return (
		<div
			className='flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4'
			role='alert'
			aria-live='assertive'
		>
			<AlertCircle className='h-5 w-5 text-destructive flex-shrink-0 mt-0.5' />
			<div className='flex-1'>
				<p className='text-sm font-medium text-destructive'>{message}</p>
			</div>
		</div>
	)
}
