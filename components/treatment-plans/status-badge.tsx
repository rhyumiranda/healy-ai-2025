'use client'

import { Badge } from '@/components/ui/badge'
import type { PlanStatus } from '@/src/modules/treatment-plans'
import { STATUS_CONFIG } from '@/src/modules/treatment-plans'

interface StatusBadgeProps {
	status: PlanStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const config = STATUS_CONFIG[status]

	return (
		<Badge variant="outline" className={config.className}>
			{config.label}
		</Badge>
	)
}
