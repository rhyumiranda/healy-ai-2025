import { Shield, Brain, Database, CheckCircle2, AlertTriangle, ClipboardList, Edit, FileCheck } from 'lucide-react'

export const STATS = [
	{ 
		value: '80%', 
		label: 'Error Reduction',
		description: 'Automated safety checks prevent medication errors before they occur',
		numericValue: 80,
		suffix: '%'
	},
	{ 
		value: '2.5x', 
		label: 'Faster Decisions',
		description: 'AI-powered recommendations accelerate treatment planning workflow',
		numericValue: 2.5,
		suffix: 'x'
	},
	{ 
		value: '99.9%', 
		label: 'Uptime SLA',
		description: 'Enterprise-grade reliability ensures continuous access when you need it',
		numericValue: 99.9,
		suffix: '%'
	}
] as const

export const FEATURES = [
	{
		icon: Shield,
		title: 'Safety Risk Assessment',
		description: 'Real-time risk scoring with automated contraindication and drug interaction detection',
		bgColor: 'bg-blue-100',
		iconColor: 'text-blue-600'
	},
	{
		icon: Brain,
		title: 'AI-Powered Recommendations',
		description: 'Intelligent treatment plans generated from patient history and clinical best practices',
		bgColor: 'bg-green-100',
		iconColor: 'text-green-600'
	},
	{
		icon: Database,
		title: 'Pattern Learning',
		description: 'System learns from historical patterns to improve recommendations and identify complications',
		bgColor: 'bg-purple-100',
		iconColor: 'text-purple-600'
	},
	{
		icon: CheckCircle2,
		title: 'Structured Output',
		description: 'Parseable JSON schema output for seamless integration with clinical workflows',
		bgColor: 'bg-amber-100',
		iconColor: 'text-amber-600'
	}
] as const

export const WORKFLOW_STEPS = [
	{
		step: 1,
		icon: ClipboardList,
		title: 'Intake Phase',
		description: 'Comprehensive patient data collection',
		details: [
			'Patient data collection',
			'Medical history input',
			'Current condition documentation'
		]
	},
	{
		step: 2,
		icon: Brain,
		title: 'AI Analysis Phase',
		description: 'Intelligent treatment plan generation',
		details: [
			'Gemini LLM processes patient data',
			'Generates treatment plan recommendations',
			'Performs safety checks and risk assessments'
		]
	},
	{
		step: 3,
		icon: Edit,
		title: 'Doctor Review/Edit Phase',
		description: 'Expert oversight and customization',
		details: [
			'Review AI-generated plan',
			'Approve, modify, or reject recommendations',
			'Edit medications, dosages, or durations',
			'Review flagged risks and alternatives'
		]
	},
	{
		step: 4,
		icon: FileCheck,
		title: 'Final Summary Phase',
		description: 'Complete treatment documentation',
		details: [
			'Display approved/modified treatment plan',
			'Show final risk assessments',
			'Generate structured output for clinical records'
		]
	}
] as const

export const COMPLIANCE_FEATURES = [
	{
		title: 'HIPAA Compliant',
		description: 'Full compliance with healthcare data protection standards'
	},
	{
		title: 'End-to-End Encryption',
		description: 'Military-grade encryption for all patient data'
	},
	{
		title: 'Audit Trails',
		description: 'Complete logging of all actions and decisions'
	},
	{
		title: 'SOC 2 Type II',
		description: 'Certified security and availability controls'
	}
] as const

export const FOOTER_LINKS = [
	{ label: 'Privacy Policy', href: '#' },
	{ label: 'Terms of Service', href: '#' },
	{ label: 'Contact', href: '#' }
] as const

export const NAV_LINKS = {
	login: '/auth/login',
	register: '/auth/register'
} as const

