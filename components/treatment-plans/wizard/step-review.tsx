import { ClipboardCheck, User, Pill, FileText, AlertTriangle, Edit2, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { TreatmentPlanWizardData, Medication, TreatmentWizardStep } from '@/src/modules/treatment-plans'

interface StepReviewProps {
	formData: TreatmentPlanWizardData
	onUpdate: (data: Partial<TreatmentPlanWizardData>) => void
	onGoToStep?: (step: TreatmentWizardStep) => void
}

const getRiskBadgeVariant = (risk: string) => {
	switch (risk) {
		case 'LOW': return 'bg-green-100 text-green-800'
		case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
		case 'HIGH': return 'bg-red-100 text-red-800'
		default: return 'bg-gray-100 text-gray-800'
	}
}

export function StepReview({ formData, onUpdate, onGoToStep }: StepReviewProps) {
	const analysis = formData.aiAnalysis
	const finalPlan = formData.finalPlan

	const handleRemoveMedication = (index: number) => {
		if (!finalPlan) return
		const newMedications = finalPlan.medications.filter((_, i) => i !== index)
		onUpdate({
			finalPlan: { ...finalPlan, medications: newMedications },
			wasModified: true,
		})
	}

	const calculateAge = (dateOfBirth: string) => {
		const today = new Date()
		const birth = new Date(dateOfBirth)
		let age = today.getFullYear() - birth.getFullYear()
		const monthDiff = today.getMonth() - birth.getMonth()
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--
		}
		return age
	}

	return (
		<div className='space-y-6'>
			<div className='rounded-lg border border-green-200 bg-green-50/50 p-4'>
				<div className='flex gap-2'>
					<ClipboardCheck className='h-5 w-5 text-green-600 shrink-0' />
					<div>
						<p className='text-sm font-medium text-green-800'>Review Treatment Plan</p>
						<p className='text-sm text-green-700'>
							Review and modify the treatment plan before approval. You can edit medications and add notes.
						</p>
					</div>
				</div>
			</div>

			{formData.selectedPatient && (
				<Card>
					<CardHeader className='pb-3'>
						<div className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							<CardTitle className='text-lg'>Patient Information</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div>
								<dt className='text-sm text-muted-foreground'>Name</dt>
								<dd className='font-medium'>{formData.selectedPatient.name}</dd>
							</div>
							<div>
								<dt className='text-sm text-muted-foreground'>Age / Gender</dt>
								<dd className='font-medium'>
									{calculateAge(formData.selectedPatient.dateOfBirth)} years • {formData.selectedPatient.gender}
								</dd>
							</div>
							{formData.selectedPatient.allergies && formData.selectedPatient.allergies.length > 0 && (
								<div className='sm:col-span-2'>
									<dt className='text-sm text-muted-foreground mb-1'>Known Allergies</dt>
									<dd className='flex flex-wrap gap-1'>
										{formData.selectedPatient.allergies.map((allergy, i) => (
											<Badge key={i} variant='destructive' className='text-xs'>{allergy}</Badge>
										))}
									</dd>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader className='pb-3'>
					<div className='flex items-center gap-2'>
						<FileText className='h-5 w-5' />
						<CardTitle className='text-lg'>Clinical Summary</CardTitle>
					</div>
				</CardHeader>
				<CardContent className='space-y-3'>
					<div>
						<dt className='text-sm text-muted-foreground'>Chief Complaint</dt>
						<dd className='mt-1'>{formData.chiefComplaint}</dd>
					</div>
					<div>
						<dt className='text-sm text-muted-foreground'>Symptoms</dt>
						<dd className='mt-1 flex flex-wrap gap-1'>
							{formData.currentSymptoms.map((symptom, i) => (
								<Badge key={i} variant='secondary'>{symptom}</Badge>
							))}
						</dd>
					</div>
					{analysis && (
						<div className='flex items-center gap-2 pt-2'>
							<span className='text-sm text-muted-foreground'>Risk Level:</span>
							<Badge className={getRiskBadgeVariant(analysis.riskLevel)}>{analysis.riskLevel}</Badge>
						</div>
					)}
				</CardContent>
			</Card>

			{analysis && (analysis.drugInteractions.length > 0 || analysis.contraindications.length > 0) && (
				<Card className='border-orange-200 bg-orange-50/50'>
					<CardHeader className='pb-3'>
						<div className='flex items-center gap-2'>
							<AlertTriangle className='h-5 w-5 text-orange-600' />
							<CardTitle className='text-lg text-orange-800'>Safety Alerts</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className='space-y-2 text-sm'>
							{analysis.drugInteractions.map((interaction, i) => (
								<div key={i} className='flex items-start gap-2'>
									<AlertTriangle className='h-4 w-4 text-orange-500 mt-0.5 shrink-0' />
									<span>
										<strong>{interaction.medication1}</strong> + <strong>{interaction.medication2}</strong>: {interaction.description}
									</span>
								</div>
							))}
							{analysis.contraindications.map((contra, i) => (
								<div key={i} className='flex items-start gap-2'>
									<AlertTriangle className='h-4 w-4 text-red-500 mt-0.5 shrink-0' />
									<span>
										<strong>{contra.medication}</strong>: {contra.reason}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Pill className='h-5 w-5 text-primary' />
							<CardTitle className='text-lg'>Treatment Plan</CardTitle>
						</div>
						{formData.wasModified && (
							<Badge variant='outline' className='text-blue-600 border-blue-300'>Modified</Badge>
						)}
					</div>
					<CardDescription>Review and adjust medications as needed</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-3'>
						{finalPlan?.medications.map((med, i) => (
							<div key={i} className='p-4 border rounded-lg'>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<p className='font-medium'>{med.name}</p>
										<div className='grid gap-1 sm:grid-cols-2 mt-2 text-sm'>
											<div><span className='text-muted-foreground'>Dosage:</span> {med.dosage}</div>
											<div><span className='text-muted-foreground'>Frequency:</span> {med.frequency}</div>
											<div><span className='text-muted-foreground'>Duration:</span> {med.duration}</div>
											<div><span className='text-muted-foreground'>Route:</span> {med.route}</div>
										</div>
										{med.instructions && (
											<p className='text-sm mt-2 text-muted-foreground'>{med.instructions}</p>
										)}
									</div>
									<Button
										variant='ghost'
										size='icon'
										className='text-destructive hover:text-destructive hover:bg-destructive/10'
										onClick={() => handleRemoveMedication(i)}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</div>
						))}
						{(!finalPlan || finalPlan.medications.length === 0) && (
							<p className='text-center text-muted-foreground py-4'>No medications in the treatment plan</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Doctor Notes</CardTitle>
					<CardDescription>Add any additional notes or modifications rationale</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						placeholder='Add notes about treatment decisions, modifications made, or follow-up instructions...'
						value={formData.doctorNotes || ''}
						onChange={(e) => onUpdate({ doctorNotes: e.target.value })}
						rows={4}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
