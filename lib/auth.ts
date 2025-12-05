import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-utils'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma) as any,
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
					throw new Error('Invalid credentials')
				}

				if (!user.emailVerified) {
					throw new Error('Please verify your email before logging in')
				}

				const isCorrectPassword = await verifyPassword(
					credentials.password,
					user.password
				)

				if (!isCorrectPassword) {
					throw new Error('Invalid credentials')
				}

				if (user.doctorProfile && !user.doctorProfile.isVerified) {
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
			console.log('User signed in:', user.email)
		},
		async signOut({ token }) {
			console.log('User signed out:', token.email)
		},
	},
}
