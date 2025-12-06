'use client'

import { useState, useEffect, useCallback } from 'react'
import { AuditLogsResponse, AuditStatsResponse, AuditFilters } from '../types'

async function fetchAuditLogs(filters: AuditFilters): Promise<AuditLogsResponse> {
	const params = new URLSearchParams()
	
	if (filters.page) params.set('page', filters.page.toString())
	if (filters.pageSize) params.set('pageSize', filters.pageSize.toString())
	if (filters.search) params.set('search', filters.search)
	if (filters.eventType && filters.eventType !== 'ALL') params.set('eventType', filters.eventType)
	if (filters.severity && filters.severity !== 'ALL') params.set('severity', filters.severity)
	if (filters.startDate) params.set('startDate', filters.startDate)
	if (filters.endDate) params.set('endDate', filters.endDate)
	if (filters.success !== undefined && filters.success !== 'ALL') {
		params.set('success', filters.success.toString())
	}
	if (filters.patientId) params.set('patientId', filters.patientId)
	if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

	const response = await fetch(`/api/audit-logs?${params.toString()}`)
	
	if (!response.ok) {
		throw new Error('Failed to fetch audit logs')
	}

	return response.json()
}

async function fetchAuditStats(startDate?: string, endDate?: string): Promise<AuditStatsResponse> {
	const params = new URLSearchParams()
	
	if (startDate) params.set('startDate', startDate)
	if (endDate) params.set('endDate', endDate)

	const response = await fetch(`/api/audit-logs/stats?${params.toString()}`)
	
	if (!response.ok) {
		throw new Error('Failed to fetch audit stats')
	}

	return response.json()
}

export function useAuditLogs(filters: AuditFilters = {}) {
	const [data, setData] = useState<AuditLogsResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const response = await fetchAuditLogs(filters)
			setData(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch audit logs'))
		} finally {
			setIsLoading(false)
		}
	}, [
		filters.page, 
		filters.pageSize, 
		filters.search, 
		filters.eventType, 
		filters.severity,
		filters.startDate,
		filters.endDate,
		filters.success,
		filters.patientId,
		filters.sortOrder,
	])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const refetch = useCallback(() => {
		fetchData()
	}, [fetchData])

	return {
		data,
		isLoading,
		error,
		refetch,
	}
}

export function useAuditStats(startDate?: string, endDate?: string) {
	const [data, setData] = useState<AuditStatsResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const response = await fetchAuditStats(startDate, endDate)
			setData(response)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch audit stats'))
		} finally {
			setIsLoading(false)
		}
	}, [startDate, endDate])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	return {
		data,
		isLoading,
		error,
	}
}

export function useExportAuditLogs() {
	const exportLogs = async (options: {
		format: 'json' | 'csv'
		startDate: string
		endDate: string
		patientId?: string
	}) => {
		const response = await fetch('/api/audit-logs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(options),
		})

		if (!response.ok) {
			throw new Error('Failed to export audit logs')
		}

		const blob = await response.blob()
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${options.format}`
		document.body.appendChild(a)
		a.click()
		window.URL.revokeObjectURL(url)
		document.body.removeChild(a)
	}

	return { exportLogs }
}
