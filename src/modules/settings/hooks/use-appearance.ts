'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import type { AppearanceSettings, UpdateAppearanceSettingsInput, Theme, FontSize } from '../types'
import { SettingsService } from '../services/settings.service'

export function useAppearance() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [settings, setSettings] = useState<AppearanceSettings | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchSettings = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await SettingsService.getAppearanceSettings()
			setSettings(data)
			if (data.theme) {
				setTheme(data.theme)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load appearance settings')
		} finally {
			setIsLoading(false)
		}
	}, [setTheme])

	useEffect(() => {
		fetchSettings()
	}, [fetchSettings])

	const updateSettings = useCallback(async (data: UpdateAppearanceSettingsInput) => {
		try {
			setIsSaving(true)
			setError(null)
			const updated = await SettingsService.updateAppearanceSettings(data)
			setSettings(updated)
			if (data.theme) {
				setTheme(data.theme)
			}
			return updated
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update settings'
			setError(message)
			throw err
		} finally {
			setIsSaving(false)
		}
	}, [setTheme])

	const changeTheme = useCallback(async (newTheme: Theme) => {
		setTheme(newTheme)
		await updateSettings({ theme: newTheme })
	}, [setTheme, updateSettings])

	const toggleCompactMode = useCallback(async () => {
		if (!settings) return
		await updateSettings({ compactMode: !settings.compactMode })
	}, [settings, updateSettings])

	const changeFontSize = useCallback(async (fontSize: FontSize) => {
		await updateSettings({ fontSize })
	}, [updateSettings])

	return {
		settings,
		theme: theme as Theme | undefined,
		resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
		isLoading,
		isSaving,
		error,
		updateSettings,
		changeTheme,
		toggleCompactMode,
		changeFontSize,
		refetch: fetchSettings,
	}
}
