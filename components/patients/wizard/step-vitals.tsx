import { Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/patients/tag-input"
import type { PatientWizardData } from "@/src/modules/patients"

interface StepVitalsProps {
	formData: PatientWizardData
	onUpdate: (data: Partial<PatientWizardData>) => void
	errors: Record<string, string>
}

export function StepVitals({ formData, onUpdate, errors }: StepVitalsProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">Baseline Vital Signs</CardTitle>
					</div>
					<CardDescription>Optional - Record current vital measurements</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="bpSystolic">Blood Pressure (Systolic)</Label>
							<div className="flex items-center gap-2">
								<Input id="bpSystolic" type="number" placeholder="120" value={formData.bloodPressureSystolic || ""} onChange={(e) => onUpdate({ bloodPressureSystolic: e.target.value ? parseInt(e.target.value) : undefined })} />
								<span className="text-sm text-muted-foreground">mmHg</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="bpDiastolic">Blood Pressure (Diastolic)</Label>
							<div className="flex items-center gap-2">
								<Input id="bpDiastolic" type="number" placeholder="80" value={formData.bloodPressureDiastolic || ""} onChange={(e) => onUpdate({ bloodPressureDiastolic: e.target.value ? parseInt(e.target.value) : undefined })} />
								<span className="text-sm text-muted-foreground">mmHg</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="heartRate">Heart Rate</Label>
							<div className="flex items-center gap-2">
								<Input id="heartRate" type="number" placeholder="72" value={formData.heartRate || ""} onChange={(e) => onUpdate({ heartRate: e.target.value ? parseInt(e.target.value) : undefined })} />
								<span className="text-sm text-muted-foreground">bpm</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="temperature">Temperature</Label>
							<div className="flex items-center gap-2">
								<Input id="temperature" type="number" step="0.1" placeholder="36.6" value={formData.temperature || ""} onChange={(e) => onUpdate({ temperature: e.target.value ? parseFloat(e.target.value) : undefined })} />
								<span className="text-sm text-muted-foreground">°C</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="respRate">Respiratory Rate</Label>
							<div className="flex items-center gap-2">
								<Input id="respRate" type="number" placeholder="16" value={formData.respiratoryRate || ""} onChange={(e) => onUpdate({ respiratoryRate: e.target.value ? parseInt(e.target.value) : undefined })} />
								<span className="text-sm text-muted-foreground">/min</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="o2Sat">Oxygen Saturation</Label>
							<div className="flex items-center gap-2">
								<Input id="o2Sat" type="number" placeholder="98" value={formData.oxygenSaturation || ""} onChange={(e) => onUpdate({ oxygenSaturation: e.target.value ? parseInt(e.target.value) : undefined })} />
								<span className="text-sm text-muted-foreground">%</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Chief Complaint</CardTitle>
					<CardDescription>Optional - Primary reason for visit</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Textarea id="chiefComplaint" placeholder="Describe the main reason for this visit..." value={formData.chiefComplaint || ""} onChange={(e) => onUpdate({ chiefComplaint: e.target.value })} rows={3} />
					<div className="space-y-2">
						<Label>Current Symptoms</Label>
						<TagInput value={formData.currentSymptoms || []} onChange={(tags) => onUpdate({ currentSymptoms: tags })} placeholder="Type symptom and press Enter" />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
