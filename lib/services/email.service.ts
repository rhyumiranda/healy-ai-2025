import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
	? new Resend(process.env.RESEND_API_KEY) 
	: null
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

interface SendVerificationEmailParams {
	email: string
	name: string
	token: string
}

export class EmailService {
	static async sendVerificationEmail({
		email,
		name,
		token,
	}: SendVerificationEmailParams): Promise<void> {
		if (!resend) {
			console.error('❌ Resend client not initialized. Check RESEND_API_KEY environment variable.')
			throw new Error('Email service not configured')
		}

		const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

		console.log('📧 Attempting to send verification email to:', email)
		console.log('🔗 Verification URL:', verificationUrl)
		console.log('📤 From email:', FROM_EMAIL)

		try {
			const result = await resend.emails.send({
				from: FROM_EMAIL,
				to: email,
				subject: 'Verify your HealyAI account',
				html: `
					<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>Verify Your Email</title>
						</head>
						<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
							<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
								<h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HealyAI</h1>
							</div>
							
							<div style="background: #ffffff; padding: 40px; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 10px 10px;">
								<p style="font-size: 18px; margin-bottom: 20px;">Hello Dr. ${name},</p>
								
								<p style="font-size: 16px; margin-bottom: 25px;">Thank you for registering with HealyAI. Please verify your email address to complete your account setup and start using our AI-powered treatment planning assistant.</p>
								
								<div style="text-align: center; margin: 35px 0;">
									<a href="${verificationUrl}" 
										 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
														color: white; 
														padding: 14px 40px; 
														text-decoration: none; 
														border-radius: 5px; 
														font-weight: bold; 
														font-size: 16px;
														display: inline-block;
														box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
										Verify Email Address
									</a>
								</div>
								
								<p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e8ed;">
									Or copy and paste this URL into your browser:<br>
									<a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
								</p>
								
								<p style="font-size: 14px; color: #666; margin-top: 20px;">
									This verification link will expire in 24 hours.
								</p>
								
								<p style="font-size: 14px; color: #666; margin-top: 20px;">
									If you didn&apos;t create an account with HealyAI, please ignore this email.
								</p>
							</div>
							
							<div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px;">
								<p>HealyAI - AI-Powered Treatment Planning Assistant</p>
								<p>&copy; ${new Date().getFullYear()} HealyAI. All rights reserved.</p>
							</div>
						</body>
					</html>
				`,
			})
			console.log('✅ Verification email sent successfully:', result)
		} catch (error) {
			console.error('❌ Failed to send verification email:', error)
			if (error instanceof Error) {
				console.error('Error details:', error.message)
			}
			throw new Error('Failed to send verification email')
		}
	}

	static async sendWelcomeEmail(email: string, name: string): Promise<void> {
		if (!resend) {
			console.warn('⚠️ Resend client not initialized. Welcome email not sent.')
			return
		}

		console.log('📧 Sending welcome email to:', email)

		try {
			const result = await resend.emails.send({
				from: FROM_EMAIL,
				to: email,
				subject: 'Welcome to HealyAI!',
				html: `
					<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>Welcome to HealyAI</title>
						</head>
						<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
							<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
								<h1 style="color: white; margin: 0; font-size: 28px;">Welcome, Dr. ${name}! 🎉</h1>
							</div>
							
							<div style="background: #ffffff; padding: 40px; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 10px 10px;">
								<p style="font-size: 16px; margin-bottom: 25px;">Your email has been successfully verified!</p>
								
								<p style="font-size: 16px; margin-bottom: 25px;">You now have full access to HealyAI&apos;s powerful features:</p>
								
								<ul style="font-size: 15px; line-height: 2; margin-bottom: 30px;">
									<li>📋 Create and manage patient profiles</li>
									<li>🤖 AI-powered treatment recommendations</li>
									<li>⚕️ Risk assessment and drug interaction checking</li>
									<li>📊 Treatment plan review and editing</li>
									<li>📈 Dashboard analytics and insights</li>
								</ul>
								
								<div style="text-align: center; margin: 35px 0;">
									<a href="${process.env.NEXTAUTH_URL}/auth/login" 
										 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
														color: white; 
														padding: 14px 40px; 
														text-decoration: none; 
														border-radius: 5px; 
														font-weight: bold; 
														font-size: 16px;
														display: inline-block;
														box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
										Get Started
									</a>
								</div>
								
								<p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e8ed;">
									Need help getting started? Check out our documentation or contact our support team.
								</p>
							</div>
							
							<div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px;">
								<p>HealyAI - AI-Powered Treatment Planning Assistant</p>
								<p>&copy; ${new Date().getFullYear()} HealyAI. All rights reserved.</p>
							</div>
						</body>
					</html>
				`,
			})
			console.log('✅ Welcome email sent successfully:', result)
		} catch (error) {
			console.error('❌ Failed to send welcome email:', error)
			if (error instanceof Error) {
				console.error('Error details:', error.message)
			}
		}
	}
}
