import { Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/patients/tag-input'
import type { PatientWizardData } from '@/src/modules/patients'

interface StepMedicalHistoryProps {
	formData: PatientWizardData
	onUpdate: (data: Partial<PatientWizardData>) => void
	errors: Record<string, string>
}

export function StepMedicalHistory({ formData, onUpdate, errors }: StepMedicalHistoryProps) {
	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Heart className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Chronic Conditions</CardTitle>
					</div>
					<CardDescription>
						List any ongoing health conditions that may affect treatment decisions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TagInput
						value={formData.chronicConditions || []}
						onChange={(tags) => onUpdate({ chronicConditions: tags })}
						placeholder='Type condition and press Enter (e.g., Hypertension, Diabetes)'
					/>
					<p className='mt-2 text-sm text-muted-foreground'>
						Press Enter or comma to add each condition
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Medical History Notes</CardTitle>
					<CardDescription>
						Additional notes about past surgeries, hospitalizations, family history, etc.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						<Label htmlFor='medicalHistory' className='sr-only'>
							Medical History
						</Label>
						<Textarea
							id='medicalHistory'
							placeholder='Enter relevant medical history, past surgeries, family history, significant events...'
							value={formData.medicalHistory || ''}
							onChange={(e) => onUpdate({ medicalHistory: e.target.value })}
							rows={6}
							className={errors.medicalHistory ? 'border-destructive' : ''}
						/>
						{errors.medicalHistory && (
							<p className='text-sm text-destructive'>{errors.medicalHistory}</p>
						)}
						<p className='text-sm text-muted-foreground'>
							{(formData.medicalHistory?.length || 0).toLocaleString()} / 5,000 characters
						</p>
					</div>
				</CardContent>
			</Card>

			<div className='rounded-lg border border-blue-200 bg-blue-50/50 p-4'>
				<p className='text-sm text-blue-700'>
					<strong>Tip:</strong> Include information about family history of genetic conditions,
					past surgeries, hospitalizations, and any significant medical events.
				</p>
			</div>
		</div>
	)
}
