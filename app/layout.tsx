import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from '@/app/providers/session-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { Toaster } from 'sonner'
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
	title: 'HealyAI - Treatment Plan Assistant',
	description: 'AI-powered treatment plan assistant for healthcare professionals',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange
				>
					<SessionProvider>
						{children}
					</SessionProvider>
					<Toaster position='top-right' richColors />
				</ThemeProvider>
			</body>
		</html>
	)
}
