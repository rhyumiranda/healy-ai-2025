import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/services/email.service'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const email = searchParams.get('email') || 'test@example.com'

	try {
		console.log('🧪 Testing email service...')
		console.log('Environment check:')
		console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
		console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || 'Using default: onboarding@resend.dev')
		console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing')

		await EmailService.sendVerificationEmail({
			email,
			name: 'Test User',
			token: 'test-token-123',
		})

		return NextResponse.json({
			success: true,
			message: `Test email sent to ${email}`,
			config: {
				hasApiKey: !!process.env.RESEND_API_KEY,
				fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
				nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
			},
		})
	} catch (error) {
		console.error('❌ Test email failed:', error)
		return NextResponse.json(
			{
				error: 'Failed to send test email',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}
