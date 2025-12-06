import {
	AlertTriangle,
	Pill,
	Shield,
	RefreshCw,
	ExternalLink,
	BookOpen,
	CheckCircle2,
	XCircle,
	Info,
	FileText,
	ChevronDown,
	ChevronUp,
	Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { AILoadingAnimation, AISparkleIcon } from '@/components/ui/ai-loading-animation'
import type {
	TreatmentPlanWizardData,
	MedicationWithEvidence,
	ClinicalReference,
	EvidenceLevel,
	ConfidenceResult,
} from '@/src/modules/treatment-plans'

interface StepAIAnalysisProps {
	formData: TreatmentPlanWizardData
	isAnalyzing: boolean
	analysisError: string | null
	onRunAnalysis: () => Promise<void>
}

// ============================================
// Helper Functions
// ============================================

const getRiskBadgeVariant = (risk: string) => {
	switch (risk) {
		case 'LOW':
			return 'bg-green-100 text-green-800 border-green-300'
		case 'MEDIUM':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300'
		case 'HIGH':
			return 'bg-red-100 text-red-800 border-red-300'
		default:
			return 'bg-gray-100 text-gray-800'
	}
}

const getSeverityColor = (severity: string) => {
	switch (severity) {
		case 'Mild':
			return 'text-green-600'
		case 'Moderate':
			return 'text-yellow-600'
		case 'Severe':
			return 'text-red-600'
		default:
			return 'text-gray-600'
	}
}

const getEvidenceBadgeClass = (level: EvidenceLevel) => {
	switch (level) {
		case 'A':
			return 'bg-green-100 text-green-800 border-green-300'
		case 'B':
			return 'bg-blue-100 text-blue-800 border-blue-300'
		case 'C':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300'
		case 'D':
			return 'bg-gray-100 text-gray-800 border-gray-300'
	}
}

const getConfidenceGradeBadge = (grade: ConfidenceResult['grade']) => {
	switch (grade) {
		case 'HIGH':
			return 'bg-green-100 text-green-800 border-green-300'
		case 'MODERATE':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300'
		case 'LOW':
			return 'bg-orange-100 text-orange-800 border-orange-300'
		case 'INSUFFICIENT':
			return 'bg-red-100 text-red-800 border-red-300'
	}
}

const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
	A: 'Systematic Review / Meta-Analysis',
	B: 'Randomized Controlled Trial',
	C: 'Cohort / Case-Control Study',
	D: 'Expert Opinion / Case Report',
}

// ============================================
// Sub-Components
// ============================================

function ReferenceCard({ reference }: { reference: ClinicalReference }) {
	return (
		<div className='p-3 bg-muted/50 rounded-lg text-sm'>
			<a
				href={reference.url}
				target='_blank'
				rel='noopener noreferrer'
				className='font-medium text-primary hover:underline flex items-start gap-1'
			>
				{reference.title}
				<ExternalLink className='h-3 w-3 mt-0.5 shrink-0' />
			</a>
			<p className='text-muted-foreground mt-1'>
				{reference.authors.length > 3
					? `${reference.authors.slice(0, 3).join(', ')}, et al.`
					: reference.authors.join(', ')}
			</p>
			<div className='flex items-center gap-2 mt-1'>
				<span className='text-muted-foreground'>{reference.journal}</span>
				<span className='text-muted-foreground'>•</span>
				<span className='text-muted-foreground'>{reference.year}</span>
				{reference.pmid && (
					<>
						<span className='text-muted-foreground'>•</span>
						<span className='text-xs text-muted-foreground'>PMID: {reference.pmid}</span>
					</>
				)}
			</div>
		</div>
	)
}

