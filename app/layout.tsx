import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from '@/app/providers/session-provider'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'MedAssist AI - Treatment Plan Assistant',
	description: 'AI-powered treatment plan assistant for healthcare professionals',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SessionProvider>
					{children}
				</SessionProvider>
			</body>
		</html>
	)
}
