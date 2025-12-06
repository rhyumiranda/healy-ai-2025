'use client'

import { useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	ArrowLeft,
	Edit,
	Trash2,
	Copy,
	Printer,
	User,
	Stethoscope,
	Pill,
	AlertTriangle,
	ShieldAlert,
	Brain,
	Clock,
	CheckCircle2,
	FileText,
	Activity,
} from 'lucide-react'
import { useTreatmentPlan, useDeleteTreatmentPlan } from '@/src/modules/treatment-plans'
import { StatusBadge, RiskBadge, DeletePlanDialog } from '@/components/treatment-plans'

function calculateAge(dateOfBirth: string): number {
	const birth = new Date(dateOfBirth)
	const today = new Date()
	let age = today.getFullYear() - birth.getFullYear()
	const monthDiff = today.getMonth() - birth.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--
	}
	return age
}

function SeverityBadge({ severity }: { severity: 'Mild' | 'Moderate' | 'Severe' | 'Absolute' | 'Relative' }) {
	const colors: Record<string, string> = {
		Mild: 'bg-green-50 text-green-700 border-green-200',
		Moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
		Severe: 'bg-red-50 text-red-700 border-red-200',
		Absolute: 'bg-red-50 text-red-700 border-red-200',
		Relative: 'bg-yellow-50 text-yellow-700 border-yellow-200',
	}
	return (
		<Badge variant="outline" className={colors[severity]}>
			{severity}
		</Badge>
	)
}

