import { AssistantService } from './assistant.service'

interface DrugInteractionEntry {
	drug1: string
	drug2: string
	severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated'
	description: string
	recommendation: string
	mechanism?: string
}

interface ClinicalGuideline {
	condition: string
	category: string
	source: string
	lastUpdated: string
	recommendations: Array<{
		strength: 'Strong' | 'Moderate' | 'Weak'
		recommendation: string
		evidence: string
	}>
	firstLineTherapies: string[]
	alternatives: string[]
	contraindications: string[]
	specialPopulations?: {
		pediatric?: string
		geriatric?: string
		pregnancy?: string
		renalImpairment?: string
		hepaticImpairment?: string
	}
}

interface TreatmentProtocol {
	condition: string
	severity: 'Mild' | 'Moderate' | 'Severe'
	medications: Array<{
		name: string
		genericName: string
		dosage: string
		frequency: string
		duration: string
		route: string
		notes?: string
	}>
	monitoring: string[]
	followUp: string
	redFlags: string[]
}

export class KnowledgeSeederService {
	static async seedAllKnowledge(): Promise<{
		drugInteractions: number
		clinicalGuidelines: number
		treatmentProtocols: number
	}> {
		console.log('Starting knowledge base seeding...')

		const drugInteractionsCount = await this.seedDrugInteractions()
		const clinicalGuidelinesCount = await this.seedClinicalGuidelines()
		const treatmentProtocolsCount = await this.seedTreatmentProtocols()

		console.log('Knowledge base seeding complete!')
		console.log(`- Drug interactions: ${drugInteractionsCount} entries`)
		console.log(`- Clinical guidelines: ${clinicalGuidelinesCount} entries`)
		console.log(`- Treatment protocols: ${treatmentProtocolsCount} entries`)

		return {
			drugInteractions: drugInteractionsCount,
			clinicalGuidelines: clinicalGuidelinesCount,
			treatmentProtocols: treatmentProtocolsCount,
		}
	}

	static async seedDrugInteractions(): Promise<number> {
		const interactions: DrugInteractionEntry[] = [
			{
				drug1: 'Warfarin',
				drug2: 'Aspirin',
				severity: 'Major',
				description: 'Increased risk of bleeding when warfarin is combined with aspirin',
				recommendation: 'Avoid combination unless specifically indicated. If used together, monitor INR closely and watch for signs of bleeding.',
				mechanism: 'Both drugs affect hemostasis through different mechanisms',
			},
			{
				drug1: 'ACE Inhibitors',
				drug2: 'Potassium-sparing diuretics',
				severity: 'Major',
				description: 'Risk of hyperkalemia when ACE inhibitors are combined with potassium-sparing diuretics',
				recommendation: 'Monitor potassium levels closely. Consider alternative diuretic.',
				mechanism: 'Both drugs can increase serum potassium levels',
			},
			{
				drug1: 'SSRIs',
				drug2: 'MAOIs',
				severity: 'Contraindicated',
				description: 'Risk of serotonin syndrome - potentially fatal',
				recommendation: 'Never combine. Allow 14-day washout period between medications.',
				mechanism: 'Excessive serotonergic activity',
			},
			{
				drug1: 'Metformin',
				drug2: 'Iodinated contrast media',
				severity: 'Major',
				description: 'Risk of lactic acidosis',
				recommendation: 'Hold metformin before and 48 hours after contrast administration. Check renal function before restarting.',
			},
			{
				drug1: 'Fluoroquinolones',
				drug2: 'NSAIDs',
				severity: 'Moderate',
				description: 'Increased risk of CNS stimulation and seizures',
				recommendation: 'Use with caution, especially in patients with seizure history.',
			},
			{
				drug1: 'Statins',
				drug2: 'Macrolide antibiotics',
				severity: 'Major',
				description: 'Increased statin levels leading to myopathy risk',
				recommendation: 'Consider temporary statin discontinuation or use azithromycin which has less interaction.',
			},
			{
				drug1: 'Digoxin',
				drug2: 'Amiodarone',
				severity: 'Major',
				description: 'Amiodarone increases digoxin levels by 70-100%',
				recommendation: 'Reduce digoxin dose by 50% when starting amiodarone. Monitor levels.',
			},
			{
				drug1: 'Clopidogrel',
				drug2: 'Omeprazole',
				severity: 'Moderate',
				description: 'Omeprazole may reduce antiplatelet effect of clopidogrel',
				recommendation: 'Consider pantoprazole as alternative PPI.',
			},
			{
				drug1: 'Lithium',
				drug2: 'NSAIDs',
				severity: 'Major',
				description: 'NSAIDs can increase lithium levels by reducing renal clearance',
				recommendation: 'Avoid if possible. If necessary, monitor lithium levels closely.',
			},
			{
				drug1: 'Methotrexate',
				drug2: 'Trimethoprim',
				severity: 'Contraindicated',
				description: 'Severe bone marrow suppression',
				recommendation: 'Avoid combination. Use alternative antibiotic.',
			},
			{
				drug1: 'Theophylline',
				drug2: 'Ciprofloxacin',
				severity: 'Major',
				description: 'Ciprofloxacin inhibits theophylline metabolism, causing toxicity',
				recommendation: 'Reduce theophylline dose by 30-50% or use alternative antibiotic.',
			},
			{
				drug1: 'Beta-blockers',
				drug2: 'Verapamil',
				severity: 'Major',
				description: 'Risk of severe bradycardia, heart block, and heart failure',
				recommendation: 'Avoid combination or use with extreme caution under close monitoring.',
			},
		]

		const content = {
			title: 'Drug Interaction Database',
			description: 'Common clinically significant drug-drug interactions',
			lastUpdated: new Date().toISOString(),
			totalEntries: interactions.length,
			interactions,
		}

		const buffer = Buffer.from(JSON.stringify(content, null, 2))
		await AssistantService.uploadKnowledgeFile(buffer, 'drug-interactions.json', 'drug-interactions')

		return interactions.length
	}

