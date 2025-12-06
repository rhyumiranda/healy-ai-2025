'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ActiveSession, TwoFactorSetupResponse, ChangePasswordInput } from '../types'
import { SettingsService } from '../services/settings.service'

export function useSecurity() {
	const [sessions, setSessions] = useState<ActiveSession[]>([])
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
	const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [isTogglingTwoFactor, setIsTogglingTwoFactor] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchSessions = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await SettingsService.getActiveSessions()
			setSessions(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load sessions')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchSessions()
	}, [fetchSessions])

	const changePassword = useCallback(async (input: ChangePasswordInput) => {
		try {
			setIsChangingPassword(true)
			setError(null)
			await SettingsService.changePassword(input)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to change password'
			setError(message)
			throw err
		} finally {
			setIsChangingPassword(false)
		}
	}, [])

	const initiate2FASetup = useCallback(async () => {
		try {
			setIsTogglingTwoFactor(true)
			setError(null)
			const setup = await SettingsService.enable2FA()
			setTwoFactorSetup(setup)
			return setup
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to setup 2FA'
			setError(message)
			throw err
		} finally {
			setIsTogglingTwoFactor(false)
		}
	}, [])

	const verify2FA = useCallback(async (code: string) => {
		try {
			setIsTogglingTwoFactor(true)
			setError(null)
			const success = await SettingsService.verify2FA(code)
			if (success) {
				setTwoFactorEnabled(true)
				setTwoFactorSetup(null)
			}
			return success
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to verify 2FA code'
			setError(message)
			throw err
		} finally {
			setIsTogglingTwoFactor(false)
		}
	}, [])

	const disable2FA = useCallback(async () => {
		try {
			setIsTogglingTwoFactor(true)
			setError(null)
			await SettingsService.disable2FA()
			setTwoFactorEnabled(false)
			setTwoFactorSetup(null)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to disable 2FA'
			setError(message)
			throw err
		} finally {
			setIsTogglingTwoFactor(false)
		}
	}, [])

	const logoutSession = useCallback(async (sessionId: string) => {
		try {
			setIsLoggingOut(true)
			setError(null)
			await SettingsService.logoutSession(sessionId)
			setSessions(prev => prev.filter(s => s.id !== sessionId))
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to logout session'
			setError(message)
			throw err
		} finally {
			setIsLoggingOut(false)
		}
	}, [])

	const logoutAllSessions = useCallback(async () => {
		try {
			setIsLoggingOut(true)
			setError(null)
			await SettingsService.logoutAllSessions()
			setSessions(prev => prev.filter(s => s.isCurrent))
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to logout all sessions'
			setError(message)
			throw err
		} finally {
			setIsLoggingOut(false)
		}
	}, [])

	const cancel2FASetup = useCallback(() => {
		setTwoFactorSetup(null)
	}, [])

	return {
		sessions,
		twoFactorEnabled,
		twoFactorSetup,
		isLoading,
		isChangingPassword,
		isTogglingTwoFactor,
		isLoggingOut,
		error,
		changePassword,
		initiate2FASetup,
		verify2FA,
		disable2FA,
		cancel2FASetup,
		logoutSession,
		logoutAllSessions,
		refetch: fetchSessions,
	}
}
