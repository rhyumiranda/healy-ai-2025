'use client'

import { useState } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	AuditLogEntry,
	EVENT_TYPE_LABELS,
	SEVERITY_COLORS,
} from '@/src/modules/audit/types'
import { 
	ChevronLeft,
	ChevronRight,
	CheckCircle2,
	XCircle,
	Eye,
	LogIn,
	LogOut,
	UserPlus,
	UserMinus,
	FileEdit,
	FilePlus,
	FileX,
	FileCheck,
	Brain,
	AlertTriangle,
	Shield,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface AuditLogTableProps {
	logs: AuditLogEntry[]
	total: number
	page: number
	pageSize: number
	totalPages: number
	isLoading?: boolean
	onPageChange: (page: number) => void
}

function getEventIcon(eventType: string) {
	if (eventType.includes('login')) return <LogIn className='h-4 w-4' />
	if (eventType === 'logout') return <LogOut className='h-4 w-4' />
	if (eventType.includes('patient_create')) return <UserPlus className='h-4 w-4' />
	if (eventType.includes('patient_delete')) return <UserMinus className='h-4 w-4' />
	if (eventType.includes('patient')) return <Eye className='h-4 w-4' />
	if (eventType.includes('treatment_plan_create')) return <FilePlus className='h-4 w-4' />
	if (eventType.includes('treatment_plan_delete')) return <FileX className='h-4 w-4' />
	if (eventType.includes('treatment_plan_approve') || eventType.includes('treatment_plan_reject')) return <FileCheck className='h-4 w-4' />
	if (eventType.includes('treatment_plan')) return <FileEdit className='h-4 w-4' />
	if (eventType.includes('ai')) return <Brain className='h-4 w-4' />
	if (eventType.includes('safety')) return <AlertTriangle className='h-4 w-4' />
	if (eventType.includes('phi') || eventType.includes('authorization')) return <Shield className='h-4 w-4' />
	return <Eye className='h-4 w-4' />
}

function formatTimestamp(timestamp: string) {
	const date = new Date(timestamp)
	return {
		relative: formatDistanceToNow(date, { addSuffix: true }),
		absolute: format(date, 'MMM d, yyyy h:mm:ss a'),
	}
}

export function AuditLogTable({
	logs,
	total,
	page,
	pageSize,
	totalPages,
	isLoading,
	onPageChange,
}: AuditLogTableProps) {
	const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[180px]'>Time</TableHead>
								<TableHead>Event</TableHead>
								<TableHead>Action</TableHead>
								<TableHead>Severity</TableHead>
								<TableHead className='text-center'>Status</TableHead>
								<TableHead className='w-[80px]'></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...Array(5)].map((_, i) => (
								<TableRow key={i}>
									<TableCell><Skeleton className='h-4 w-32' /></TableCell>
									<TableCell><Skeleton className='h-4 w-24' /></TableCell>
									<TableCell><Skeleton className='h-4 w-40' /></TableCell>
									<TableCell><Skeleton className='h-4 w-16' /></TableCell>
									<TableCell><Skeleton className='h-4 w-16 mx-auto' /></TableCell>
									<TableCell><Skeleton className='h-8 w-8' /></TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		)
	}

	if (logs.length === 0) {
		return (
			<div className='rounded-md border p-8 text-center'>
				<p className='text-muted-foreground'>No activity logs found</p>
			</div>
		)
	}

	return (
		<>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[180px]'>Time</TableHead>
							<TableHead>Event</TableHead>
							<TableHead>Action</TableHead>
							<TableHead>Severity</TableHead>
							<TableHead className='text-center'>Status</TableHead>
							<TableHead className='w-[80px]'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.map((log) => {
							const time = formatTimestamp(log.timestamp)
							return (
								<TableRow key={log.id}>
									<TableCell>
										<div className='flex flex-col'>
											<span className='text-sm font-medium'>{time.relative}</span>
											<span className='text-xs text-muted-foreground'>{time.absolute}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											{getEventIcon(log.eventType)}
											<span className='font-medium'>
												{EVENT_TYPE_LABELS[log.eventType] || log.eventType}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<span className='text-sm'>{log.action}</span>
									</TableCell>
									<TableCell>
										<Badge 
											variant='secondary'
											className={SEVERITY_COLORS[log.severity]}
										>
											{log.severity}
										</Badge>
									</TableCell>
									<TableCell className='text-center'>
										{log.success ? (
											<CheckCircle2 className='h-5 w-5 text-green-500 inline-block' />
										) : (
											<XCircle className='h-5 w-5 text-red-500 inline-block' />
										)}
									</TableCell>
									<TableCell>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => setSelectedLog(log)}
										>
											<Eye className='h-4 w-4' />
										</Button>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			<div className='flex items-center justify-between mt-4'>
				<p className='text-sm text-muted-foreground'>
					Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries
				</p>
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onPageChange(page - 1)}
						disabled={page <= 1}
					>
						<ChevronLeft className='h-4 w-4' />
						Previous
					</Button>
					<span className='text-sm text-muted-foreground'>
						Page {page} of {totalPages}
					</span>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onPageChange(page + 1)}
						disabled={page >= totalPages}
					>
						Next
						<ChevronRight className='h-4 w-4' />
					</Button>
				</div>
			</div>

			<Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
				<DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							{selectedLog && getEventIcon(selectedLog.eventType)}
							Activity Details
						</DialogTitle>
						<DialogDescription>
							Full details of the audit log entry
						</DialogDescription>
					</DialogHeader>
					{selectedLog && <AuditLogDetails log={selectedLog} />}
				</DialogContent>
			</Dialog>
		</>
	)
}

