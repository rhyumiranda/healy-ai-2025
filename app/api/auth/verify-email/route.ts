import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/services/email.service'

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const token = searchParams.get('token')

		if (!token) {
			return NextResponse.json(
				{ error: 'Verification token is required' },
				{ status: 400 }
			)
		}

		const verificationToken = await prisma.verificationToken.findUnique({
			where: { token },
		})

		if (!verificationToken) {
			return NextResponse.json(
				{ error: 'Invalid or expired verification token' },
				{ status: 400 }
			)
		}

		if (verificationToken.expires < new Date()) {
			await prisma.verificationToken.delete({
				where: { token },
			})
			return NextResponse.json(
				{ error: 'Verification token has expired. Please request a new one.' },
				{ status: 400 }
			)
		}

		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { email: verificationToken.identifier },
				include: { doctorProfile: true },
			})

			if (!user) {
				throw new Error('User not found')
			}

			if (user.emailVerified) {
				return { user, alreadyVerified: true }
			}

			const updatedUser = await tx.user.update({
				where: { id: user.id },
				data: { emailVerified: new Date() },
			})

			if (user.doctorProfile) {
				await tx.doctorProfile.update({
					where: { userId: user.id },
					data: { isVerified: true },
				})
			}

			await tx.verificationToken.delete({
				where: { token },
			})

			return { user: updatedUser, alreadyVerified: false }
		})

		if (!result.alreadyVerified) {
			await EmailService.sendWelcomeEmail(
				result.user.email,
				result.user.name || 'Doctor'
			)
		}

		return NextResponse.json({
			success: true,
			message: result.alreadyVerified
				? 'Email already verified'
				: 'Email verified successfully',
			alreadyVerified: result.alreadyVerified,
		})
	} catch (error) {
		console.error('Email verification error:', error)
		return NextResponse.json(
			{ error: 'Failed to verify email. Please try again.' },
			{ status: 500 }
		)
	}
}