	static async seedClinicalGuidelines(): Promise<number> {
		const guidelines: ClinicalGuideline[] = [
			{
				condition: 'Hypertension',
				category: 'Cardiovascular',
				source: 'AHA/ACC Guidelines 2023',
				lastUpdated: '2023-11-01',
				recommendations: [
					{
						strength: 'Strong',
						recommendation: 'Initiate antihypertensive drug therapy at BP ≥130/80 mmHg with ASCVD or 10-year ASCVD risk ≥10%',
						evidence: 'Level A - Multiple RCTs',
					},
					{
						strength: 'Strong',
						recommendation: 'First-line agents include thiazide diuretics, ACE inhibitors, ARBs, or calcium channel blockers',
						evidence: 'Level A - Multiple RCTs',
					},
				],
				firstLineTherapies: ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide', 'Losartan'],
				alternatives: ['Metoprolol', 'Chlorthalidone', 'Valsartan'],
				contraindications: ['ACE inhibitors in pregnancy', 'Beta-blockers in severe asthma'],
				specialPopulations: {
					geriatric: 'Start with lower doses, slower titration',
					pregnancy: 'Labetalol, nifedipine, or methyldopa preferred',
					renalImpairment: 'ACE inhibitors/ARBs preferred for proteinuria but monitor potassium',
				},
			},
			{
				condition: 'Type 2 Diabetes Mellitus',
				category: 'Endocrine',
				source: 'ADA Standards of Care 2024',
				lastUpdated: '2024-01-01',
				recommendations: [
					{
						strength: 'Strong',
						recommendation: 'Metformin remains first-line therapy for most patients',
						evidence: 'Level A',
					},
					{
						strength: 'Strong',
						recommendation: 'Add GLP-1 RA or SGLT2 inhibitor for patients with ASCVD, HF, or CKD',
						evidence: 'Level A',
					},
				],
				firstLineTherapies: ['Metformin'],
				alternatives: ['SGLT2 inhibitors', 'GLP-1 receptor agonists', 'DPP-4 inhibitors'],
				contraindications: ['Metformin in eGFR <30', 'SGLT2 inhibitors in recurrent UTIs'],
				specialPopulations: {
					geriatric: 'Less stringent A1C targets (7.5-8.0%) to reduce hypoglycemia risk',
					renalImpairment: 'Adjust metformin dose; SGLT2 inhibitors for renoprotection',
				},
			},
			{
				condition: 'Community-Acquired Pneumonia',
				category: 'Infectious Disease',
				source: 'IDSA/ATS Guidelines 2019',
				lastUpdated: '2019-10-01',
				recommendations: [
					{
						strength: 'Strong',
						recommendation: 'Outpatient without comorbidities: Amoxicillin or doxycycline or macrolide',
						evidence: 'Level I',
					},
					{
						strength: 'Strong',
						recommendation: 'Outpatient with comorbidities: Respiratory fluoroquinolone OR beta-lactam + macrolide',
						evidence: 'Level I',
					},
				],
				firstLineTherapies: ['Amoxicillin', 'Azithromycin', 'Doxycycline'],
				alternatives: ['Levofloxacin', 'Moxifloxacin', 'Amoxicillin-clavulanate'],
				contraindications: ['Fluoroquinolones in tendon disorders', 'Doxycycline in pregnancy'],
			},
			{
				condition: 'Acute Otitis Media',
				category: 'Infectious Disease',
				source: 'AAP Guidelines 2013',
				lastUpdated: '2013-02-01',
				recommendations: [
					{
						strength: 'Strong',
						recommendation: 'Amoxicillin 80-90 mg/kg/day as first-line therapy',
						evidence: 'Level B',
					},
					{
						strength: 'Moderate',
						recommendation: 'Observation without antibiotics appropriate for select patients',
						evidence: 'Level B',
					},
				],
				firstLineTherapies: ['Amoxicillin'],
				alternatives: ['Amoxicillin-clavulanate', 'Ceftriaxone', 'Cefdinir'],
				contraindications: ['Penicillin allergy'],
				specialPopulations: {
					pediatric: 'Standard dosing: 80-90 mg/kg/day divided BID',
				},
			},
			{
				condition: 'Major Depressive Disorder',
				category: 'Psychiatry',
				source: 'APA Practice Guideline 2019',
				lastUpdated: '2019-05-01',
				recommendations: [
					{
						strength: 'Strong',
						recommendation: 'SSRIs, SNRIs, or bupropion as first-line pharmacotherapy',
						evidence: 'Level I',
					},
					{
						strength: 'Moderate',
						recommendation: 'Psychotherapy alone appropriate for mild-moderate depression',
						evidence: 'Level I',
					},
				],
				firstLineTherapies: ['Sertraline', 'Escitalopram', 'Fluoxetine', 'Venlafaxine'],
				alternatives: ['Bupropion', 'Mirtazapine', 'Duloxetine'],
				contraindications: ['MAOIs within 14 days', 'Bupropion in seizure disorders'],
				specialPopulations: {
					geriatric: 'Start low, go slow. Watch for hyponatremia with SSRIs.',
					pregnancy: 'Sertraline considered safest SSRI',
				},
			},
			{
				condition: 'GERD',
				category: 'Gastroenterology',
				source: 'ACG Guidelines 2022',
				lastUpdated: '2022-01-01',
				recommendations: [
					{
						strength: 'Strong',
						recommendation: 'PPI therapy for 8 weeks for erosive esophagitis',
						evidence: 'High',
					},
					{
						strength: 'Moderate',
						recommendation: 'On-demand PPI therapy for NERD maintenance',
						evidence: 'Moderate',
					},
				],
				firstLineTherapies: ['Omeprazole', 'Esomeprazole', 'Pantoprazole'],
				alternatives: ['H2 blockers', 'Antacids'],
				contraindications: ['Long-term PPI with osteoporosis risk'],
			},
		]

		const content = {
			title: 'Clinical Practice Guidelines',
			description: 'Evidence-based clinical guidelines for common conditions',
			lastUpdated: new Date().toISOString(),
			totalGuidelines: guidelines.length,
			guidelines,
		}

		const buffer = Buffer.from(JSON.stringify(content, null, 2))
		await AssistantService.uploadKnowledgeFile(buffer, 'clinical-guidelines.json', 'clinical-guidelines')

		return guidelines.length
	}

