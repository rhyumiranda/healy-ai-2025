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
import { AuditFilters, AuditEventType, AuditSeverity } from '@/src/modules/audit/types'
import { Search, X, Download, ArrowUpDown } from 'lucide-react'

interface AuditLogFiltersProps {
	filters: AuditFilters
	onFiltersChange: (filters: AuditFilters) => void
	onExport: (format: 'json' | 'csv') => void
	isExporting?: boolean
}

const EVENT_TYPE_OPTIONS: { value: AuditEventType | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All Events' },
	{ value: 'login', label: 'Login' },
	{ value: 'logout', label: 'Logout' },
	{ value: 'login_failed', label: 'Failed Login' },
	{ value: 'patient_access', label: 'Patient Viewed' },
	{ value: 'patient_create', label: 'Patient Created' },
	{ value: 'patient_update', label: 'Patient Updated' },
	{ value: 'patient_delete', label: 'Patient Deleted' },
	{ value: 'treatment_plan_view', label: 'Treatment Plan Viewed' },
	{ value: 'treatment_plan_create', label: 'Treatment Plan Created' },
	{ value: 'treatment_plan_update', label: 'Treatment Plan Updated' },
	{ value: 'treatment_plan_delete', label: 'Treatment Plan Deleted' },
	{ value: 'treatment_plan_approve', label: 'Treatment Plan Approved' },
	{ value: 'treatment_plan_reject', label: 'Treatment Plan Rejected' },
	{ value: 'ai_analysis', label: 'AI Analysis' },
	{ value: 'safety_alert', label: 'Safety Alert' },
	{ value: 'data_export', label: 'Data Export' },
]

const SEVERITY_OPTIONS: { value: AuditSeverity | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All Severities' },
	{ value: 'info', label: 'Info' },
	{ value: 'warning', label: 'Warning' },
	{ value: 'error', label: 'Error' },
	{ value: 'critical', label: 'Critical' },
]

export function AuditLogFilters({
	filters,
	onFiltersChange,
	onExport,
	isExporting,
}: AuditLogFiltersProps) {
	const handleSearchChange = (value: string) => {
		onFiltersChange({ ...filters, search: value, page: 1 })
	}

	const handleEventTypeChange = (value: string) => {
		onFiltersChange({ 
			...filters, 
			eventType: value as AuditEventType | 'ALL',
			page: 1,
		})
	}

	const handleSeverityChange = (value: string) => {
		onFiltersChange({ 
			...filters, 
			severity: value as AuditSeverity | 'ALL',
			page: 1,
		})
	}

	const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
		onFiltersChange({ ...filters, [field]: value, page: 1 })
	}

	const handleSortOrderToggle = () => {
		onFiltersChange({
			...filters,
			sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc',
		})
	}

	const handleClearFilters = () => {
		onFiltersChange({
			search: '',
			eventType: 'ALL',
			severity: 'ALL',
			startDate: undefined,
			endDate: undefined,
			sortOrder: 'desc',
			page: 1,
			pageSize: 20,
		})
	}

	const hasActiveFilters = 
		filters.search || 
		(filters.eventType && filters.eventType !== 'ALL') ||
		(filters.severity && filters.severity !== 'ALL') ||
		filters.startDate ||
		filters.endDate

	return (
		<div className='space-y-4'>
			<div className='flex flex-col sm:flex-row gap-4'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search activity...'
						value={filters.search || ''}
						onChange={(e) => handleSearchChange(e.target.value)}
						className='pl-9'
					/>
				</div>
				
				<Select
					value={filters.eventType || 'ALL'}
					onValueChange={handleEventTypeChange}
				>
					<SelectTrigger className='w-full sm:w-[200px]'>
						<SelectValue placeholder='Event Type' />
					</SelectTrigger>
					<SelectContent>
						{EVENT_TYPE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={filters.severity || 'ALL'}
					onValueChange={handleSeverityChange}
				>
					<SelectTrigger className='w-full sm:w-[150px]'>
						<SelectValue placeholder='Severity' />
					</SelectTrigger>
					<SelectContent>
						{SEVERITY_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground whitespace-nowrap'>From:</span>
						<Input
							type='date'
							value={filters.startDate || ''}
							onChange={(e) => handleDateChange('startDate', e.target.value)}
							className='w-full sm:w-auto'
						/>
					</div>
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground whitespace-nowrap'>To:</span>
						<Input
							type='date'
							value={filters.endDate || ''}
							onChange={(e) => handleDateChange('endDate', e.target.value)}
							className='w-full sm:w-auto'
						/>
					</div>
				</div>

				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={handleSortOrderToggle}
					>
						<ArrowUpDown className='h-4 w-4 mr-1' />
						{filters.sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
					</Button>

					{hasActiveFilters && (
						<Button
							variant='ghost'
							size='sm'
							onClick={handleClearFilters}
						>
							<X className='h-4 w-4 mr-1' />
							Clear
						</Button>
					)}

					<Button
						variant='outline'
						size='sm'
						onClick={() => onExport('csv')}
						disabled={isExporting}
					>
						<Download className='h-4 w-4 mr-1' />
						Export CSV
					</Button>
				</div>
			</div>
		</div>
	)
}
