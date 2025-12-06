import type { DashboardResponse } from '../types'

export class DashboardService {
	static async getDashboardStats(): Promise<DashboardResponse> {
		const response = await fetch('/api/dashboard/stats', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to fetch dashboard stats')
		}

		return response.json()
	}
}
