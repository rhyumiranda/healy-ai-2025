import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldWrapperProps {
	label: string
	htmlFor: string
	error?: string
	required?: boolean
	description?: string
	children: React.ReactNode
	className?: string
}

export function FormFieldWrapper({
	label,
	htmlFor,
	error,
	required = false,
	description,
	children,
	className,
}: FormFieldWrapperProps) {
	return (
		<div className={cn('space-y-2', className)}>
			<Label
				htmlFor={htmlFor}
				className={cn(error && 'text-destructive')}
			>
				{label}
				{required && <span className="ml-1 text-destructive">*</span>}
			</Label>
			{children}
			{description && !error && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
			{error && (
				<p className="text-xs font-medium text-destructive">{error}</p>
			)}
		</div>
	)
}
