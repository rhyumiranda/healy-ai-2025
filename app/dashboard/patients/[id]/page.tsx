'use client'

import { useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	ArrowLeft,
	Edit,
	Trash2,
	Plus,
	Calendar,
	User,
	Pill,
	AlertTriangle,
	Heart,
	FileText,
	Clock,
} from 'lucide-react'
import { usePatient, useDeletePatient } from '@/src/modules/patients'
import { DeletePatientDialog } from '@/components/patients'

function calculateAge(dateOfBirth: Date | string): number {
	const birth = new Date(dateOfBirth)
	const today = new Date()
	let age = today.getFullYear() - birth.getFullYear()
	const monthDiff = today.getMonth() - birth.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--
	}
	return age
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		DRAFT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
		APPROVED: 'bg-green-50 text-green-700 border-green-200',
		REJECTED: 'bg-red-50 text-red-700 border-red-200',
	}
	return (
		<Badge variant='outline' className={colors[status] || ''}>
			{status.charAt(0) + status.slice(1).toLowerCase()}
		</Badge>
	)
}

function RiskBadge({ risk }: { risk: string | null }) {
	if (!risk) return <span className='text-muted-foreground'>—</span>
	const colors: Record<string, string> = {
		LOW: 'bg-green-50 text-green-700 border-green-200',
		MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
		HIGH: 'bg-red-50 text-red-700 border-red-200',
	}
	return (
		<Badge variant='outline' className={colors[risk] || ''}>
			{risk}
		</Badge>
	)
}

