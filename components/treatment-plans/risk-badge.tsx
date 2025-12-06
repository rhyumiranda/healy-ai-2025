'use client'

import { Badge } from '@/components/ui/badge'
import type { RiskLevel } from '@/src/modules/treatment-plans'
import { RISK_CONFIG } from '@/src/modules/treatment-plans'

interface RiskBadgeProps {
	level: RiskLevel | null
}

export function RiskBadge({ level }: RiskBadgeProps) {
	if (!level) {
		return (
			<Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
				Not Assessed
			</Badge>
		)
	}

	const config = RISK_CONFIG[level]

	return (
		<Badge variant="outline" className={config.className}>
			{config.label}
		</Badge>
	)
}