function ConfidenceBreakdownDisplay({ confidence }: { confidence: ConfidenceResult }) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger asChild>
				<Button variant='ghost' size='sm' className='w-full justify-between'>
					<span className='text-sm'>View Confidence Breakdown</span>
					{isOpen ? (
						<ChevronUp className='h-4 w-4' />
					) : (
						<ChevronDown className='h-4 w-4' />
					)}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className='pt-2'>
				<div className='space-y-2'>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>Drug Validation</span>
						<div className='flex items-center gap-2'>
							<Progress value={confidence.breakdown.drugValidation} className='w-24 h-2' />
							<span className='w-10 text-right'>{confidence.breakdown.drugValidation}%</span>
						</div>
					</div>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>Safety Score</span>
						<div className='flex items-center gap-2'>
							<Progress value={confidence.breakdown.safetyScore} className='w-24 h-2' />
							<span className='w-10 text-right'>{confidence.breakdown.safetyScore}%</span>
						</div>
					</div>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>Evidence Score</span>
						<div className='flex items-center gap-2'>
							<Progress value={confidence.breakdown.evidenceScore} className='w-24 h-2' />
							<span className='w-10 text-right'>{confidence.breakdown.evidenceScore}%</span>
						</div>
					</div>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>Patient Factors</span>
						<div className='flex items-center gap-2'>
							<Progress value={confidence.breakdown.patientFactors} className='w-24 h-2' />
							<span className='w-10 text-right'>{confidence.breakdown.patientFactors}%</span>
						</div>
					</div>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>AI Base Score</span>
						<div className='flex items-center gap-2'>
							<Progress value={confidence.breakdown.aiBaseScore} className='w-24 h-2' />
							<span className='w-10 text-right'>{confidence.breakdown.aiBaseScore}%</span>
						</div>
					</div>
				</div>

				{confidence.warnings.length > 0 && (
					<div className='mt-3 p-2 bg-orange-50 rounded border border-orange-200'>
						<p className='text-xs font-medium text-orange-800 mb-1'>Warnings:</p>
						<ul className='text-xs text-orange-700 space-y-0.5'>
							{confidence.warnings.map((w, i) => (
								<li key={i}>• {w}</li>
							))}
						</ul>
					</div>
				)}

				{confidence.recommendations.length > 0 && (
					<div className='mt-2 p-2 bg-blue-50 rounded border border-blue-200'>
						<p className='text-xs font-medium text-blue-800 mb-1'>Recommendations:</p>
						<ul className='text-xs text-blue-700 space-y-0.5'>
							{confidence.recommendations.map((r, i) => (
								<li key={i}>• {r}</li>
							))}
						</ul>
					</div>
				)}
			</CollapsibleContent>
		</Collapsible>
	)
}

interface MedicationCardProps {
	medication: MedicationWithEvidence | {
		name: string
		genericName?: string
		dosage: string
		frequency: string
		duration: string
		route: string
		instructions?: string
		confidenceScore?: number
	}
}