	static async seedTreatmentProtocols(): Promise<number> {
		const protocols: TreatmentProtocol[] = [
			{
				condition: 'Urinary Tract Infection (Uncomplicated)',
				severity: 'Mild',
				medications: [
					{
						name: 'Nitrofurantoin',
						genericName: 'Nitrofurantoin monohydrate/macrocrystals',
						dosage: '100mg',
						frequency: 'Twice daily',
						duration: '5 days',
						route: 'Oral',
						notes: 'Take with food. Not for use if CrCl <30 mL/min',
					},
				],
				monitoring: ['Symptom resolution within 48-72 hours', 'Urinalysis if symptoms persist'],
				followUp: 'No routine follow-up needed if symptoms resolve',
				redFlags: ['Fever >38.3°C', 'Flank pain', 'Nausea/vomiting', 'Pregnancy'],
			},
			{
				condition: 'Strep Pharyngitis',
				severity: 'Mild',
				medications: [
					{
						name: 'Penicillin VK',
						genericName: 'Penicillin V Potassium',
						dosage: '500mg',
						frequency: 'Twice daily',
						duration: '10 days',
						route: 'Oral',
					},
				],
				monitoring: ['Symptom improvement within 24-48 hours'],
				followUp: 'Return if symptoms worsen or no improvement in 48 hours',
				redFlags: ['Difficulty breathing', 'Drooling', 'Severe neck swelling'],
			},
			{
				condition: 'Acute Bronchitis',
				severity: 'Mild',
				medications: [
					{
						name: 'Dextromethorphan',
						genericName: 'Dextromethorphan HBr',
						dosage: '10-20mg',
						frequency: 'Every 4 hours as needed',
						duration: 'Until symptoms resolve',
						route: 'Oral',
						notes: 'Avoid in productive cough. Max 120mg/day',
					},
					{
						name: 'Guaifenesin',
						genericName: 'Guaifenesin',
						dosage: '200-400mg',
						frequency: 'Every 4 hours',
						duration: 'Until symptoms resolve',
						route: 'Oral',
						notes: 'Increase fluid intake',
					},
				],
				monitoring: ['Symptom duration typically 2-3 weeks', 'Watch for secondary bacterial infection'],
				followUp: 'Return if fever develops, symptoms worsen, or persist >3 weeks',
				redFlags: ['High fever', 'Hemoptysis', 'Severe dyspnea', 'Immunocompromised'],
			},
			{
				condition: 'Migraine',
				severity: 'Moderate',
				medications: [
					{
						name: 'Sumatriptan',
						genericName: 'Sumatriptan succinate',
						dosage: '50-100mg',
						frequency: 'At onset, may repeat in 2 hours if needed',
						duration: 'As needed',
						route: 'Oral',
						notes: 'Max 200mg/24 hours. Contraindicated in cardiovascular disease.',
					},
					{
						name: 'Naproxen',
						genericName: 'Naproxen sodium',
						dosage: '500-550mg',
						frequency: 'With triptan, then every 12 hours if needed',
						duration: 'As needed',
						route: 'Oral',
						notes: 'Can be combined with triptan for better efficacy',
					},
				],
				monitoring: ['Headache frequency', 'Medication overuse (>10 days/month)'],
				followUp: 'Consider prophylaxis if >4 migraines/month',
				redFlags: ['Worst headache of life', 'Fever with stiff neck', 'Neurological deficits', 'Age >50 new onset'],
			},
			{
				condition: 'Allergic Rhinitis',
				severity: 'Mild',
				medications: [
					{
						name: 'Fluticasone nasal spray',
						genericName: 'Fluticasone propionate',
						dosage: '50mcg/spray, 2 sprays each nostril',
						frequency: 'Once daily',
						duration: 'Seasonal or ongoing',
						route: 'Intranasal',
						notes: 'Most effective when used regularly. May take 1-2 weeks for full effect.',
					},
					{
						name: 'Cetirizine',
						genericName: 'Cetirizine HCl',
						dosage: '10mg',
						frequency: 'Once daily',
						duration: 'As needed',
						route: 'Oral',
						notes: 'May cause drowsiness in some patients',
					},
				],
				monitoring: ['Symptom control', 'Nasal septum with prolonged steroid use'],
				followUp: 'Annual review if on regular therapy',
				redFlags: ['Unilateral symptoms', 'Bloody discharge', 'Severe facial pain'],
			},
		]

		const content = {
			title: 'Treatment Protocols',
			description: 'Standard treatment protocols for common conditions by severity',
			lastUpdated: new Date().toISOString(),
			totalProtocols: protocols.length,
			protocols,
		}

		const buffer = Buffer.from(JSON.stringify(content, null, 2))
		await AssistantService.uploadKnowledgeFile(buffer, 'treatment-protocols.json', 'treatment-protocols')

		return protocols.length
	}

