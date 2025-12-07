'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, FileText, AlertTriangle, Clock } from 'lucide-react'
import type { DashboardStats, RecentActivity } from '@/src/modules/dashboard/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

function formatTimeAgo(timestamp: Date | string): string {
	const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
	return formatDistanceToNow(date, { addSuffix: true })
}

interface DashboardContentClientProps {
	stats: DashboardStats
	recentActivity: RecentActivity[]
}

export function DashboardContentClient({ stats, recentActivity }: DashboardContentClientProps) {
	const statsConfig = [
		{
			title: 'Total Patients',
			value: stats.totalPatients,
			change: stats.patientChange,
			icon: Users,
			trend: stats.patientChange >= 0 ? 'up' : 'down',
		},
		{
			title: 'Active Treatment Plans',
			value: stats.activeTreatmentPlans,
			change: stats.planChange,
			icon: FileText,
			trend: stats.planChange >= 0 ? 'up' : 'down',
		},
		{
			title: 'Safety Alerts',
			value: stats.safetyAlerts,
			change: 0,
			icon: AlertTriangle,
			trend: 'down' as const,
		},
		{
			title: 'Avg. Response Time',
			value: '2.4h',
			change: -15,
			icon: Clock,
			trend: 'down' as const,
		},
	]

	return (
		<>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{statsConfig.map((stat) => {
					const Icon = stat.icon
					return (
						<Card key={stat.title}>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									{stat.title}
								</CardTitle>
								<Icon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stat.value}</div>
								<p
									className={`text-xs ${
										stat.trend === 'up'
											? 'text-green-600'
											: 'text-blue-600'
									}`}
								>
									{stat.change >= 0 ? '+' : ''}{stat.change}% from last month
								</p>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<div className='grid gap-4 lg:grid-cols-7'>
				<Card className='lg:col-span-4'>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your recent treatment plans and patient interactions
						</CardDescription>
					</CardHeader>
					<CardContent className='pl-2'>
						<div className='space-y-8'>
							{recentActivity.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									<p>No recent activity</p>
									<p className='text-sm'>Start by adding a patient or creating a treatment plan</p>
								</div>
							) : (
								recentActivity.map((item) => (
									<Link
										key={`${item.type}-${item.id}`}
										href={item.type === 'patient' ? `/dashboard/patients/${item.patientId}` : `/dashboard/treatment-plans/${item.id}`}
										className='flex items-center hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md transition-colors'
									>
										<div className='space-y-1'>
											<p className='text-sm font-medium leading-none'>
												{item.patientName}
											</p>
											<p className='text-sm text-muted-foreground'>
												{item.action}
											</p>
										</div>
										<div className='ml-auto font-medium text-sm text-muted-foreground'>
											{formatTimeAgo(item.timestamp)}
										</div>
									</Link>
								))
							)}
						</div>
					</CardContent>
				</Card>
				<Card className='lg:col-span-3'>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Frequently used actions for your workflow
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							<Link href='/dashboard/treatment-plans/new' className='w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors'>
								<FileText className='h-5 w-5 text-blue-600' />
								<div>
									<p className='font-medium text-sm'>New Treatment Plan</p>
									<p className='text-xs text-muted-foreground'>
										Start AI-powered analysis
									</p>
								</div>
							</Link>
							<Link href='/dashboard/patients/new' className='w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors'>
								<Users className='h-5 w-5 text-green-600' />
								<div>
									<p className='font-medium text-sm'>Add New Patient</p>
									<p className='text-xs text-muted-foreground'>
										Register new patient
									</p>
								</div>
							</Link>
							<Link href='/dashboard/treatment-plans?riskLevel=HIGH' className='w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors'>
								<Activity className='h-5 w-5 text-purple-600' />
								<div>
									<p className='font-medium text-sm'>View Safety Alerts</p>
									<p className='text-xs text-muted-foreground'>
										Check drug interactions
									</p>
								</div>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>System Status</CardTitle>
					<CardDescription>
						AI service health and system performance
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-green-500' />
								<span className='text-sm font-medium'>
									AI Analysis Service
								</span>
							</div>
							<span className='text-sm text-muted-foreground'>
								Operational
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-green-500' />
								<span className='text-sm font-medium'>
									Drug Interaction Database
								</span>
							</div>
							<span className='text-sm text-muted-foreground'>
								Operational
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-green-500' />
								<span className='text-sm font-medium'>Patient Records</span>
							</div>
							<span className='text-sm text-muted-foreground'>
								Operational
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	)
}

