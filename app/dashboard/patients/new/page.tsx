'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertTriangle, Pill, Heart } from 'lucide-react'
import { TagInput } from '@/components/patients'
import { useCreatePatient, type CreatePatientInput, type Gender } from '@/src/modules/patients'

export default function NewPatientPage() {
	const { createPatient, isLoading, error } = useCreatePatient()
	const [formData, setFormData] = useState<CreatePatientInput>({
		name: '',
		dateOfBirth: '',
		gender: 'MALE' as Gender,
		medicalHistory: '',
		currentMedications: [],
		allergies: [],
		chronicConditions: [],
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await createPatient(formData)
	}

	const updateField = <K extends keyof CreatePatientInput>(
		field: K,
		value: CreatePatientInput[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
				<div className='flex items-center gap-2 px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator
						orientation='vertical'
						className='mr-2 data-[orientation=vertical]:h-4'
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard/patients'>Patients</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>New Patient</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className='flex flex-1 flex-col gap-6 p-4 pt-0 max-w-3xl'>
				<div className='flex items-center gap-4'>
					<Link href='/dashboard/patients'>
						<Button variant='ghost' size='icon' className='h-8 w-8'>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='text-2xl font-semibold tracking-tight'>
							Add New Patient
						</h1>
						<p className='text-sm text-muted-foreground'>
							Enter patient information to create a new record
						</p>
					</div>
				</div>

				{error && (
					<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
						<p className='text-sm text-destructive'>{error}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Basic Information</CardTitle>
							<CardDescription>Patient demographics and identification</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Full Name *</Label>
									<Input
										id='name'
										placeholder='John Doe'
										value={formData.name}
										onChange={(e) => updateField('name', e.target.value)}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='dateOfBirth'>Date of Birth *</Label>
									<Input
										id='dateOfBirth'
										type='date'
										value={formData.dateOfBirth}
										onChange={(e) => updateField('dateOfBirth', e.target.value)}
										required
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='gender'>Gender *</Label>
								<Select
									value={formData.gender}
									onValueChange={(value) => updateField('gender', value as Gender)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select gender' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='MALE'>Male</SelectItem>
										<SelectItem value='FEMALE'>Female</SelectItem>
										<SelectItem value='OTHER'>Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Pill className='h-5 w-5' />
								Current Medications
							</CardTitle>
							<CardDescription>
								List all medications the patient is currently taking
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TagInput
								value={formData.currentMedications || []}
								onChange={(tags) => updateField('currentMedications', tags)}
								placeholder='Type medication name and press Enter'
							/>
						</CardContent>
					</Card>

					<Card className='border-orange-200 bg-orange-50/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2 text-orange-700'>
								<AlertTriangle className='h-5 w-5' />
								Allergies
							</CardTitle>
							<CardDescription className='text-orange-600'>
								Critical for safety checks - list all known allergies
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TagInput
								value={formData.allergies || []}
								onChange={(tags) => updateField('allergies', tags)}
								placeholder='Type allergy and press Enter'
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Heart className='h-5 w-5' />
								Chronic Conditions
							</CardTitle>
							<CardDescription>
								Ongoing health conditions that may affect treatment
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TagInput
								value={formData.chronicConditions || []}
								onChange={(tags) => updateField('chronicConditions', tags)}
								placeholder='Type condition and press Enter'
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Medical History</CardTitle>
							<CardDescription>
								Additional notes about the patient&apos;s medical background
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								placeholder='Enter relevant medical history, past surgeries, family history, etc.'
								value={formData.medicalHistory || ''}
								onChange={(e) => updateField('medicalHistory', e.target.value)}
								rows={4}
							/>
						</CardContent>
					</Card>

					<div className='flex items-center justify-end gap-3 pt-4'>
						<Link href='/dashboard/patients'>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</Link>
						<Button type='submit' disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Creating...
								</>
							) : (
								'Create Patient'
							)}
						</Button>
					</div>
				</form>
			</div>
		</>
	)
}
