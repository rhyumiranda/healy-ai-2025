'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NotificationPreferences, UpdateNotificationPreferencesInput } from '../types'
import { SettingsService } from '../services/settings.service'

export function useNotifications() {
	const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchPreferences = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await SettingsService.getNotificationPreferences()
			setPreferences(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load notification preferences')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchPreferences()
	}, [fetchPreferences])

	const updatePreferences = useCallback(async (data: UpdateNotificationPreferencesInput) => {
		try {
			setIsSaving(true)
			setError(null)
			const updated = await SettingsService.updateNotificationPreferences(data)
			setPreferences(updated)
			return updated
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update preferences'
			setError(message)
			throw err
		} finally {
			setIsSaving(false)
		}
	}, [])

	const togglePreference = useCallback(async (key: keyof Omit<NotificationPreferences, 'frequency'>) => {
		if (!preferences) return
		const newValue = !preferences[key]
		await updatePreferences({ [key]: newValue })
	}, [preferences, updatePreferences])

	return {
		preferences,
		isLoading,
		isSaving,
		error,
		updatePreferences,
		togglePreference,
		refetch: fetchPreferences,
	}
}
