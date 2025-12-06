'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseFormPersistenceOptions<T> {
	key: string
	data: T
	excludeFields?: (keyof T)[]
	debounceMs?: number
	storage?: 'localStorage' | 'sessionStorage'
}

export function useFormPersistence<T extends Record<string, any>>({
	key,
	data,
	excludeFields = [],
	debounceMs = 500,
	storage = 'sessionStorage',
}: UseFormPersistenceOptions<T>) {
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
	const storageKey = `form_${key}`

	const getStorage = useCallback(() => {
		if (typeof window === 'undefined') return null
		return storage === 'localStorage' ? window.localStorage : window.sessionStorage
	}, [storage])

	const saveData = useCallback(
		(dataToSave: T) => {
			const storageInstance = getStorage()
			if (!storageInstance) return

			const filteredData = { ...dataToSave }
			excludeFields.forEach((field) => {
				delete filteredData[field]
			})

			try {
				storageInstance.setItem(storageKey, JSON.stringify(filteredData))
			} catch (error) {
				console.error('Failed to save form data:', error)
			}
		},
		[storageKey, excludeFields, getStorage]
	)

	const debouncedSave = useCallback(
		(dataToSave: T) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}

			debounceTimerRef.current = setTimeout(() => {
				saveData(dataToSave)
			}, debounceMs)
		},
		[saveData, debounceMs]
	)

	const loadData = useCallback((): Partial<T> | null => {
		const storageInstance = getStorage()
		if (!storageInstance) return null

		try {
			const savedData = storageInstance.getItem(storageKey)
			if (savedData) {
				return JSON.parse(savedData) as Partial<T>
			}
		} catch (error) {
			console.error('Failed to load form data:', error)
		}

		return null
	}, [storageKey, getStorage])

	const clearData = useCallback(() => {
		const storageInstance = getStorage()
		if (!storageInstance) return

		try {
			storageInstance.removeItem(storageKey)
		} catch (error) {
			console.error('Failed to clear form data:', error)
		}
	}, [storageKey, getStorage])

	useEffect(() => {
		debouncedSave(data)
	}, [data, debouncedSave])

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	return {
		loadData,
		clearData,
		saveData,
	}
}
