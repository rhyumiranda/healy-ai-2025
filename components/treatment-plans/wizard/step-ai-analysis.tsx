import { Brain, Loader2, AlertTriangle, Pill, Shield, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { TreatmentPlanWizardData } from '@/src/modules/treatment-plans'

interface StepAIAnalysisProps {
	formData: TreatmentPlanWizardData
	isAnalyzing: boolean
	analysisError: string | null
	onRunAnalysis: () => Promise<void>
}

const getRiskBadgeVariant = (risk: string) => {
	switch (risk) {
		case 'LOW': return 'bg-green-100 text-green-800 border-green-300'
		case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
		case 'HIGH': return 'bg-red-100 text-red-800 border-red-300'
		default: return 'bg-gray-100 text-gray-800'
	}
}

const getSeverityColor = (severity: string) => {
	switch (severity) {
		case 'Mild': return 'text-green-600'
		case 'Moderate': return 'text-yellow-600'
		case 'Severe': return 'text-red-600'
		default: return 'text-gray-600'
	}
}

export function StepAIAnalysis({ formData, isAnalyzing, analysisError, onRunAnalysis }: StepAIAnalysisProps) {
	const analysis = formData.aiAnalysis

	if (isAnalyzing) {
		return (
			<Card>
				<CardContent className='flex flex-col items-center justify-center py-16'>
					<Brain className='h-16 w-16 text-primary animate-pulse mb-4' />
					<h3 className='text-lg font-medium mb-2'>Analyzing Patient Data</h3>
					<p className='text-muted-foreground text-center mb-6'>
						AI is reviewing patient information and generating treatment recommendations...
					</p>
					<div className='w-64'>
						<Progress value={66} className='h-2' />
					</div>
					<p className='text-sm text-muted-foreground mt-2'>This may take a few seconds</p>
				</CardContent>
			</Card>
		)
	}

	if (!analysis) {
		return (
			<Card>
				<CardContent className='flex flex-col items-center justify-center py-16'>
					<Brain className='h-16 w-16 text-muted-foreground mb-4' />
					<h3 className='text-lg font-medium mb-2'>Ready for AI Analysis</h3>
					<p className='text-muted-foreground text-center mb-6 max-w-md'>
						Click the button below to analyze the patient data and generate treatment recommendations using AI.
					</p>
					{analysisError && (
						<div className='mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20'>
							<p className='text-sm text-destructive'>{analysisError}</p>
						</div>
					)}
					<Button onClick={onRunAnalysis} size='lg'>
						<Brain className='h-5 w-5 mr-2' />
						Run AI Analysis
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-medium'>AI Analysis Results</h3>
					<p className='text-sm text-muted-foreground'>
						Generated at {new Date(analysis.generatedAt).toLocaleString()}
					</p>
				</div>
				<Button variant='outline' onClick={onRunAnalysis}>
					<RefreshCw className='h-4 w-4 mr-2' />
					Re-analyze
				</Button>
			</div>

			<Card className={`border-2 ${analysis.riskLevel === 'HIGH' ? 'border-red-300 bg-red-50/50' : analysis.riskLevel === 'MEDIUM' ? 'border-yellow-300 bg-yellow-50/50' : 'border-green-300 bg-green-50/50'}`}>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Shield className='h-5 w-5' />
							<CardTitle className='text-lg'>Risk Assessment</CardTitle>
						</div>
						<Badge className={getRiskBadgeVariant(analysis.riskLevel)}>
							{analysis.riskLevel} RISK
						</Badge>
					</div>
				</CardHeader>
				<CardContent className='space-y-4'>
					<p className='text-sm'>{analysis.riskJustification}</p>
					{analysis.riskFactors.length > 0 && (
						<div>
							<p className='text-sm font-medium mb-2'>Risk Factors:</p>
							<ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
								{analysis.riskFactors.map((factor, i) => (
									<li key={i}>{factor}</li>
								))}
							</ul>
						</div>
					)}
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground'>Confidence:</span>
						<Progress value={analysis.confidenceScore} className='flex-1 h-2' />
						<span className='text-sm font-medium'>{analysis.confidenceScore}%</span>
					</div>
				</CardContent>
			</Card>

			{(analysis.drugInteractions.length > 0 || analysis.contraindications.length > 0) && (
				<Card className='border-orange-200 bg-orange-50/50'>
					<CardHeader>
						<div className='flex items-center gap-2'>
							<AlertTriangle className='h-5 w-5 text-orange-600' />
							<CardTitle className='text-lg text-orange-800'>Safety Alerts</CardTitle>
						</div>
					</CardHeader>
					<CardContent className='space-y-4'>
						{analysis.drugInteractions.length > 0 && (
							<div>
								<p className='text-sm font-medium mb-2'>Drug Interactions:</p>
								{analysis.drugInteractions.map((interaction, i) => (
									<div key={i} className='p-3 bg-white rounded-lg border mb-2'>
										<div className='flex items-center justify-between mb-1'>
											<span className='font-medium text-sm'>
												{interaction.medication1} + {interaction.medication2}
											</span>
											<Badge variant='outline' className={getSeverityColor(interaction.severity)}>
												{interaction.severity}
											</Badge>
										</div>
										<p className='text-sm text-muted-foreground'>{interaction.description}</p>
										<p className='text-sm mt-1'><strong>Recommendation:</strong> {interaction.recommendation}</p>
									</div>
								))}
							</div>
						)}
						{analysis.contraindications.length > 0 && (
							<div>
								<p className='text-sm font-medium mb-2'>Contraindications:</p>
								{analysis.contraindications.map((contra, i) => (
									<div key={i} className='p-3 bg-white rounded-lg border mb-2'>
										<div className='flex items-center justify-between mb-1'>
											<span className='font-medium text-sm'>{contra.medication}</span>
											<Badge variant='outline' className={contra.severity === 'Absolute' ? 'text-red-600' : 'text-yellow-600'}>
												{contra.severity}
											</Badge>
										</div>
										<p className='text-sm text-muted-foreground'>{contra.reason}</p>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Pill className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg'>Recommended Medications</CardTitle>
					</div>
					<CardDescription>{analysis.rationale}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{analysis.medications.map((med, i) => (
							<div key={i} className='p-4 border rounded-lg'>
								<div className='flex items-start justify-between mb-2'>
									<div>
										<p className='font-medium'>{med.name}</p>
										{med.genericName && <p className='text-sm text-muted-foreground'>({med.genericName})</p>}
									</div>
									{med.confidenceScore && (
										<Badge variant='outline'>{med.confidenceScore}% confidence</Badge>
									)}
								</div>
								<div className='grid gap-2 sm:grid-cols-2 text-sm'>
									<div><span className='text-muted-foreground'>Dosage:</span> {med.dosage}</div>
									<div><span className='text-muted-foreground'>Frequency:</span> {med.frequency}</div>
									<div><span className='text-muted-foreground'>Duration:</span> {med.duration}</div>
									<div><span className='text-muted-foreground'>Route:</span> {med.route}</div>
								</div>
								{med.instructions && (
									<p className='text-sm mt-2 text-muted-foreground'><strong>Instructions:</strong> {med.instructions}</p>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{analysis.alternatives.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Alternative Treatment Options</CardTitle>
						<CardDescription>Consider these alternatives if primary treatment is not suitable</CardDescription>
					</CardHeader>
					<CardContent>
						{analysis.alternatives.map((alt, i) => (
							<div key={i} className='p-4 border rounded-lg mb-3 last:mb-0'>
								<div className='flex items-center justify-between mb-2'>
									<p className='font-medium'>Alternative Plan {i + 1}</p>
									<Badge className={getRiskBadgeVariant(alt.riskLevel)}>{alt.riskLevel} Risk</Badge>
								</div>
								<p className='text-sm text-muted-foreground mb-2'>{alt.rationale}</p>
								<div className='space-y-2'>
									{alt.medications.map((med, j) => (
										<div key={j} className='text-sm'>
											<span className='font-medium'>{med.name}</span> - {med.dosage}, {med.frequency}
										</div>
									))}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
