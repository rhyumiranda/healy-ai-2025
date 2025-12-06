import { User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { PatientWizardData, Gender, BloodType } from '@/src/modules/patients'
import { GENDERS, BLOOD_TYPES } from '@/src/modules/patients'

interface StepDemographicsProps {
	formData: PatientWizardData
	onUpdate: (data: Partial<PatientWizardData>) => void
	errors: Record<string, string>
}

export function StepDemographics({ formData, onUpdate, errors }: StepDemographicsProps) {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<User className='h-5 w-5 text-primary' />
					<CardTitle className='text-lg'>Patient Demographics</CardTitle>
				</div>
				<CardDescription>
					Enter the patient&apos;s basic identification and physical information
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='space-y-2'>
						<Label htmlFor='name'>
							Full Name <span className='text-destructive'>*</span>
						</Label>
						<Input
							id='name'
							placeholder='John Doe'
							value={formData.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
							className={errors.name ? 'border-destructive' : ''}
						/>
						{errors.name && (
							<p className='text-sm text-destructive'>{errors.name}</p>
						)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='dateOfBirth'>
							Date of Birth <span className='text-destructive'>*</span>
						</Label>
						<Input
							id='dateOfBirth'
							type='date'
							value={formData.dateOfBirth}
							onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
							className={errors.dateOfBirth ? 'border-destructive' : ''}
						/>
						{errors.dateOfBirth && (
							<p className='text-sm text-destructive'>{errors.dateOfBirth}</p>
						)}
					</div>
				</div>

				<div className='grid gap-4 sm:grid-cols-3'>
					<div className='space-y-2'>
						<Label htmlFor='gender'>
							Gender <span className='text-destructive'>*</span>
						</Label>
						<Select
							value={formData.gender}
							onValueChange={(value) => onUpdate({ gender: value as Gender })}
						>
							<SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
								<SelectValue placeholder='Select gender' />
							</SelectTrigger>
							<SelectContent>
								{GENDERS.map((gender) => (
									<SelectItem key={gender} value={gender}>
										{gender.charAt(0) + gender.slice(1).toLowerCase()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.gender && (
							<p className='text-sm text-destructive'>{errors.gender}</p>
						)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='weight'>Weight (kg)</Label>
						<Input
							id='weight'
							type='number'
							step='0.1'
							placeholder='70.5'
							value={formData.weight || ''}
							onChange={(e) =>
								onUpdate({
									weight: e.target.value ? parseFloat(e.target.value) : undefined,
								})
							}
							className={errors.weight ? 'border-destructive' : ''}
						/>
						{errors.weight && (
							<p className='text-sm text-destructive'>{errors.weight}</p>
						)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='height'>Height (cm)</Label>
						<Input
							id='height'
							type='number'
							placeholder='175'
							value={formData.height || ''}
							onChange={(e) =>
								onUpdate({
									height: e.target.value ? parseFloat(e.target.value) : undefined,
								})
							}
							className={errors.height ? 'border-destructive' : ''}
						/>
						{errors.height && (
							<p className='text-sm text-destructive'>{errors.height}</p>
						)}
					</div>
				</div>

				<div className='space-y-2 max-w-xs'>
					<Label htmlFor='bloodType'>Blood Type</Label>
					<Select
						value={formData.bloodType || ''}
						onValueChange={(value) =>
							onUpdate({ bloodType: value as BloodType || undefined })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select blood type' />
						</SelectTrigger>
						<SelectContent>
							{BLOOD_TYPES.map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<p className='text-sm text-muted-foreground'>
					<span className='text-destructive'>*</span> Required fields
				</p>
			</CardContent>
		</Card>
	)
}
