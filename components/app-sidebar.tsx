'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import {
	LayoutDashboard,
	Users,
	FileText,
	Plus,
	Settings,
	Activity,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession()

	const data = {
		user: {
			name: session?.user?.name || 'Guest User',
			email: session?.user?.email || '',
			avatar: (session?.user as { image?: string } | undefined)?.image || '',
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/dashboard',
				icon: LayoutDashboard,
				isActive: true,
			},
			{
				title: 'Patients',
				url: '/dashboard/patients',
				icon: Users,
			},
			{
				title: 'New Treatment',
				url: '/dashboard/treatment-plans/new',
				icon: Plus,
			},
			{
				title: 'Treatment Plans',
				url: '/dashboard/treatment-plans',
				icon: FileText,
			},
			{
				title: 'Activity Log',
				url: '/dashboard/activity',
				icon: Activity,
			},
			{
				title: 'Settings',
				url: '/dashboard/settings',
				icon: Settings,
			},
		],
	}

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<div className='flex items-center px-4 py-2'>
					<div className='grid flex-1 text-left text-sm leading-tight'>
						<span className='truncate font-semibold'>HealyAI</span>
						<span className='truncate text-xs text-muted-foreground'>
							Treatment Assistant
						</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
