'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { LoginFormData } from '../types'

interface LoginFormModernProps {
	onSubmit: (data: LoginFormData) => Promise<void>
}

export function LoginFormModern({ onSubmit }: LoginFormModernProps) {
	const [formData, setFormData] = useState<LoginFormData>({
		email: '',
		password: '',
		rememberMe: false,
	})
	const [errors, setErrors] = useState<{
		email?: string
		password?: string
		general?: string
	}>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)

	function handleChange(field: keyof LoginFormData, value: string | boolean) {
		setFormData((prev) => ({ ...prev, [field]: value }))
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[field as keyof typeof errors]
				return newErrors
			})
		}
	}

	function validateForm(): boolean {
		const newErrors: typeof errors = {}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email'
		}

		if (!formData.password) {
			newErrors.password = 'Password is required'
		} else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsSubmitting(true)
		try {
			await onSubmit(formData)
		} catch (error) {
			setErrors({
				general:
					error instanceof Error
						? error.message
						: 'Login failed. Please try again.',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6" noValidate>
			{errors.general && (
				<div
					className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
					role="alert"
				>
					{errors.general}
				</div>
			)}

			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						value={formData.email}
						onChange={(e) => handleChange('email', e.target.value)}
						className={errors.email && 'border-destructive'}
						disabled={isSubmitting}
						autoComplete="email"
					/>
					{errors.email && (
						<p className="text-xs text-destructive">{errors.email}</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<Link
							href="/auth/forgot-password"
							className="text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
						>
							Forgot password?
						</Link>
					</div>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="Enter your password"
							value={formData.password}
							onChange={(e) => handleChange('password', e.target.value)}
							className={errors.password && 'border-destructive'}
							disabled={isSubmitting}
							autoComplete="current-password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							tabIndex={-1}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
					{errors.password && (
						<p className="text-xs text-destructive">{errors.password}</p>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="rememberMe"
						checked={formData.rememberMe}
						onCheckedChange={(checked) =>
							handleChange('rememberMe', checked === true)
						}
						disabled={isSubmitting}
					/>
					<Label
						htmlFor="rememberMe"
						className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Remember me for 30 days
					</Label>
				</div>
			</div>

			<Button
				type="submit"
				className="w-full"
				size="lg"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Signing in...
					</>
				) : (
					'Sign in'
				)}
			</Button>
		</form>
	)
}