function MedicationCard({ medication }: MedicationCardProps) {
	const [showReferences, setShowReferences] = useState(false)
	const isEnhanced = 'evidenceLevel' in medication

	return (
		<div className='p-4 border rounded-lg'>
			<div className='flex items-start justify-between mb-3'>
				<div>
					<div className='flex items-center gap-2'>
						<p className='font-medium'>{medication.name}</p>
						{isEnhanced && (
							<>
								{medication.fdaValidated ? (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<CheckCircle2 className='h-4 w-4 text-green-600' />
											</TooltipTrigger>
											<TooltipContent>
												<p>FDA Validated</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<XCircle className='h-4 w-4 text-orange-500' />
											</TooltipTrigger>
											<TooltipContent>
												<p>Not found in FDA database</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</>
						)}
					</div>
					{medication.genericName && (
						<p className='text-sm text-muted-foreground'>({medication.genericName})</p>
					)}
				</div>
				<div className='flex items-center gap-2'>
					{isEnhanced && (
						<Badge className={getEvidenceBadgeClass(medication.evidenceLevel)}>
							Level {medication.evidenceLevel}
						</Badge>
					)}
					{medication.confidenceScore !== undefined && (
						<Badge variant='outline'>{medication.confidenceScore}%</Badge>
					)}
				</div>
			</div>

			{isEnhanced && (
				<p className='text-xs text-muted-foreground mb-2'>
					{EVIDENCE_LABELS[medication.evidenceLevel]}
				</p>
			)}

			<div className='grid gap-2 sm:grid-cols-2 text-sm'>
				<div>
					<span className='text-muted-foreground'>Dosage:</span> {medication.dosage}
				</div>
				<div>
					<span className='text-muted-foreground'>Frequency:</span> {medication.frequency}
				</div>
				<div>
					<span className='text-muted-foreground'>Duration:</span> {medication.duration}
				</div>
				<div>
					<span className='text-muted-foreground'>Route:</span> {medication.route}
				</div>
			</div>

			{medication.instructions && (
				<p className='text-sm mt-2 text-muted-foreground'>
					<strong>Instructions:</strong> {medication.instructions}
				</p>
			)}

			{isEnhanced && (medication.renalAdjustment || medication.hepaticAdjustment) && (
				<div className='mt-2 p-2 bg-muted rounded text-sm'>
					{medication.renalAdjustment && (
						<p>
							<strong>Renal Adjustment:</strong> {medication.renalAdjustment}
						</p>
					)}
					{medication.hepaticAdjustment && (
						<p>
							<strong>Hepatic Adjustment:</strong> {medication.hepaticAdjustment}
						</p>
					)}
				</div>
			)}

			{isEnhanced && medication.references && medication.references.length > 0 && (
				<div className='mt-3'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setShowReferences(!showReferences)}
						className='text-primary'
					>
						<BookOpen className='h-4 w-4 mr-1' />
						{showReferences ? 'Hide' : 'Show'} References ({medication.references.length})
					</Button>
					{showReferences && (
						<div className='mt-2 space-y-2'>
							{medication.references.map((ref, i) => (
								<ReferenceCard key={i} reference={ref} />
							))}
						</div>
					)}
				</div>
			)}

			{isEnhanced && medication.confidenceDetails && (
				<div className='mt-3 border-t pt-3'>
					<ConfidenceBreakdownDisplay confidence={medication.confidenceDetails} />
				</div>
			)}
		</div>
	)
}

// ============================================
// Main Component
// ============================================

export function StepAIAnalysis({
	formData,
	isAnalyzing,
	analysisError,
	onRunAnalysis,
}: StepAIAnalysisProps) {
	const analysis = formData.aiAnalysis
	const hasEnhancedAnalysis = analysis && 'overallConfidence' in analysis
	const enhancedAnalysis = hasEnhancedAnalysis ? analysis as unknown as {
		overallConfidence: ConfidenceResult
		disclaimer: string
		generationMetadata: {
			model: string
			temperature: number
			validationSources: string[]
			generatedAt: string
		}
	} : null

	if (isAnalyzing) {
		return (
			<Card className='overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 animate-shimmer' />
				<CardContent className='relative flex flex-col items-center justify-center py-16'>
					<AILoadingAnimation
						size='lg'
						label='Analyzing Patient Data'
						sublabel='AI is reviewing patient information, validating medications with FDA databases, and fetching clinical references...'
					/>
					<div className='mt-8 w-full max-w-md space-y-3'>
						<div className='flex items-center gap-3 text-sm text-muted-foreground'>
							<div className='h-2 w-2 rounded-full bg-violet-500 animate-pulse' />
							<span>Reviewing patient medical history</span>
						</div>
						<div className='flex items-center gap-3 text-sm text-muted-foreground'>
							<div className='h-2 w-2 rounded-full bg-purple-500 animate-pulse' style={{ animationDelay: '300ms' }} />
							<span>Validating medications with FDA database</span>
						</div>
						<div className='flex items-center gap-3 text-sm text-muted-foreground'>
							<div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse' style={{ animationDelay: '600ms' }} />
							<span>Fetching clinical references from PubMed</span>
						</div>
					</div>
					<p className='text-xs text-muted-foreground mt-6'>
						This may take 10-20 seconds
					</p>
				</CardContent>
			</Card>
		)
	}

	if (!analysis) {
		return (
			<Card className='overflow-hidden'>
				<CardContent className='flex flex-col items-center justify-center py-16'>
					<div className='relative mb-6'>
						<div className='absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-xl' />
						<div className='relative bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 p-6 rounded-full'>
							<Sparkles className='h-12 w-12 text-violet-600 dark:text-violet-400' />
						</div>
					</div>
					<h3 className='text-lg font-medium mb-2'>Ready for AI Analysis</h3>
					<p className='text-muted-foreground text-center mb-6 max-w-md'>
						Click the button below to analyze the patient data and generate evidence-based
						treatment recommendations with clinical references.
					</p>
					{analysisError && (
						<div className='mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20'>
							<p className='text-sm text-destructive'>{analysisError}</p>
						</div>
					)}
					<Button
						onClick={onRunAnalysis}
						size='lg'
						className='bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25'
					>
						<AISparkleIcon className='mr-2' />
						Run AI Analysis
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Disclaimer Banner */}
			{enhancedAnalysis?.disclaimer && (
				<div className='p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3'>
					<Info className='h-5 w-5 text-blue-600 shrink-0 mt-0.5' />
					<div>
						<p className='text-sm text-blue-800 font-medium'>Important Notice</p>
						<p className='text-sm text-blue-700'>{enhancedAnalysis.disclaimer}</p>
					</div>
				</div>
			)}

			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-medium'>AI Analysis Results</h3>
					<p className='text-sm text-muted-foreground'>
						Generated at {new Date(analysis.generatedAt).toLocaleString()}
						{enhancedAnalysis?.generationMetadata && (
							<span className='ml-2'>
								• Model: {enhancedAnalysis.generationMetadata.model}
							</span>
						)}
					</p>
				</div>
				<Button variant='outline' onClick={onRunAnalysis}>
					<RefreshCw className='h-4 w-4 mr-2' />
					Re-analyze
				</Button>
			</div>

			{/* Overall Confidence Card */}
			{enhancedAnalysis?.overallConfidence && (
				<Card>
					<CardHeader className='pb-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<FileText className='h-5 w-5 text-primary' />
								<CardTitle className='text-lg'>Overall Confidence Assessment</CardTitle>
							</div>
							<Badge className={getConfidenceGradeBadge(enhancedAnalysis.overallConfidence.grade)}>
								{enhancedAnalysis.overallConfidence.grade}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-3 mb-4'>
							<span className='text-3xl font-bold'>
								{enhancedAnalysis.overallConfidence.overallScore}%
							</span>
							<div className='flex-1'>
								<Progress
									value={enhancedAnalysis.overallConfidence.overallScore}
									className='h-3'
								/>
							</div>
						</div>
						<ConfidenceBreakdownDisplay confidence={enhancedAnalysis.overallConfidence} />
					</CardContent>
				</Card>
			)}

			{/* Risk Assessment Card */}
			<Card
				className={`border-2 ${
					analysis.riskLevel === 'HIGH'
						? 'border-red-300 bg-red-50/50'
						: analysis.riskLevel === 'MEDIUM'
							? 'border-yellow-300 bg-yellow-50/50'
							: 'border-green-300 bg-green-50/50'
				}`}
			>
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

			{/* Safety Alerts */}
			{(analysis.drugInteractions.length > 0 ||
				analysis.contraindications.length > 0) && (
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
											<Badge
												variant='outline'
												className={getSeverityColor(interaction.severity)}
											>
												{interaction.severity}
											</Badge>
										</div>
										<p className='text-sm text-muted-foreground'>
											{interaction.description}
										</p>
										<p className='text-sm mt-1'>
											<strong>Recommendation:</strong> {interaction.recommendation}
										</p>
										{interaction.source && (
											<p className='text-xs text-muted-foreground mt-1'>
												Source: {interaction.source}
											</p>
										)}
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
											<Badge
												variant='outline'
												className={
													contra.severity === 'Absolute'
														? 'text-red-600'
														: 'text-yellow-600'
												}
											>
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

			{/* Recommended Medications */}
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
							<MedicationCard key={i} medication={med as MedicationWithEvidence} />
						))}
					</div>
				</CardContent>
			</Card>

			{/* Alternative Treatment Options */}
			{analysis.alternatives.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Alternative Treatment Options</CardTitle>
						<CardDescription>
							Consider these alternatives if primary treatment is not suitable
						</CardDescription>
					</CardHeader>
					<CardContent>
						{analysis.alternatives.map((alt, i) => (
							<div key={i} className='p-4 border rounded-lg mb-3 last:mb-0'>
								<div className='flex items-center justify-between mb-2'>
									<p className='font-medium'>Alternative Plan {i + 1}</p>
									<Badge className={getRiskBadgeVariant(alt.riskLevel)}>
										{alt.riskLevel} Risk
									</Badge>
								</div>
								<p className='text-sm text-muted-foreground mb-2'>{alt.rationale}</p>
								<div className='space-y-2'>
									{alt.medications.map((med, j) => (
										<div key={j} className='text-sm'>
											<span className='font-medium'>{med.name}</span> - {med.dosage},{' '}
											{med.frequency}
										</div>
									))}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Data Sources */}
			{enhancedAnalysis?.generationMetadata?.validationSources && (
				<div className='text-center text-sm text-muted-foreground'>
					<p>
						Validated against:{' '}
						{enhancedAnalysis.generationMetadata.validationSources.join(', ')}
					</p>
				</div>
			)}
		</div>
	)
}
