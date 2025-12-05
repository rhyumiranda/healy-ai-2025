import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
	interface User {
		id: string
		email: string
		name: string | null
		emailVerified: Date | null
	}

	interface Session {
		user: {
			id: string
			email: string
			name: string | null
			emailVerified: Date | null
		}
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		email: string
		emailVerified: Date | null
	}
}
