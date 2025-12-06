'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, FileText } from 'lucide-react'
import type { Patient } from '@/src/modules/patients'

interface PatientTableProps {
	patients: Patient[]
	isLoading?: boolean
}

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

function GenderBadge({ gender }: { gender: string }) {
	const colors: Record<string, string> = {
		MALE: 'bg-blue-50 text-blue-700 border-blue-200',
		FEMALE: 'bg-pink-50 text-pink-700 border-pink-200',
		OTHER: 'bg-purple-50 text-purple-700 border-purple-200',
	}

	return (
		<Badge variant='outline' className={colors[gender] || ''}>
			{gender.charAt(0) + gender.slice(1).toLowerCase()}
		</Badge>
	)
}

export function PatientTable({ patients, isLoading }: PatientTableProps) {
	const router = useRouter()

	if (isLoading) {
		return (
			<div className='border rounded-lg'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[250px]'>Patient</TableHead>
							<TableHead>Gender</TableHead>
							<TableHead>Conditions</TableHead>
							<TableHead>Plans</TableHead>
							<TableHead>Last Updated</TableHead>
							<TableHead className='w-[50px]' />
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(5)].map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<div className='space-y-2'>
										<div className='h-4 w-32 bg-muted animate-pulse rounded' />
										<div className='h-3 w-20 bg-muted animate-pulse rounded' />
									</div>
								</TableCell>
								<TableCell>
									<div className='h-5 w-16 bg-muted animate-pulse rounded' />
								</TableCell>
								<TableCell>
									<div className='h-5 w-24 bg-muted animate-pulse rounded' />
								</TableCell>
								<TableCell>
									<div className='h-5 w-8 bg-muted animate-pulse rounded' />
								</TableCell>
								<TableCell>
									<div className='h-4 w-20 bg-muted animate-pulse rounded' />
								</TableCell>
								<TableCell />
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	}

	if (patients.length === 0) {
		return (
			<div className='border rounded-lg p-12 text-center'>
				<div className='mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4'>
					<FileText className='h-6 w-6 text-muted-foreground' />
				</div>
				<h3 className='font-medium text-lg'>No patients found</h3>
				<p className='text-muted-foreground text-sm mt-1'>
					Get started by adding your first patient
				</p>
			</div>
		)
	}

	return (
		<div className='border rounded-lg'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[250px]'>Patient</TableHead>
						<TableHead>Gender</TableHead>
						<TableHead>Conditions</TableHead>
						<TableHead>Plans</TableHead>
						<TableHead>Last Updated</TableHead>
						<TableHead className='w-[50px]' />
					</TableRow>
				</TableHeader>
				<TableBody>
					{patients.map((patient) => (
						<TableRow
							key={patient.id}
							className='cursor-pointer hover:bg-muted/50 transition-colors'
							onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
						>
							<TableCell>
								<div>
									<p className='font-medium'>{patient.name}</p>
									<p className='text-sm text-muted-foreground'>
										{calculateAge(patient.dateOfBirth)} years old
									</p>
								</div>
							</TableCell>
							<TableCell>
								<GenderBadge gender={patient.gender} />
							</TableCell>
							<TableCell>
								{patient.chronicConditions.length > 0 ? (
									<div className='flex flex-wrap gap-1'>
										{patient.chronicConditions.slice(0, 2).map((condition) => (
											<Badge
												key={condition}
												variant='secondary'
												className='text-xs font-normal'
											>
												{condition}
											</Badge>
										))}
										{patient.chronicConditions.length > 2 && (
											<Badge variant='secondary' className='text-xs font-normal'>
												+{patient.chronicConditions.length - 2}
											</Badge>
										)}
									</div>
								) : (
									<span className='text-muted-foreground text-sm'>—</span>
								)}
							</TableCell>
							<TableCell>
								<span className='text-sm'>
									{patient._count?.treatmentPlans || 0}
								</span>
							</TableCell>
							<TableCell>
								<span className='text-sm text-muted-foreground'>
									{formatDistanceToNow(new Date(patient.updatedAt), {
										addSuffix: true,
									})}
								</span>
							</TableCell>
							<TableCell>
								<ChevronRight className='h-4 w-4 text-muted-foreground' />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

