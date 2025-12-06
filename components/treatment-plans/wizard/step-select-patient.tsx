import { useState } from 'react'
import Link from 'next/link'
import { Search, Users, Plus, AlertTriangle, Check, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePatients } from '@/src/modules/patients'
import type { PatientSummary, TreatmentPlanWizardData } from '@/src/modules/treatment-plans'

interface StepSelectPatientProps {
	formData: TreatmentPlanWizardData
	onSelectPatient: (patient: PatientSummary) => void
	errors: Record<string, string>
}

export function StepSelectPatient({ formData, onSelectPatient, errors }: StepSelectPatientProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const { patients, isLoading } = usePatients({ search: searchQuery, pageSize: 30 })

	const handleSelectPatient = (patient: PatientSummary) => {
		onSelectPatient(patient)
	}

	const calculateAge = (dateOfBirth: string) => {
		const today = new Date()
		const birth = new Date(dateOfBirth)
		let age = today.getFullYear() - birth.getFullYear()
		const monthDiff = today.getMonth() - birth.getMonth()
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--
		}
		return age
	}

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	const getGenderColor = (gender: string) => {
		switch (gender.toUpperCase()) {
			case 'MALE':
				return 'bg-blue-100 text-blue-700'
			case 'FEMALE':
				return 'bg-pink-100 text-pink-700'
			default:
				return 'bg-gray-100 text-gray-700'
		}
	}

	return (
		<div className='space-y-4'>
			<Card>
				<CardHeader className='pb-3'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Users className='h-5 w-5 text-primary' />
							<CardTitle className='text-lg'>Select Patient</CardTitle>
						</div>
						<Link href='/dashboard/patients/new'>
							<Button variant='outline' size='sm'>
								<Plus className='h-4 w-4 mr-1.5' />
								New Patient
							</Button>
						</Link>
					</div>
					<CardDescription>Choose a patient to create a treatment plan for</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							placeholder='Search patients by name...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-9'
						/>
					</div>

					{errors.patientId && (
						<p className='text-sm text-destructive'>{errors.patientId}</p>
					)}

					{/* Compact Card Grid */}
					<div className='grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
						{isLoading ? (
							<>
								{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
									<div
										key={i}
										className='animate-pulse rounded-lg border p-3 space-y-2'
									>
										<div className='flex items-center gap-2'>
											<div className='h-8 w-8 bg-muted rounded-full' />
											<div className='flex-1'>
												<div className='h-3 bg-muted rounded w-3/4' />
											</div>
										</div>
										<div className='h-2.5 bg-muted rounded w-1/2' />
									</div>
								))}
							</>
						) : patients.length === 0 ? (
							<div className='col-span-full border border-dashed rounded-lg'>
								<div className='flex flex-col items-center justify-center py-8'>
									<Users className='h-10 w-10 text-muted-foreground mb-3' />
									<p className='text-muted-foreground text-center text-sm'>
										{searchQuery ? 'No patients found' : 'No patients available'}
									</p>
									<Link href='/dashboard/patients/new'>
										<Button variant='outline' size='sm' className='mt-3'>
											<Plus className='h-4 w-4 mr-1.5' />
											Add Patient
										</Button>
									</Link>
								</div>
							</div>
						) : (
							patients.map((patient) => {
								const isSelected = formData.patientId === patient.id
								const age = calculateAge(
									typeof patient.dateOfBirth === 'string'
										? patient.dateOfBirth
										: patient.dateOfBirth.toISOString()
								)
								const patientSummary: PatientSummary = {
									id: patient.id,
									name: patient.name,
									dateOfBirth:
										typeof patient.dateOfBirth === 'string'
											? patient.dateOfBirth
											: patient.dateOfBirth.toISOString(),
									gender: patient.gender,
									allergies: patient.allergies,
									chronicConditions: patient.chronicConditions,
								}
								const hasAlerts = patient.allergies?.length > 0

								return (
									<div
										key={patient.id}
										onClick={() => handleSelectPatient(patientSummary)}
										className={cn(
											'relative rounded-lg border p-3 cursor-pointer transition-all hover:border-primary hover:bg-accent/50',
											isSelected && 'border-primary ring-2 ring-primary/20 bg-primary/5'
										)}
									>
										{/* Selection indicator */}
										{isSelected && (
											<div className='absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary rounded-full flex items-center justify-center'>
												<Check className='h-3 w-3 text-primary-foreground' />
											</div>
										)}

										{/* Patient Info - Compact */}
										<div className='flex items-center gap-2.5'>
											<div
												className={cn(
													'h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
													getGenderColor(patient.gender)
												)}
											>
												{getInitials(patient.name)}
											</div>
											<div className='min-w-0 flex-1'>
												<p className='font-medium text-sm truncate'>{patient.name}</p>
												<p className='text-xs text-muted-foreground'>
													{age}y • {patient.gender.charAt(0)}
												</p>
											</div>
										</div>

										{/* Alert indicator for allergies */}
										{hasAlerts && (
											<div className='mt-2 flex items-center gap-1'>
												<AlertTriangle className='h-3 w-3 text-orange-500 shrink-0' />
												<span className='text-[10px] text-orange-600 truncate'>
													{patient.allergies.length} allerg{patient.allergies.length > 1 ? 'ies' : 'y'}
												</span>
											</div>
										)}

										{/* Chronic conditions - compact badges */}
										{patient.chronicConditions?.length > 0 && (
											<div className='mt-1.5 flex items-center gap-1 flex-wrap'>
												{patient.chronicConditions.slice(0, 1).map((condition, i) => (
													<Badge
														key={i}
														variant='secondary'
														className='text-[10px] px-1.5 py-0 h-4'
													>
														{condition.length > 12 ? condition.slice(0, 12) + '...' : condition}
													</Badge>
												))}
												{patient.chronicConditions.length > 1 && (
													<span className='text-[10px] text-muted-foreground'>
														+{patient.chronicConditions.length - 1}
													</span>
												)}
											</div>
										)}
									</div>
								)
							})
						)}
					</div>

					{/* Patient count */}
					{!isLoading && patients.length > 0 && (
						<p className='text-xs text-muted-foreground text-center'>
							Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
						</p>
					)}
				</CardContent>
			</Card>

			{/* Selected Patient Summary - More compact */}
			{formData.selectedPatient && (
				<Card className='border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800'>
					<CardContent className='p-4'>
						<div className='flex items-center gap-3'>
							<div className='h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center'>
								<User className='h-5 w-5 text-green-600 dark:text-green-400' />
							</div>
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2'>
									<p className='font-medium text-green-800 dark:text-green-200'>
										{formData.selectedPatient.name}
									</p>
									<Check className='h-4 w-4 text-green-600 dark:text-green-400' />
								</div>
								<p className='text-sm text-green-700/70 dark:text-green-300/70'>
									{calculateAge(formData.selectedPatient.dateOfBirth)} years old • {formData.selectedPatient.gender}
								</p>
							</div>
							<Button
								variant='ghost'
								size='sm'
								className='text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900'
								onClick={() => onSelectPatient(formData.selectedPatient!)}
							>
								Change
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
