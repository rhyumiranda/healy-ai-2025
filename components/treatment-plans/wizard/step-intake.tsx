import { ClipboardList, Activity, Pill, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TagInput } from '@/components/patients/tag-input'
import type { TreatmentPlanWizardData, SeverityLevel, SymptomDuration } from '@/src/modules/treatment-plans'

interface StepIntakeProps {
	formData: TreatmentPlanWizardData
	onUpdate: (data: Partial<TreatmentPlanWizardData>) => void
	errors: Record<string, string>
}

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string; color: string }[] = [
	{ value: 'LOW', label: 'Low', color: 'text-green-600' },
	{ value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
	{ value: 'HIGH', label: 'High', color: 'text-red-600' },
]

const DURATION_OPTIONS: { value: SymptomDuration; label: string }[] = [
	{ value: 'days', label: 'Days' },
	{ value: 'weeks', label: 'Weeks' },
	{ value: 'months', label: 'Months' },
	{ value: 'years', label: 'Years' },
]

export function StepIntake({ formData, onUpdate, errors }: StepIntakeProps) {
	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<ClipboardList className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Chief Complaint & Symptoms</CardTitle>
					</div>
					<CardDescription>Document the primary reason for this visit</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='chiefComplaint'>
							Chief Complaint <span className='text-destructive'>*</span>
						</Label>
						<Textarea
							id='chiefComplaint'
							placeholder='Describe the main reason for this visit in detail...'
							value={formData.chiefComplaint}
							onChange={(e) => onUpdate({ chiefComplaint: e.target.value })}
							rows={3}
							className={errors.chiefComplaint ? 'border-destructive' : ''}
						/>
						{errors.chiefComplaint && <p className='text-sm text-destructive'>{errors.chiefComplaint}</p>}
					</div>

					<div className='space-y-2'>
						<Label>
							Current Symptoms <span className='text-destructive'>*</span>
						</Label>
						<TagInput
							value={formData.currentSymptoms}
							onChange={(tags) => onUpdate({ currentSymptoms: tags })}
							placeholder='Type symptom and press Enter'
						/>
						{errors.currentSymptoms && <p className='text-sm text-destructive'>{errors.currentSymptoms}</p>}
					</div>

					<div className='grid gap-4 sm:grid-cols-3'>
						<div className='space-y-2'>
							<Label>Duration</Label>
							<div className='flex gap-2'>
								<Input
									type='number'
									placeholder='e.g., 3'
									value={formData.symptomDurationValue || ''}
									onChange={(e) => onUpdate({ symptomDurationValue: e.target.value ? parseInt(e.target.value) : undefined })}
									className='w-20'
								/>
								<Select
									value={formData.symptomDuration || ''}
									onValueChange={(value) => onUpdate({ symptomDuration: value as SymptomDuration })}
								>
									<SelectTrigger>
										<SelectValue placeholder='Unit' />
									</SelectTrigger>
									<SelectContent>
										{DURATION_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className='space-y-2'>
							<Label>Severity Level</Label>
							<Select
								value={formData.severityLevel || ''}
								onValueChange={(value) => onUpdate({ severityLevel: value as SeverityLevel })}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select severity' />
								</SelectTrigger>
								<SelectContent>
									{SEVERITY_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											<span className={opt.color}>{opt.label}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Pill className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Current Medications</CardTitle>
					</div>
					<CardDescription>List medications patient is currently taking</CardDescription>
				</CardHeader>
				<CardContent>
					<TagInput
						value={formData.currentMedications}
						onChange={(tags) => onUpdate({ currentMedications: tags })}
						placeholder='Type medication name and press Enter'
					/>
					<p className='mt-2 text-sm text-muted-foreground'>
						Include dosage if known (e.g., &quot;Metformin 500mg&quot;)
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Activity className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Vital Signs</CardTitle>
					</div>
					<CardDescription>Optional - Record current vital measurements</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						<div className='space-y-2'>
							<Label>Blood Pressure (Systolic)</Label>
							<div className='flex items-center gap-2'>
								<Input
									type='number'
									placeholder='120'
									value={formData.vitalSigns?.bloodPressureSystolic || ''}
									onChange={(e) => onUpdate({
										vitalSigns: { ...formData.vitalSigns, bloodPressureSystolic: e.target.value ? parseInt(e.target.value) : undefined }
									})}
								/>
								<span className='text-sm text-muted-foreground'>mmHg</span>
							</div>
						</div>
						<div className='space-y-2'>
							<Label>Blood Pressure (Diastolic)</Label>
							<div className='flex items-center gap-2'>
								<Input
									type='number'
									placeholder='80'
									value={formData.vitalSigns?.bloodPressureDiastolic || ''}
									onChange={(e) => onUpdate({
										vitalSigns: { ...formData.vitalSigns, bloodPressureDiastolic: e.target.value ? parseInt(e.target.value) : undefined }
									})}
								/>
								<span className='text-sm text-muted-foreground'>mmHg</span>
							</div>
						</div>
						<div className='space-y-2'>
							<Label>Heart Rate</Label>
							<div className='flex items-center gap-2'>
								<Input
									type='number'
									placeholder='72'
									value={formData.vitalSigns?.heartRate || ''}
									onChange={(e) => onUpdate({
										vitalSigns: { ...formData.vitalSigns, heartRate: e.target.value ? parseInt(e.target.value) : undefined }
									})}
								/>
								<span className='text-sm text-muted-foreground'>bpm</span>
							</div>
						</div>
						<div className='space-y-2'>
							<Label>Temperature</Label>
							<div className='flex items-center gap-2'>
								<Input
									type='number'
									step='0.1'
									placeholder='36.6'
									value={formData.vitalSigns?.temperature || ''}
									onChange={(e) => onUpdate({
										vitalSigns: { ...formData.vitalSigns, temperature: e.target.value ? parseFloat(e.target.value) : undefined }
									})}
								/>
								<span className='text-sm text-muted-foreground'>°C</span>
							</div>
						</div>
						<div className='space-y-2'>
							<Label>Oxygen Saturation</Label>
							<div className='flex items-center gap-2'>
								<Input
									type='number'
									placeholder='98'
									value={formData.vitalSigns?.oxygenSaturation || ''}
									onChange={(e) => onUpdate({
										vitalSigns: { ...formData.vitalSigns, oxygenSaturation: e.target.value ? parseInt(e.target.value) : undefined }
									})}
								/>
								<span className='text-sm text-muted-foreground'>%</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<FileText className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Additional Notes</CardTitle>
					</div>
					<CardDescription>Any other relevant clinical information</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						placeholder='Additional observations, patient history notes, etc...'
						value={formData.additionalNotes || ''}
						onChange={(e) => onUpdate({ additionalNotes: e.target.value })}
						rows={4}
					/>
				</CardContent>
			</Card>

			<p className='text-sm text-muted-foreground'>
				<span className='text-destructive'>*</span> Required fields
			</p>
		</div>
	)
}
