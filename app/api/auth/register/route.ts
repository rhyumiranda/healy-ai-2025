import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken, getVerificationTokenExpiry } from '@/lib/auth-utils'
import { EmailService } from '@/lib/services/email.service'
import { DoctorService } from '@/lib/services/doctor.service'

const registerSchema = z.object({
	fullName: z.string().min(2, 'Full name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number')
		.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
	confirmPassword: z.string(),
	medicalLicenseNumber: z.string().min(5, 'Medical license number is required'),
	specialty: z.string().min(2, 'Specialty is required'),
	phoneNumber: z.string().min(10, 'Valid phone number is required'),
	acceptTerms: z.boolean().refine((val) => val === true, {
		message: 'You must accept the terms and conditions',
	}),
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
})

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const validatedData = registerSchema.parse(body)

		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
		})

		if (existingUser) {
			return NextResponse.json(
				{ error: 'Email already registered' },
				{ status: 400 }
			)
		}

		const isLicenseUnique = await DoctorService.checkLicenseUniqueness(
			validatedData.medicalLicenseNumber
		)

		if (!isLicenseUnique) {
			return NextResponse.json(
				{ error: 'Medical license number already registered' },
				{ status: 400 }
			)
		}

		const hashedPassword = await hashPassword(validatedData.password)
		const verificationToken = generateVerificationToken()
		const tokenExpiry = getVerificationTokenExpiry()

		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: validatedData.email,
					name: validatedData.fullName,
					password: hashedPassword,
				},
			})

			const doctorProfile = await tx.doctorProfile.create({
				data: {
					userId: user.id,
					fullName: validatedData.fullName,
					medicalLicenseNumber: validatedData.medicalLicenseNumber,
					specialty: validatedData.specialty,
					phoneNumber: validatedData.phoneNumber,
					isVerified: false,
				},
			})

			await tx.verificationToken.create({
				data: {
					identifier: user.email,
					token: verificationToken,
					expires: tokenExpiry,
				},
			})

			return { user, doctorProfile }
		})

		console.log('📧 Sending verification email for registration...')
		try {
			await EmailService.sendVerificationEmail({
				email: result.user.email,
				name: validatedData.fullName,
				token: verificationToken,
			})
			console.log('✅ Verification email sent successfully')
		} catch (emailError) {
			console.error('❌ Failed to send verification email:', emailError)
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Registration successful. Please check your email to verify your account.',
				user: {
					id: result.user.id,
					email: result.user.email,
					name: result.user.name,
				},
			},
			{ status: 201 }
		)
	} catch (error) {
		console.error('Registration error:', error)

		if (error instanceof z.ZodError) {
			const firstError = error.issues[0]
			return NextResponse.json(
				{ error: firstError.message },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Something went wrong during registration. Please try again.' },
			{ status: 500 }
		)
	}
}

