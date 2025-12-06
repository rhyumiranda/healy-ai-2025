import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token
		const path = req.nextUrl.pathname

		if (!token?.emailVerified && !path.startsWith('/auth/verification-pending')) {
			return NextResponse.redirect(new URL('/auth/verification-pending', req.url))
		}

		return NextResponse.next()
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
		pages: {
			signIn: '/auth/login',
		},
	}
)

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/patients/:path*',
		'/treatment-plans/:path*',
		'/api/patients/:path*',
		'/api/plans/:path*',
		'/api/ai/:path*',
	],
}

