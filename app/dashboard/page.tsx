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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
	const stats = [
		{
			title: 'Total Patients',
			value: '248',
			change: '+12%',
			icon: Users,
			trend: 'up',
		},
		{
			title: 'Active Treatment Plans',
			value: '42',
			change: '+8%',
			icon: FileText,
			trend: 'up',
		},
		{
			title: 'Safety Alerts',
			value: '3',
			change: '-5%',
			icon: AlertTriangle,
			trend: 'down',
		},
		{
			title: 'Avg. Response Time',
			value: '2.4h',
			change: '-15%',
			icon: Clock,
			trend: 'down',
		},
	]

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
								<BreadcrumbLink href='/dashboard'>
									HealyAI
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
				<div className='space-y-2'>
					<h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Dashboard</h2>
					<p className='text-muted-foreground text-sm sm:text-base'>
						Welcome back! Here&apos;s an overview of your practice.
					</p>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					{stats.map((stat) => {
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
										{stat.change} from last month
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
								{[
									{
										patient: 'John Doe',
										action: 'Treatment plan approved',
										time: '2 hours ago',
									},
									{
										patient: 'Jane Smith',
										action: 'New patient added',
										time: '4 hours ago',
									},
									{
										patient: 'Robert Johnson',
										action: 'AI analysis completed',
										time: '6 hours ago',
									},
									{
										patient: 'Emily Davis',
										action: 'Treatment plan modified',
										time: '1 day ago',
									},
								].map((item, index) => (
									<div key={index} className='flex items-center'>
										<div className='space-y-1'>
											<p className='text-sm font-medium leading-none'>
												{item.patient}
											</p>
											<p className='text-sm text-muted-foreground'>
												{item.action}
											</p>
										</div>
										<div className='ml-auto font-medium text-sm text-muted-foreground'>
											{item.time}
										</div>
									</div>
								))}
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
								<button className='w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors'>
									<FileText className='h-5 w-5 text-blue-600' />
									<div>
										<p className='font-medium text-sm'>New Treatment Plan</p>
										<p className='text-xs text-muted-foreground'>
											Start AI-powered analysis
										</p>
									</div>
								</button>
								<button className='w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors'>
									<Users className='h-5 w-5 text-green-600' />
									<div>
										<p className='font-medium text-sm'>Add New Patient</p>
										<p className='text-xs text-muted-foreground'>
											Register new patient
										</p>
									</div>
								</button>
								<button className='w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors'>
									<Activity className='h-5 w-5 text-purple-600' />
									<div>
										<p className='font-medium text-sm'>View Safety Alerts</p>
										<p className='text-xs text-muted-foreground'>
											Check drug interactions
										</p>
									</div>
								</button>
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
			</div>
		</>
	)
}
