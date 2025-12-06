'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { TreatmentPlanFilters as Filters, PlanStatus, RiskLevel } from '@/src/modules/treatment-plans'

interface TreatmentPlanFiltersProps {
	filters: Filters
	onFiltersChange: (filters: Filters) => void
}

const STATUS_TABS: { value: PlanStatus | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	{ value: 'APPROVED', label: 'Approved' },
	{ value: 'DRAFT', label: 'Draft' },
	{ value: 'REJECTED', label: 'Rejected' },
]

export function TreatmentPlanFilters({
	filters,
	onFiltersChange,
}: TreatmentPlanFiltersProps) {
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onFiltersChange({ ...filters, search: e.target.value, page: 1 })
	}

	const handleStatusChange = (status: PlanStatus | 'ALL') => {
		onFiltersChange({ ...filters, status, page: 1 })
	}

	const handleRiskChange = (riskLevel: RiskLevel | 'ALL') => {
		onFiltersChange({ ...filters, riskLevel, page: 1 })
	}

	const handleSortChange = (sortBy: Filters['sortBy']) => {
		onFiltersChange({ ...filters, sortBy, page: 1 })
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4">
				<div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
					{STATUS_TABS.map((tab) => (
						<Button
							key={tab.value}
							variant={filters.status === tab.value || (!filters.status && tab.value === 'ALL') ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => handleStatusChange(tab.value)}
							className="rounded-md whitespace-nowrap"
						>
							{tab.label}
						</Button>
					))}
				</div>

				<div className="flex flex-col sm:flex-row gap-2">
					<div className="relative flex-1 sm:flex-none">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search patient or condition..."
							value={filters.search || ''}
							onChange={handleSearchChange}
							className="pl-9 w-full sm:w-[250px]"
						/>
					</div>

					<div className="flex gap-2">
						<Select
							value={filters.riskLevel || 'ALL'}
							onValueChange={(value) => handleRiskChange(value as RiskLevel | 'ALL')}
						>
							<SelectTrigger className="flex-1 sm:w-[140px]">
								<SelectValue placeholder="Risk Level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Risks</SelectItem>
								<SelectItem value="LOW">Low Risk</SelectItem>
								<SelectItem value="MEDIUM">Medium Risk</SelectItem>
								<SelectItem value="HIGH">High Risk</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.sortBy || 'createdAt'}
							onValueChange={(value) => handleSortChange(value as Filters['sortBy'])}
						>
							<SelectTrigger className="flex-1 sm:w-[140px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="createdAt">Date</SelectItem>
								<SelectItem value="patientName">Patient</SelectItem>
								<SelectItem value="status">Status</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</div>
	)
}
