'use client'

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
import { ArrowLeft } from 'lucide-react'
import { TreatmentPlanWizard } from '@/components/treatment-plans'

export default function NewTreatmentPlanPage() {
	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
				<div className='flex items-center gap-2 px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem className='hidden md:block'>
								<BreadcrumbLink href='/dashboard/treatment-plans'>Treatment Plans</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className='hidden md:block' />
							<BreadcrumbItem>
								<BreadcrumbPage>New Treatment Plan</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className='flex flex-1 flex-col gap-6 p-4 pt-0 max-w-5xl'>
				<div className='flex items-center gap-4'>
					<Link href='/dashboard/treatment-plans'>
						<Button variant='ghost' size='icon' className='h-8 w-8'>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='text-2xl font-semibold tracking-tight'>New Treatment Plan</h1>
						<p className='text-sm text-muted-foreground'>
							Create an AI-powered treatment plan for your patient
						</p>
					</div>
				</div>

				<TreatmentPlanWizard />
			</div>
		</>
	)
}
