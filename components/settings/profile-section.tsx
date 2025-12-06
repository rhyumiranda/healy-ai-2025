'use client'

import { useRef, useState } from 'react'
import { User, Upload, Loader2, Camera } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { UserProfile, UpdateProfileInput } from '@/src/modules/settings'
import { MEDICAL_SPECIALTIES } from '@/src/modules/settings'

interface ProfileSectionProps {
	profile: UserProfile | null
	isLoading: boolean
	isSaving: boolean
	isUploading: boolean
	onUpdate: (data: UpdateProfileInput) => Promise<UserProfile>
	onUploadAvatar: (file: File) => Promise<string>
}

function ProfileSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-5 bg-muted animate-pulse rounded' />
					<div className='h-5 w-24 bg-muted animate-pulse rounded' />
				</div>
				<div className='h-4 w-64 bg-muted animate-pulse rounded' />
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='flex items-center gap-6'>
					<div className='h-20 w-20 bg-muted animate-pulse rounded-full' />
					<div className='space-y-2'>
						<div className='h-4 w-32 bg-muted animate-pulse rounded' />
						<div className='h-9 w-28 bg-muted animate-pulse rounded' />
					</div>
				</div>
				<div className='grid gap-4 sm:grid-cols-2'>
					{[...Array(6)].map((_, i) => (
						<div key={i} className='space-y-2'>
							<div className='h-4 w-20 bg-muted animate-pulse rounded' />
							<div className='h-9 w-full bg-muted animate-pulse rounded' />
						</div>
					))}
				</div>
				<div className='h-9 w-28 bg-muted animate-pulse rounded' />
			</CardContent>
		</Card>
	)
}

export function ProfileSection({
	profile,
	isLoading,
	isSaving,
	isUploading,
	onUpdate,
	onUploadAvatar,
}: ProfileSectionProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [formData, setFormData] = useState<UpdateProfileInput>({})
	const [hasChanges, setHasChanges] = useState(false)

	if (isLoading) {
		return <ProfileSkeleton />
	}

	const handleInputChange = (field: keyof UpdateProfileInput, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		setHasChanges(true)
	}

	const handleAvatarClick = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			await onUploadAvatar(file)
		}
	}

	const handleSave = async () => {
		await onUpdate(formData)
		setHasChanges(false)
		setFormData({})
	}

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<User className='h-5 w-5 text-primary' />
					<CardTitle className='text-lg'>Profile</CardTitle>
				</div>
				<CardDescription>
					Your personal information and account details
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
					<div className='relative'>
						<Avatar className='h-20 w-20'>
							<AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
							<AvatarFallback className='text-lg'>
								{profile?.name ? getInitials(profile.name) : 'DR'}
							</AvatarFallback>
						</Avatar>
						<button
							onClick={handleAvatarClick}
							disabled={isUploading}
							className='absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50'
						>
							{isUploading ? (
								<Loader2 className='h-3.5 w-3.5 animate-spin' />
							) : (
								<Camera className='h-3.5 w-3.5' />
							)}
						</button>
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className='hidden'
						/>
					</div>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Profile Picture</p>
						<Button
							variant='outline'
							size='sm'
							onClick={handleAvatarClick}
							disabled={isUploading}
						>
							{isUploading ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Uploading...
								</>
							) : (
								<>
									<Upload className='h-4 w-4 mr-2' />
									Upload
								</>
							)}
						</Button>
					</div>
				</div>

				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Full Name</Label>
						<Input
							id='name'
							defaultValue={profile?.name || ''}
							placeholder='Dr. John Smith'
							onChange={(e) => handleInputChange('name', e.target.value)}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							type='email'
							defaultValue={profile?.email || ''}
							placeholder='doctor@example.com'
							disabled
							className='bg-muted'
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='specialty'>Specialty</Label>
						<Select
							defaultValue={profile?.specialty || ''}
							onValueChange={(value) => handleInputChange('specialty', value)}
						>
							<SelectTrigger id='specialty'>
								<SelectValue placeholder='Select specialty' />
							</SelectTrigger>
							<SelectContent>
								{MEDICAL_SPECIALTIES.map((specialty) => (
									<SelectItem key={specialty} value={specialty}>
										{specialty}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='license'>License Number</Label>
						<Input
							id='license'
							defaultValue={profile?.licenseNumber || ''}
							placeholder='MD-12345'
							onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='phone'>Phone Number</Label>
						<Input
							id='phone'
							type='tel'
							defaultValue={profile?.phoneNumber || ''}
							placeholder='+1 (555) 123-4567'
							onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='hospital'>Hospital/Clinic Affiliation</Label>
						<Input
							id='hospital'
							defaultValue={profile?.hospitalAffiliation || ''}
							placeholder='General Hospital'
							onChange={(e) => handleInputChange('hospitalAffiliation', e.target.value)}
						/>
					</div>
				</div>

				<Button onClick={handleSave} disabled={isSaving || !hasChanges}>
					{isSaving ? (
						<>
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
							Saving...
						</>
					) : (
						'Save Changes'
					)}
				</Button>
			</CardContent>
		</Card>
	)
}
