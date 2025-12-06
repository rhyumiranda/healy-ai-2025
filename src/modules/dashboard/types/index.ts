export interface DashboardStats {
	totalPatients: number
	patientChange: number
	activeTreatmentPlans: number
	planChange: number
	safetyAlerts: number
}

export interface RecentActivity {
	id: string
	type: 'treatment_plan' | 'patient'
	patientId: string
	patientName: string
	action: string
	timestamp: Date | string
}

export interface DashboardResponse {
	stats: DashboardStats
	recentActivity: RecentActivity[]
}
