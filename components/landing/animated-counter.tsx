'use client'

import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedCounterProps {
	value: number
	duration?: number
	suffix?: string
}

export function AnimatedCounter({ value, duration = 2000, suffix = '' }: AnimatedCounterProps) {
	const nodeRef = useRef<HTMLSpanElement>(null)
	const isInView = useInView(nodeRef, { once: true, margin: '-100px' })

	useEffect(() => {
		if (!isInView) return

		const node = nodeRef.current
		if (!node) return

		let startTime: number | null = null
		const startValue = 0

		const animate = (currentTime: number) => {
			if (!startTime) startTime = currentTime
			const progress = Math.min((currentTime - startTime) / duration, 1)

			const easeOutQuart = 1 - Math.pow(1 - progress, 4)
			const currentValue = startValue + (value - startValue) * easeOutQuart

			if (suffix === '%' || suffix === 'x') {
				node.textContent = currentValue.toFixed(1) + suffix
			} else {
				node.textContent = Math.floor(currentValue).toString() + suffix
			}

			if (progress < 1) {
				requestAnimationFrame(animate)
			} else {
				if (suffix === '%' || suffix === 'x') {
					node.textContent = value.toFixed(1) + suffix
				} else {
					node.textContent = value.toString() + suffix
				}
			}
		}

		requestAnimationFrame(animate)
	}, [isInView, value, duration, suffix])

	return <span ref={nodeRef}>0{suffix}</span>
}