export default function TreatmentPlanDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const { plan, isLoading, error } = useTreatmentPlan(id)
	const { deletePlan, isLoading: isDeleting } = useDeleteTreatmentPlan()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleDelete = async () => {
		await deletePlan(id)
	}

	const handlePrint = () => {
		window.print()
	}

	const canEdit = plan?.status === 'DRAFT'
	const canDelete = plan?.status === 'DRAFT'

	if (isLoading) {
		return (
			<>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Skeleton className="h-4 w-48" />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<Skeleton className="h-8 w-64" />
					<div className="grid gap-6 lg:grid-cols-3">
						<Skeleton className="h-96 lg:col-span-2" />
						<Skeleton className="h-96" />
					</div>
				</div>
			</>
		)
	}

	if (error || !plan) {
		return (
			<>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard/treatment-plans">Treatment Plans</BreadcrumbLink>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
					<p className="text-destructive">{error || 'Treatment plan not found'}</p>
					<Link href="/dashboard/treatment-plans">
						<Button variant="outline">Back to Treatment Plans</Button>
					</Link>
				</div>
			</>
		)
	}

	const medications = plan.finalPlan?.medications || plan.aiRecommendations?.medications || []

	return (
		<>
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="/dashboard/treatment-plans">Treatment Plans</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Plan Details</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/dashboard/treatment-plans">
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-2xl font-semibold tracking-tight">
									Treatment Plan
								</h1>
								<StatusBadge status={plan.status} />
							</div>
							<p className="text-sm text-muted-foreground">
								{plan.patient.name} • Created {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{canEdit && (
							<Link href={`/dashboard/treatment-plans/${id}/edit`}>
								<Button variant="outline" size="sm">
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							</Link>
						)}
						<Button variant="outline" size="sm" onClick={handlePrint}>
							<Printer className="h-4 w-4 mr-2" />
							Print
						</Button>
						<Button variant="outline" size="sm">
							<Copy className="h-4 w-4 mr-2" />
							Clone
						</Button>
						{canDelete && (
							<Button
								variant="outline"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={() => setShowDeleteDialog(true)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</Button>
						)}
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<User className="h-5 w-5" />
									Patient Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 sm:grid-cols-3">
									<div>
										<p className="text-sm text-muted-foreground">Name</p>
										<Link
											href={`/dashboard/patients/${plan.patientId}`}
											className="font-medium hover:underline"
										>
											{plan.patient.name}
										</Link>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Age</p>
										<p className="font-medium">{calculateAge(plan.patient.dateOfBirth)} years</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Gender</p>
										<p className="font-medium">
											{plan.patient.gender.charAt(0) + plan.patient.gender.slice(1).toLowerCase()}
										</p>
									</div>
								</div>
								{(plan.patient.allergies?.length || plan.patient.chronicConditions?.length) && (
									<div className="mt-4 pt-4 border-t grid gap-4 sm:grid-cols-2">
										{plan.patient.allergies && plan.patient.allergies.length > 0 && (
											<div>
												<p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
													<AlertTriangle className="h-3 w-3 text-orange-500" />
													Allergies
												</p>
												<div className="flex flex-wrap gap-1">
													{plan.patient.allergies.map((allergy) => (
														<Badge
															key={allergy}
															variant="outline"
															className="text-xs border-orange-300 bg-orange-50 text-orange-700"
														>
															{allergy}
														</Badge>
													))}
												</div>
											</div>
										)}
										{plan.patient.chronicConditions && plan.patient.chronicConditions.length > 0 && (
											<div>
												<p className="text-sm text-muted-foreground mb-2">Chronic Conditions</p>
												<div className="flex flex-wrap gap-1">
													{plan.patient.chronicConditions.map((condition) => (
														<Badge key={condition} variant="secondary" className="text-xs">
															{condition}
														</Badge>
													))}
												</div>
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Stethoscope className="h-5 w-5" />
									Chief Complaint &amp; Symptoms
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground mb-1">Chief Complaint</p>
									<p className="font-medium">{plan.chiefComplaint}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground mb-1">Current Symptoms</p>
									<p className="text-sm">{plan.currentSymptoms}</p>
								</div>
								{plan.physicalExamNotes && (
									<div>
										<p className="text-sm text-muted-foreground mb-1">Physical Exam Notes</p>
										<p className="text-sm">{plan.physicalExamNotes}</p>
									</div>
								)}
							</CardContent>
						</Card>

						{plan.vitalSigns && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Activity className="h-5 w-5" />
										Vital Signs
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-3 sm:grid-cols-4">
										{plan.vitalSigns.bloodPressureSystolic && plan.vitalSigns.bloodPressureDiastolic && (
											<div className="text-center p-3 bg-slate-50 rounded-lg">
												<p className="text-2xl font-semibold">
													{plan.vitalSigns.bloodPressureSystolic}/{plan.vitalSigns.bloodPressureDiastolic}
												</p>
												<p className="text-xs text-muted-foreground">Blood Pressure</p>
											</div>
										)}
										{plan.vitalSigns.heartRate && (
											<div className="text-center p-3 bg-slate-50 rounded-lg">
												<p className="text-2xl font-semibold">{plan.vitalSigns.heartRate}</p>
												<p className="text-xs text-muted-foreground">Heart Rate (bpm)</p>
											</div>
										)}
										{plan.vitalSigns.temperature && (
											<div className="text-center p-3 bg-slate-50 rounded-lg">
												<p className="text-2xl font-semibold">{plan.vitalSigns.temperature}°F</p>
												<p className="text-xs text-muted-foreground">Temperature</p>
											</div>
										)}
										{plan.vitalSigns.oxygenSaturation && (
											<div className="text-center p-3 bg-slate-50 rounded-lg">
												<p className="text-2xl font-semibold">{plan.vitalSigns.oxygenSaturation}%</p>
												<p className="text-xs text-muted-foreground">O₂ Saturation</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Pill className="h-5 w-5" />
									Medications
								</CardTitle>
								<CardDescription>
									{plan.finalPlan ? 'Approved treatment plan' : 'AI-recommended medications'}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{medications.length > 0 ? (
									<div className="rounded-lg border">
										<Table>
											<TableHeader>
												<TableRow className="bg-slate-50/50">
													<TableHead>Medication</TableHead>
													<TableHead>Dosage</TableHead>
													<TableHead>Frequency</TableHead>
													<TableHead>Duration</TableHead>
													<TableHead>Route</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{medications.map((med, idx) => (
													<TableRow key={idx}>
														<TableCell>
															<div>
																<p className="font-medium">{med.name}</p>
																{med.instructions && (
																	<p className="text-xs text-muted-foreground mt-0.5">
																		{med.instructions}
																	</p>
																)}
															</div>
														</TableCell>
														<TableCell>{med.dosage}</TableCell>
														<TableCell>{med.frequency}</TableCell>
														<TableCell>{med.duration}</TableCell>
														<TableCell>{med.route}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No medications prescribed yet</p>
								)}
							</CardContent>
						</Card>

						{plan.drugInteractions.length > 0 && (
							<Card className="border-yellow-200">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
										<AlertTriangle className="h-5 w-5" />
										Drug Interactions
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{plan.drugInteractions.map((interaction, idx) => (
											<div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
												<div className="flex items-center justify-between mb-2">
													<p className="font-medium text-sm">
														{interaction.medication1} ↔ {interaction.medication2}
													</p>
													<SeverityBadge severity={interaction.severity} />
												</div>
												<p className="text-sm text-muted-foreground">{interaction.description}</p>
												<p className="text-sm mt-2">
													<span className="font-medium">Recommendation:</span> {interaction.recommendation}
												</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{plan.contraindications.length > 0 && (
							<Card className="border-red-200">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2 text-red-700">
										<ShieldAlert className="h-5 w-5" />
										Contraindications
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{plan.contraindications.map((contra, idx) => (
											<div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
												<div className="flex items-center justify-between mb-1">
													<p className="font-medium text-sm">{contra.medication}</p>
													<SeverityBadge severity={contra.severity} />
												</div>
												<p className="text-sm text-muted-foreground">{contra.reason}</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{(plan.finalPlan?.notes || plan.modificationNotes) && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<FileText className="h-5 w-5" />
										Notes
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{plan.finalPlan?.notes && (
										<div>
											<p className="text-sm text-muted-foreground mb-1">Doctor&apos;s Notes</p>
											<p className="text-sm">{plan.finalPlan.notes}</p>
										</div>
									)}
									{plan.modificationNotes && (
										<div>
											<p className="text-sm text-muted-foreground mb-1">Modification Notes</p>
											<p className="text-sm">{plan.modificationNotes}</p>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Status &amp; Risk</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Status</span>
									<StatusBadge status={plan.status} />
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Risk Level</span>
									<RiskBadge level={plan.riskLevel} />
								</div>
								{plan.riskFactors.length > 0 && (
									<div>
										<p className="text-sm text-muted-foreground mb-2">Risk Factors</p>
										<div className="space-y-1">
											{plan.riskFactors.map((factor, idx) => (
												<p key={idx} className="text-sm flex items-start gap-2">
													<span className="text-muted-foreground">•</span>
													{factor}
												</p>
											))}
										</div>
									</div>
								)}
								{plan.riskJustification && (
									<div>
										<p className="text-sm text-muted-foreground mb-1">Justification</p>
										<p className="text-sm">{plan.riskJustification}</p>
									</div>
								)}
							</CardContent>
						</Card>

						{plan.aiRecommendations && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Brain className="h-5 w-5" />
										AI Confidence
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{plan.aiRecommendations.medications.length > 0 && (
										<div>
											<p className="text-sm text-muted-foreground mb-2">Medication Confidence</p>
											<div className="space-y-2">
												{plan.aiRecommendations.medications
													.filter((med) => med.confidenceScore)
													.map((med, idx) => (
														<div key={idx} className="flex items-center justify-between">
															<span className="text-sm">{med.name}</span>
															<div className="flex items-center gap-2">
																<div className="w-24 bg-slate-100 rounded-full h-2">
																	<div
																		className="bg-primary h-2 rounded-full transition-all"
																		style={{ width: `${med.confidenceScore}%` }}
																	/>
																</div>
																<span className="text-sm font-medium w-12 text-right">
																	{med.confidenceScore}%
																</span>
															</div>
														</div>
													))}
											</div>
										</div>
									)}
									{plan.aiRecommendations.rationale && (
										<div>
											<p className="text-sm text-muted-foreground mb-1">Rationale</p>
											<p className="text-sm">{plan.aiRecommendations.rationale}</p>
										</div>
									)}
									{plan.aiRecommendations.recommendations && plan.aiRecommendations.recommendations.length > 0 && (
										<div>
											<p className="text-sm text-muted-foreground mb-2">Recommendations</p>
											<div className="space-y-1">
												{plan.aiRecommendations.recommendations.map((rec, idx) => (
													<p key={idx} className="text-sm flex items-start gap-2">
														<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
														{rec}
													</p>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{plan.wasModified && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<FileText className="h-5 w-5" />
										Version History
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-primary mt-2" />
											<div>
												<p className="text-sm font-medium">Plan Modified</p>
												<p className="text-xs text-muted-foreground">
													{format(new Date(plan.updatedAt), 'MMM d, yyyy h:mm a')}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-slate-300 mt-2" />
											<div>
												<p className="text-sm font-medium">Plan Created</p>
												<p className="text-xs text-muted-foreground">
													{format(new Date(plan.createdAt), 'MMM d, yyyy h:mm a')}
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Record Info
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Created</span>
									<span>{format(new Date(plan.createdAt), 'MMM d, yyyy')}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Last Updated</span>
									<span>{formatDistanceToNow(new Date(plan.updatedAt), { addSuffix: true })}</span>
								</div>
								{plan.approvedAt && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Approved</span>
										<span>{format(new Date(plan.approvedAt), 'MMM d, yyyy')}</span>
									</div>
								)}
								{plan.finalPlan?.approvedBy && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Approved By</span>
										<span>{plan.finalPlan.approvedBy}</span>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<DeletePlanDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={handleDelete}
				isLoading={isDeleting}
				planId={id}
				patientName={plan.patient.name}
			/>
		</>
	)
}