function AuditLogDetails({ log }: { log: AuditLogEntry }) {
	const time = formatTimestamp(log.timestamp)

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='text-sm font-medium text-muted-foreground'>Event Type</label>
					<p className='text-sm'>{EVENT_TYPE_LABELS[log.eventType] || log.eventType}</p>
				</div>
				<div>
					<label className='text-sm font-medium text-muted-foreground'>Severity</label>
					<p>
						<Badge variant='secondary' className={SEVERITY_COLORS[log.severity]}>
							{log.severity}
						</Badge>
					</p>
				</div>
				<div>
					<label className='text-sm font-medium text-muted-foreground'>Timestamp</label>
					<p className='text-sm'>{time.absolute}</p>
				</div>
				<div>
					<label className='text-sm font-medium text-muted-foreground'>Status</label>
					<p className='flex items-center gap-1 text-sm'>
						{log.success ? (
							<>
								<CheckCircle2 className='h-4 w-4 text-green-500' />
								Success
							</>
						) : (
							<>
								<XCircle className='h-4 w-4 text-red-500' />
								Failed
							</>
						)}
					</p>
				</div>
			</div>

			<div>
				<label className='text-sm font-medium text-muted-foreground'>Action</label>
				<p className='text-sm'>{log.action}</p>
			</div>

			{log.errorMessage && (
				<div>
					<label className='text-sm font-medium text-muted-foreground'>Error Message</label>
					<p className='text-sm text-red-600'>{log.errorMessage}</p>
				</div>
			)}

			<div className='grid grid-cols-2 gap-4'>
				{log.resourceType && (
					<div>
						<label className='text-sm font-medium text-muted-foreground'>Resource Type</label>
						<p className='text-sm'>{log.resourceType}</p>
					</div>
				)}
				{log.resourceId && (
					<div>
						<label className='text-sm font-medium text-muted-foreground'>Resource ID</label>
						<p className='text-sm font-mono text-xs'>{log.resourceId}</p>
					</div>
				)}
				{log.patientId && (
					<div>
						<label className='text-sm font-medium text-muted-foreground'>Patient ID</label>
						<p className='text-sm font-mono text-xs'>{log.patientId}</p>
					</div>
				)}
				{log.durationMs && (
					<div>
						<label className='text-sm font-medium text-muted-foreground'>Duration</label>
						<p className='text-sm'>{log.durationMs}ms</p>
					</div>
				)}
			</div>

			{log.phiAccessed && (
				<div>
					<label className='text-sm font-medium text-muted-foreground'>PHI Access</label>
					<p className='flex items-center gap-1 text-sm'>
						<Shield className='h-4 w-4 text-amber-500' />
						Protected Health Information was accessed
						{log.phiFields && log.phiFields.length > 0 && (
							<span className='text-muted-foreground'>
								({log.phiFields.join(', ')})
							</span>
						)}
					</p>
				</div>
			)}

			{log.ipAddress && (
				<div>
					<label className='text-sm font-medium text-muted-foreground'>IP Address</label>
					<p className='text-sm font-mono'>{log.ipAddress}</p>
				</div>
			)}

			{Object.keys(log.details).length > 0 && (
				<div>
					<label className='text-sm font-medium text-muted-foreground'>Additional Details</label>
					<pre className='mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto'>
						{JSON.stringify(log.details, null, 2)}
					</pre>
				</div>
			)}

			<div className='pt-2 border-t'>
				<label className='text-sm font-medium text-muted-foreground'>Log ID</label>
				<p className='text-xs font-mono text-muted-foreground'>{log.id}</p>
			</div>
		</div>
	)
}
