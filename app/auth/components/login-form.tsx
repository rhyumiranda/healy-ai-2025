'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useLoginForm } from '../hooks/use-login-form'
import type { LoginFormData } from '../types'
import { LoginFormHeader } from './login-form-header'
import { LoginFormFields } from './login-form-fields'
import { LoginFormActions } from './login-form-actions'
import { LoginFormFooter } from './login-form-footer'
import { LoginFormError } from './login-form-error'

interface LoginFormProps {
	onSubmit: (data: LoginFormData) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
	const { formState, handleChange, handleSubmit } = useLoginForm()

	const onFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await handleSubmit(onSubmit)
	}

	return (
		<Card className='w-full max-w-md border-border shadow-lg'>
			<form onSubmit={onFormSubmit} noValidate>
				<LoginFormHeader />

				<CardContent className='space-y-6'>
					<LoginFormError message={formState.errors.general} />

					<LoginFormFields
						data={formState.data}
						errors={formState.errors}
						isSubmitting={formState.isSubmitting}
						onChange={handleChange}
					/>

					<LoginFormActions
						isSubmitting={formState.isSubmitting}
						isValid={formState.isValid}
						onSubmit={() => handleSubmit(onSubmit)}
					/>
				</CardContent>

				<CardFooter className='flex flex-col space-y-4'>
					<LoginFormFooter />
				</CardFooter>
			</form>
		</Card>
	)
}
