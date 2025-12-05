'use client'

import { useSession } from 'next-auth/react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Bell, Shield, Palette } from 'lucide-react'

export default function SettingsPage() {
	const { data: session } = useSession()

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
								<BreadcrumbPage>Settings</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
				<div className='space-y-1'>
					<h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
					<p className='text-muted-foreground'>
						Manage your account settings and preferences
					</p>
				</div>

				<div className='grid gap-6'>
					<Card>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<User className='h-5 w-5' />
								<CardTitle>Profile</CardTitle>
							</div>
							<CardDescription>
								Your personal information and account details
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										id='name'
										defaultValue={session?.user?.name || ''}
										placeholder='Dr. John Smith'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										type='email'
										defaultValue={session?.user?.email || ''}
										placeholder='doctor@example.com'
										disabled
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='specialty'>Specialty</Label>
									<Input
										id='specialty'
										placeholder='Internal Medicine'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='license'>License Number</Label>
									<Input
										id='license'
										placeholder='MD-12345'
									/>
								</div>
							</div>
							<Button>Save Changes</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<Bell className='h-5 w-5' />
								<CardTitle>Notifications</CardTitle>
							</div>
							<CardDescription>
								Configure how you receive notifications
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Safety Alerts</p>
									<p className='text-sm text-muted-foreground'>
										Get notified about drug interactions and risks
									</p>
								</div>
								<Button variant='outline' size='sm'>Enabled</Button>
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Treatment Plan Updates</p>
									<p className='text-sm text-muted-foreground'>
										Notifications when plans are approved or modified
									</p>
								</div>
								<Button variant='outline' size='sm'>Enabled</Button>
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Email Notifications</p>
									<p className='text-sm text-muted-foreground'>
										Receive updates via email
									</p>
								</div>
								<Button variant='ghost' size='sm'>Disabled</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<Shield className='h-5 w-5' />
								<CardTitle>Security</CardTitle>
							</div>
							<CardDescription>
								Manage your security settings
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Change Password</p>
									<p className='text-sm text-muted-foreground'>
										Update your account password
									</p>
								</div>
								<Button variant='outline' size='sm'>Change</Button>
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Two-Factor Authentication</p>
									<p className='text-sm text-muted-foreground'>
										Add an extra layer of security
									</p>
								</div>
								<Button variant='outline' size='sm'>Enable</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<Palette className='h-5 w-5' />
								<CardTitle>Appearance</CardTitle>
							</div>
							<CardDescription>
								Customize the look and feel of the application
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Theme</p>
									<p className='text-sm text-muted-foreground'>
										Choose between light and dark mode
									</p>
								</div>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm'>Light</Button>
									<Button variant='outline' size='sm'>Dark</Button>
									<Button variant='secondary' size='sm'>System</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	)
}
