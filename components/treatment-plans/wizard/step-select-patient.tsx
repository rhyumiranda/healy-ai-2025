import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Users, Plus, AlertTriangle, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePatients } from '@/src/modules/patients'
import type { PatientSummary, TreatmentPlanWizardData } from '@/src/modules/treatment-plans'

interface StepSelectPatientProps {
	formData: TreatmentPlanWizardData
	onSelectPatient: (patient: PatientSummary) => void
	errors: Record<string, string>
}

export function StepSelectPatient({ formData, onSelectPatient, errors }: StepSelectPatientProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const { patients, isLoading } = usePatients({ search: searchQuery, pageSize: 20 })

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

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Users className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Select Patient</CardTitle>
					</div>
					<CardDescription>Choose a patient to create a treatment plan for</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center gap-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								placeholder='Search patients by name...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-9'
							/>
						</div>
						<Link href='/dashboard/patients/new'>
							<Button variant='outline'>
								<Plus className='h-4 w-4 mr-2' />
								New Patient
							</Button>
						</Link>
					</div>

					{errors.patientId && (
						<p className='text-sm text-destructive'>{errors.patientId}</p>
					)}

					<div className='grid gap-3 md:grid-cols-2'>
						{isLoading ? (
							<>
								{[1, 2, 3, 4].map((i) => (
									<Card key={i} className='animate-pulse'>
										<CardContent className='p-4'>
											<div className='h-4 bg-muted rounded w-3/4 mb-2' />
											<div className='h-3 bg-muted rounded w-1/2' />
										</CardContent>
									</Card>
								))}
							</>
						) : patients.length === 0 ? (
							<Card className='col-span-2 border-dashed'>
								<CardContent className='flex flex-col items-center justify-center py-8'>
									<Users className='h-10 w-10 text-muted-foreground mb-4' />
									<p className='text-muted-foreground text-center'>
										{searchQuery ? 'No patients found matching your search' : 'No patients available'}
									</p>
									<Link href='/dashboard/patients/new'>
										<Button variant='outline' className='mt-4'>
											<Plus className='h-4 w-4 mr-2' />
											Add New Patient
										</Button>
									</Link>
								</CardContent>
							</Card>
						) : (
							patients.map((patient) => {
								const isSelected = formData.patientId === patient.id
								const patientSummary: PatientSummary = {
									id: patient.id,
									name: patient.name,
									dateOfBirth: typeof patient.dateOfBirth === 'string' ? patient.dateOfBirth : patient.dateOfBirth.toISOString(),
									gender: patient.gender,
									allergies: patient.allergies,
									chronicConditions: patient.chronicConditions,
								}

								return (
									<Card
										key={patient.id}
										className={`cursor-pointer transition-all hover:border-primary ${
											isSelected ? 'border-primary ring-2 ring-primary/20' : ''
										}`}
										onClick={() => handleSelectPatient(patientSummary)}
									>
										<CardContent className='p-4'>
											<div className='flex items-start justify-between'>
												<div className='space-y-1'>
													<div className='flex items-center gap-2'>
														<p className='font-medium'>{patient.name}</p>
														{isSelected && <Check className='h-4 w-4 text-primary' />}
													</div>
													<p className='text-sm text-muted-foreground'>
														{calculateAge(typeof patient.dateOfBirth === 'string' ? patient.dateOfBirth : patient.dateOfBirth.toISOString())} years old • {patient.gender}
													</p>
												</div>
											</div>
											{(patient.allergies?.length > 0 || patient.chronicConditions?.length > 0) && (
												<div className='mt-3 space-y-2'>
													{patient.allergies?.length > 0 && (
														<div className='flex items-center gap-2 flex-wrap'>
															<AlertTriangle className='h-3 w-3 text-orange-500' />
															{patient.allergies.slice(0, 2).map((allergy, i) => (
																<Badge key={i} variant='outline' className='text-xs text-orange-600 border-orange-300'>
																	{allergy}
																</Badge>
															))}
															{patient.allergies.length > 2 && (
																<span className='text-xs text-muted-foreground'>+{patient.allergies.length - 2} more</span>
															)}
														</div>
													)}
													{patient.chronicConditions?.length > 0 && (
														<div className='flex items-center gap-2 flex-wrap'>
															{patient.chronicConditions.slice(0, 2).map((condition, i) => (
																<Badge key={i} variant='secondary' className='text-xs'>
																	{condition}
																</Badge>
															))}
															{patient.chronicConditions.length > 2 && (
																<span className='text-xs text-muted-foreground'>+{patient.chronicConditions.length - 2} more</span>
															)}
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								)
							})
						)}
					</div>
				</CardContent>
			</Card>

			{formData.selectedPatient && (
				<Card className='border-green-200 bg-green-50/50'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-base text-green-800'>Selected Patient</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex items-center justify-between'>
							<div>
								<p className='font-medium'>{formData.selectedPatient.name}</p>
								<p className='text-sm text-muted-foreground'>
									{calculateAge(formData.selectedPatient.dateOfBirth)} years old • {formData.selectedPatient.gender}
								</p>
							</div>
							<Check className='h-5 w-5 text-green-600' />
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
