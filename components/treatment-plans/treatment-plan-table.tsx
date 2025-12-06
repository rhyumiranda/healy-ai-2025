'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText } from 'lucide-react'
import type { TreatmentPlanListItem } from '@/src/modules/treatment-plans'
import { StatusBadge } from './status-badge'
import { RiskBadge } from './risk-badge'

interface TreatmentPlanTableProps {
	plans: TreatmentPlanListItem[]
	isLoading: boolean
}

export function TreatmentPlanTable({ plans, isLoading }: TreatmentPlanTableProps) {
	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Patient</TableHead>
							<TableHead>Chief Complaint</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Risk Level</TableHead>
							<TableHead>Created</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-48" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	}

	if (plans.length === 0) {
		return (
			<div className="rounded-md border">
				<div className="flex flex-col items-center justify-center py-16">
					<div className="rounded-full bg-muted p-4 mb-4">
						<FileText className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-medium mb-1">No treatment plans found</h3>
					<p className="text-sm text-muted-foreground">
						Try adjusting your filters or create a new treatment plan.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Patient</TableHead>
						<TableHead>Chief Complaint</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Risk Level</TableHead>
						<TableHead>Created</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{plans.map((plan) => (
						<TableRow key={plan.id} className="cursor-pointer hover:bg-muted/50">
							<TableCell>
								<Link
									href={`/dashboard/treatment-plans/${plan.id}`}
									className="font-medium hover:underline"
								>
									{plan.patient.name}
								</Link>
							</TableCell>
							<TableCell className="max-w-[300px]">
								<span className="truncate block text-muted-foreground">
									{plan.chiefComplaint}
								</span>
							</TableCell>
							<TableCell>
								<StatusBadge status={plan.status} />
							</TableCell>
							<TableCell>
								<RiskBadge level={plan.riskLevel} />
							</TableCell>
							<TableCell className="text-muted-foreground">
								{formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
