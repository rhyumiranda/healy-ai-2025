import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? {
			exclude: ['error', 'warn'],
		} : false,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	images: {
		formats: ['image/avif', 'image/webp'],
		remotePatterns: [],
	},
	poweredByHeader: false,
	compress: true,
	reactStrictMode: true,
	productionBrowserSourceMaps: false,
}

export default nextConfig
