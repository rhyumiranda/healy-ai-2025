import { Pill, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TagInput } from "@/components/patients/tag-input"
import type { PatientWizardData } from "@/src/modules/patients"

interface StepMedicationsProps {
	formData: PatientWizardData
	onUpdate: (data: Partial<PatientWizardData>) => void
	errors: Record<string, string>
}

export function StepMedications({ formData, onUpdate }: StepMedicationsProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Pill className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">Current Medications</CardTitle>
					</div>
					<CardDescription>List all medications</CardDescription>
				</CardHeader>
				<CardContent>
					<TagInput
						value={formData.currentMedications || []}
						onChange={(tags) => onUpdate({ currentMedications: tags })}
						placeholder="Type medication and press Enter"
					/>
				</CardContent>
			</Card>
			<Card className="border-orange-200 bg-orange-50/50">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-orange-600" />
						<CardTitle className="text-lg text-orange-700">Known Allergies</CardTitle>
					</div>
					<CardDescription className="text-orange-600">Critical for safety</CardDescription>
				</CardHeader>
				<CardContent>
					<TagInput
						value={formData.allergies || []}
						onChange={(tags) => onUpdate({ allergies: tags })}
						placeholder="Type allergy and press Enter"
					/>
				</CardContent>
			</Card>
		</div>
	)
}
