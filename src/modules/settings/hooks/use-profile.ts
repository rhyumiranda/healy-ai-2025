'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserProfile, UpdateProfileInput } from '../types'
import { SettingsService } from '../services/settings.service'

export function useProfile() {
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchProfile = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await SettingsService.getProfile()
			setProfile(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load profile')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchProfile()
	}, [fetchProfile])

	const updateProfile = useCallback(async (data: UpdateProfileInput) => {
		try {
			setIsSaving(true)
			setError(null)
			const updated = await SettingsService.updateProfile(data)
			setProfile(updated)
			return updated
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update profile'
			setError(message)
			throw err
		} finally {
			setIsSaving(false)
		}
	}, [])

	const uploadAvatar = useCallback(async (file: File) => {
		try {
			setIsUploading(true)
			setError(null)
			const { url } = await SettingsService.uploadAvatar(file)
			if (profile) {
				setProfile({ ...profile, avatarUrl: url })
			}
			return url
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to upload avatar'
			setError(message)
			throw err
		} finally {
			setIsUploading(false)
		}
	}, [profile])

	return {
		profile,
		isLoading,
		isSaving,
		isUploading,
		error,
		updateProfile,
		uploadAvatar,
		refetch: fetchProfile,
	}
}