	static async seedDrugDatabase(): Promise<number> {
		const drugs = [
			{
				name: 'Lisinopril',
				genericName: 'Lisinopril',
				class: 'ACE Inhibitor',
				indications: ['Hypertension', 'Heart Failure', 'Post-MI', 'Diabetic Nephropathy'],
				dosing: {
					adult: '5-40mg once daily',
					pediatric: '0.07-0.6 mg/kg/day',
					geriatric: 'Start 2.5-5mg, titrate slowly',
					renal: 'CrCl <30: Start 2.5mg daily',
				},
				contraindications: ['Pregnancy', 'History of angioedema with ACE inhibitors', 'Bilateral renal artery stenosis'],
				sideEffects: ['Dry cough (10-15%)', 'Hyperkalemia', 'Angioedema (rare)', 'Dizziness'],
				monitoring: ['Potassium', 'Creatinine', 'Blood pressure'],
				blackBoxWarning: 'Can cause fetal toxicity when used during pregnancy',
			},
			{
				name: 'Metformin',
				genericName: 'Metformin HCl',
				class: 'Biguanide',
				indications: ['Type 2 Diabetes Mellitus', 'PCOS'],
				dosing: {
					adult: '500-2550mg daily in divided doses',
					pediatric: '500-2000mg daily (≥10 years)',
					geriatric: 'Assess renal function before starting',
					renal: 'eGFR 30-45: max 1000mg/day; eGFR <30: contraindicated',
				},
				contraindications: ['eGFR <30', 'Metabolic acidosis', 'Use of iodinated contrast'],
				sideEffects: ['GI upset (30%)', 'B12 deficiency', 'Lactic acidosis (rare)'],
				monitoring: ['eGFR annually', 'B12 if on long-term', 'A1C every 3-6 months'],
			},
			{
				name: 'Omeprazole',
				genericName: 'Omeprazole',
				class: 'Proton Pump Inhibitor',
				indications: ['GERD', 'Peptic Ulcer Disease', 'H. pylori (with antibiotics)', 'Zollinger-Ellison'],
				dosing: {
					adult: '20-40mg daily',
					pediatric: '0.7-3.3 mg/kg/day',
					geriatric: 'No adjustment needed',
				},
				contraindications: ['Hypersensitivity to PPIs'],
				sideEffects: ['Headache', 'Diarrhea', 'C. diff risk', 'Hypomagnesemia', 'B12 deficiency'],
				monitoring: ['Magnesium if long-term', 'Symptoms'],
				interactions: ['Clopidogrel (reduces efficacy)', 'Methotrexate (increases levels)'],
			},
			{
				name: 'Amoxicillin',
				genericName: 'Amoxicillin',
				class: 'Aminopenicillin',
				indications: ['Strep pharyngitis', 'Otitis media', 'Sinusitis', 'H. pylori', 'Pneumonia'],
				dosing: {
					adult: '250-500mg TID or 500-875mg BID',
					pediatric: '25-50 mg/kg/day divided TID or 80-90 mg/kg/day for AOM',
					renal: 'CrCl <30: Extend interval to q12h',
				},
				contraindications: ['Penicillin allergy', 'History of amoxicillin-associated hepatic dysfunction'],
				sideEffects: ['Diarrhea', 'Rash', 'Nausea'],
				monitoring: ['Signs of allergic reaction', 'C. diff if diarrhea develops'],
			},
			{
				name: 'Sertraline',
				genericName: 'Sertraline HCl',
				class: 'SSRI',
				indications: ['Depression', 'Anxiety disorders', 'PTSD', 'OCD', 'Panic disorder'],
				dosing: {
					adult: '50-200mg daily',
					pediatric: '25-200mg daily (OCD in children ≥6)',
					geriatric: 'Start 25mg, titrate slowly',
				},
				contraindications: ['MAOI use within 14 days', 'Pimozide use', 'Disulfiram use (liquid form)'],
				sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction', 'Headache'],
				monitoring: ['Suicidality (especially in young adults)', 'Symptoms'],
				blackBoxWarning: 'Increased risk of suicidal thinking in children, adolescents, and young adults',
			},
		]

		const content = {
			title: 'Drug Reference Database',
			description: 'Comprehensive drug information including dosing, contraindications, and monitoring',
			lastUpdated: new Date().toISOString(),
			totalDrugs: drugs.length,
			drugs,
		}

		const buffer = Buffer.from(JSON.stringify(content, null, 2))
		await AssistantService.uploadKnowledgeFile(buffer, 'drug-database.json', 'general')

		return drugs.length
	}
}
