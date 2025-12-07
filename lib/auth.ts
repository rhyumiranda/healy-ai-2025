import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-utils'
import { AuditService } from '@/lib/services/audit.service'

export const authOptions: NextAuthOptions = {
	// @ts-expect-error - Type incompatibility between @auth/prisma-adapter v2.x and next-auth v4.x
	// The adapter is structurally compatible at runtime, but TypeScript types differ slightly
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
	},
	pages: {
		signIn: '/auth/login',
		signOut: '/auth/login',
		error: '/auth/login',
	},
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Invalid credentials')
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
					include: { doctorProfile: true },
				})

				if (!user || !user.password) {
					await AuditService.logLogin({
						userId: 'unknown',
						email: credentials.email,
						success: false,
						errorMessage: 'User not found',
					}).catch(console.error)
					throw new Error('Invalid credentials')
				}

				if (!user.emailVerified) {
					await AuditService.logLogin({
						userId: user.id,
						email: credentials.email,
						success: false,
						errorMessage: 'Email not verified',
					}).catch(console.error)
					throw new Error('Please verify your email before logging in')
				}

				const isCorrectPassword = await verifyPassword(
					credentials.password,
					user.password
				)

				if (!isCorrectPassword) {
					await AuditService.logLogin({
						userId: user.id,
						email: credentials.email,
						success: false,
						errorMessage: 'Invalid password',
					}).catch(console.error)
					throw new Error('Invalid credentials')
				}

				if (user.doctorProfile && !user.doctorProfile.isVerified) {
					await AuditService.logLogin({
						userId: user.id,
						email: credentials.email,
						success: false,
						errorMessage: 'Doctor account pending verification',
					}).catch(console.error)
					throw new Error('Your doctor account is pending verification')
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					emailVerified: user.emailVerified,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id
				token.email = user.email
				token.emailVerified = user.emailVerified
			}

			if (trigger === 'update' && session) {
				token = { ...token, ...session }
			}

			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.email = token.email as string
				session.user.emailVerified = token.emailVerified as Date | null
			}
			return session
		},
	},
	events: {
		async signIn({ user }) {
			await AuditService.logLogin({
				userId: user.id as string,
				email: user.email as string,
				success: true,
			}).catch(console.error)
		},
		async signOut({ token }) {
			if (token?.id) {
				await AuditService.logLogout({
					userId: token.id as string,
					email: token.email as string,
				}).catch(console.error)
			}
		},
	},
}