export default function PatientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const { patient, isLoading, error } = usePatient(id)
	const { deletePatient, isLoading: isDeleting } = useDeletePatient()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleDelete = async () => {
		await deletePatient(id)
	}

	if (isLoading) {
		return (
			<>
				<header className='flex h-16 shrink-0 items-center gap-2'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<Skeleton className='h-4 w-48' />
					</div>
				</header>
				<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
					<Skeleton className='h-8 w-64' />
					<div className='grid gap-6 md:grid-cols-3'>
						<Skeleton className='h-48 col-span-2' />
						<Skeleton className='h-48' />
					</div>
				</div>
			</>
		)
	}

	if (error || !patient) {
		return (
			<>
				<header className='flex h-16 shrink-0 items-center gap-2'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href='/dashboard/patients'>Patients</BreadcrumbLink>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className='flex flex-1 flex-col items-center justify-center gap-4 p-4'>
					<p className='text-destructive'>{error || 'Patient not found'}</p>
					<Link href='/dashboard/patients'>
						<Button variant='outline'>Back to Patients</Button>
					</Link>
				</div>
			</>
		)
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
								<BreadcrumbPage>{patient.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-4'>
						<Link href='/dashboard/patients'>
							<Button variant='ghost' size='icon' className='h-8 w-8'>
								<ArrowLeft className='h-4 w-4' />
							</Button>
						</Link>
						<div>
							<h1 className='text-xl sm:text-2xl font-semibold tracking-tight'>
								{patient.name}
							</h1>
							<p className='text-sm text-muted-foreground'>
								{calculateAge(patient.dateOfBirth)} years old •{' '}
								{patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						<Link href={`/dashboard/patients/${id}/edit`}>
							<Button variant='outline' size='sm'>
								<Edit className='h-4 w-4 sm:mr-2' />
								<span className='hidden sm:inline'>Edit</span>
							</Button>
						</Link>
						<Button
							variant='outline'
							size='sm'
							className='text-destructive hover:text-destructive'
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash2 className='h-4 w-4 sm:mr-2' />
							<span className='hidden sm:inline'>Delete</span>
						</Button>
						<Link href={`/dashboard/treatment-plans/new?patientId=${id}`}>
							<Button size='sm'>
								<Plus className='h-4 w-4 sm:mr-2' />
								<span className='hidden sm:inline'>New Treatment Plan</span>
								<span className='sm:hidden'>New Plan</span>
							</Button>
						</Link>
					</div>
				</div>

				<div className='grid gap-6 lg:grid-cols-3'>
					<div className='lg:col-span-2 space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg flex items-center gap-2'>
									<User className='h-5 w-5' />
									Patient Information
								</CardTitle>
							</CardHeader>
							<CardContent className='grid gap-4 sm:grid-cols-2'>
								<div>
									<p className='text-sm text-muted-foreground'>Full Name</p>
									<p className='font-medium'>{patient.name}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Date of Birth</p>
									<p className='font-medium flex items-center gap-2'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										{format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Gender</p>
									<p className='font-medium'>
										{patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Age</p>
									<p className='font-medium'>
										{calculateAge(patient.dateOfBirth)} years
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg flex items-center gap-2'>
									<Pill className='h-5 w-5' />
									Current Medications
								</CardTitle>
							</CardHeader>
							<CardContent>
								{patient.currentMedications.length > 0 ? (
									<div className='flex flex-wrap gap-2'>
										{patient.currentMedications.map((med) => (
											<Badge key={med} variant='secondary'>
												{med}
											</Badge>
										))}
									</div>
								) : (
									<p className='text-sm text-muted-foreground'>
										No current medications
									</p>
								)}
							</CardContent>
						</Card>

						<Card className='border-orange-200'>
							<CardHeader>
								<CardTitle className='text-lg flex items-center gap-2 text-orange-700'>
									<AlertTriangle className='h-5 w-5' />
									Allergies
								</CardTitle>
							</CardHeader>
							<CardContent>
								{patient.allergies.length > 0 ? (
									<div className='flex flex-wrap gap-2'>
										{patient.allergies.map((allergy) => (
											<Badge
												key={allergy}
												variant='outline'
												className='border-orange-300 bg-orange-50 text-orange-700'
											>
												{allergy}
											</Badge>
										))}
									</div>
								) : (
									<p className='text-sm text-muted-foreground'>
										No known allergies
									</p>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg flex items-center gap-2'>
									<Heart className='h-5 w-5' />
									Chronic Conditions
								</CardTitle>
							</CardHeader>
							<CardContent>
								{patient.chronicConditions.length > 0 ? (
									<div className='flex flex-wrap gap-2'>
										{patient.chronicConditions.map((condition) => (
											<Badge key={condition} variant='secondary'>
												{condition}
											</Badge>
										))}
									</div>
								) : (
									<p className='text-sm text-muted-foreground'>
										No chronic conditions
									</p>
								)}
							</CardContent>
						</Card>

						{patient.medicalHistory && (
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>Medical History</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-sm whitespace-pre-wrap'>
										{patient.medicalHistory}
									</p>
								</CardContent>
							</Card>
						)}
					</div>

					<div className='space-y-6'>
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<CardTitle className='text-lg flex items-center gap-2'>
										<FileText className='h-5 w-5' />
										Treatment Plans
									</CardTitle>
									<Badge variant='outline'>
										{patient.treatmentPlans?.length || 0}
									</Badge>
								</div>
								<CardDescription>Recent treatment history</CardDescription>
							</CardHeader>
							<CardContent>
								{patient.treatmentPlans && patient.treatmentPlans.length > 0 ? (
									<div className='space-y-3'>
										{patient.treatmentPlans.map((plan) => (
											<Link
												key={plan.id}
												href={`/dashboard/treatment-plans/${plan.id}`}
												className='block'
											>
												<div className='p-3 border rounded-lg hover:bg-muted/50 transition-colors'>
													<div className='flex items-start justify-between gap-2'>
														<p className='font-medium text-sm line-clamp-1'>
															{plan.chiefComplaint}
														</p>
														<StatusBadge status={plan.status} />
													</div>
													<div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground'>
														<span className='flex items-center gap-1'>
															<Clock className='h-3 w-3' />
															{formatDistanceToNow(new Date(plan.createdAt), {
																addSuffix: true,
															})}
														</span>
														<RiskBadge risk={plan.riskLevel} />
													</div>
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className='text-center py-6'>
										<FileText className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
										<p className='text-sm text-muted-foreground'>
											No treatment plans yet
										</p>
										<Link
											href={`/dashboard/treatment-plans/new?patientId=${id}`}
										>
											<Button variant='outline' size='sm' className='mt-3'>
												<Plus className='h-4 w-4 mr-2' />
												Create First Plan
											</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Record Info</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3 text-sm'>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Created</span>
									<span>
										{format(new Date(patient.createdAt), 'MMM d, yyyy')}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Last Updated</span>
									<span>
										{formatDistanceToNow(new Date(patient.updatedAt), {
											addSuffix: true,
										})}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<DeletePatientDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={handleDelete}
				patientName={patient.name}
				isLoading={isDeleting}
			/>
		</>
	)
}

