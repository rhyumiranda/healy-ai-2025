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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function TreatmentPlansPage() {
	const treatmentPlans = [
		{
			id: '1',
			patient: 'John Doe',
			condition: 'Hypertension Management',
			status: 'approved',
			createdAt: '2024-12-01',
			riskLevel: 'low',
		},
		{
			id: '2',
			patient: 'Jane Smith',
			condition: 'Diabetes Type 2 Treatment',
			status: 'pending',
			createdAt: '2024-11-30',
			riskLevel: 'medium',
		},
		{
			id: '3',
			patient: 'Robert Johnson',
			condition: 'Cardiac Care Plan',
			status: 'approved',
			createdAt: '2024-11-28',
			riskLevel: 'high',
		},
		{
			id: '4',
			patient: 'Emily Davis',
			condition: 'Asthma Management',
			status: 'draft',
			createdAt: '2024-11-25',
			riskLevel: 'low',
		},
	]

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'approved':
				return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Approved</Badge>
			case 'pending':
				return <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>Pending Review</Badge>
			case 'draft':
				return <Badge variant='secondary'>Draft</Badge>
			default:
				return <Badge variant='outline'>{status}</Badge>
		}
	}

	const getRiskBadge = (risk: string) => {
		switch (risk) {
			case 'low':
				return <Badge variant='outline' className='text-green-600 border-green-600'>Low Risk</Badge>
			case 'medium':
				return <Badge variant='outline' className='text-yellow-600 border-yellow-600'>Medium Risk</Badge>
			case 'high':
				return <Badge variant='outline' className='text-red-600 border-red-600'>High Risk</Badge>
			default:
				return null
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'approved':
				return <CheckCircle className='h-5 w-5 text-green-600' />
			case 'pending':
				return <Clock className='h-5 w-5 text-yellow-600' />
			case 'draft':
				return <FileText className='h-5 w-5 text-muted-foreground' />
			default:
				return <AlertCircle className='h-5 w-5' />
		}
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
							<BreadcrumbItem>
								<BreadcrumbPage>Treatment Plans</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<h2 className='text-3xl font-bold tracking-tight'>Treatment Plans</h2>
						<p className='text-muted-foreground'>
							View and manage all treatment plans
						</p>
					</div>
					<Button asChild>
						<Link href='/dashboard/treatment-plans/new'>
							<Plus className='mr-2 h-4 w-4' />
							New Treatment Plan
						</Link>
					</Button>
				</div>

				<div className='flex gap-2'>
					<Button variant='outline' size='sm'>All</Button>
					<Button variant='ghost' size='sm'>Approved</Button>
					<Button variant='ghost' size='sm'>Pending</Button>
					<Button variant='ghost' size='sm'>Draft</Button>
				</div>

				<div className='space-y-4'>
					{treatmentPlans.map((plan) => (
						<Card key={plan.id} className='cursor-pointer hover:bg-muted/50 transition-colors'>
							<CardHeader className='pb-3'>
								<div className='flex items-start justify-between'>
									<div className='flex items-center gap-3'>
										{getStatusIcon(plan.status)}
										<div>
											<CardTitle className='text-base'>{plan.condition}</CardTitle>
											<CardDescription>Patient: {plan.patient}</CardDescription>
										</div>
									</div>
									<div className='flex items-center gap-2'>
										{getRiskBadge(plan.riskLevel)}
										{getStatusBadge(plan.status)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className='flex items-center justify-between text-sm text-muted-foreground'>
									<span>Created: {plan.createdAt}</span>
									<Button variant='ghost' size='sm'>View Details</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</>
	)
}
