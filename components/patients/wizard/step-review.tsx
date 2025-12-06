import { ClipboardCheck, User, Heart, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PatientWizardData } from "@/src/modules/patients"

interface StepReviewProps {
	formData: PatientWizardData
}

export function StepReview({ formData }: StepReviewProps) {
	const formatDate = (dateStr: string) => {
		if (!dateStr) return "Not provided"
		return new Date(dateStr).toLocaleDateString()
	}

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
				<div className="flex gap-2">
					<ClipboardCheck className="h-5 w-5 text-green-600 shrink-0" />
					<div>
						<p className="text-sm font-medium text-green-800">Review Patient Information</p>
						<p className="text-sm text-green-700">Please review all information before submitting.</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						<CardTitle className="text-lg">Demographics</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<dl className="grid gap-3 sm:grid-cols-2">
						<div><dt className="text-sm text-muted-foreground">Name</dt><dd className="font-medium">{formData.name || "Not provided"}</dd></div>
						<div><dt className="text-sm text-muted-foreground">Date of Birth</dt><dd className="font-medium">{formatDate(formData.dateOfBirth)}</dd></div>
						<div><dt className="text-sm text-muted-foreground">Gender</dt><dd className="font-medium">{formData.gender}</dd></div>
						<div><dt className="text-sm text-muted-foreground">Blood Type</dt><dd className="font-medium">{formData.bloodType || "Not provided"}</dd></div>
						{formData.weight && <div><dt className="text-sm text-muted-foreground">Weight</dt><dd className="font-medium">{formData.weight} kg</dd></div>}
						{formData.height && <div><dt className="text-sm text-muted-foreground">Height</dt><dd className="font-medium">{formData.height} cm</dd></div>}
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Heart className="h-5 w-5" />
						<CardTitle className="text-lg">Medical History</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<dt className="text-sm text-muted-foreground mb-2">Chronic Conditions</dt>
						<dd className="flex flex-wrap gap-2">{formData.chronicConditions?.length ? formData.chronicConditions.map((c, i) => <Badge key={i} variant="secondary">{c}</Badge>) : <span className="text-muted-foreground">None listed</span>}</dd>
					</div>
					{formData.medicalHistory && <div><dt className="text-sm text-muted-foreground mb-1">Notes</dt><dd className="text-sm">{formData.medicalHistory}</dd></div>}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Pill className="h-5 w-5" />
						<CardTitle className="text-lg">Medications & Allergies</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<dt className="text-sm text-muted-foreground mb-2">Current Medications</dt>
						<dd className="flex flex-wrap gap-2">{formData.currentMedications?.length ? formData.currentMedications.map((m, i) => <Badge key={i} variant="outline">{m}</Badge>) : <span className="text-muted-foreground">None listed</span>}</dd>
					</div>
					<div>
						<dt className="text-sm text-muted-foreground mb-2">Known Allergies</dt>
						<dd className="flex flex-wrap gap-2">{formData.allergies?.length ? formData.allergies.map((a, i) => <Badge key={i} variant="destructive">{a}</Badge>) : <span className="text-muted-foreground">None listed</span>}</dd>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
