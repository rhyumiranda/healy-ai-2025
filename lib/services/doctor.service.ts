import { prisma } from '@/lib/prisma'

export class DoctorService {
	static async checkLicenseUniqueness(
		licenseNumber: string
	): Promise<boolean> {
		const existingDoctor = await prisma.doctorProfile.findUnique({
			where: { medicalLicenseNumber: licenseNumber },
		})
		return !existingDoctor
	}

	static async getDoctorProfile(userId: string) {
		const profile = await prisma.doctorProfile.findUnique({
			where: { userId },
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						emailVerified: true,
					},
				},
			},
		})
		return profile
	}

	static async updateDoctorProfile(
		userId: string,
		data: {
			fullName?: string
			specialty?: string
			phoneNumber?: string
		}
	) {
		const profile = await prisma.doctorProfile.update({
			where: { userId },
			data,
		})
		return profile
	}

	static async verifyDoctor(userId: string) {
		const profile = await prisma.doctorProfile.update({
			where: { userId },
			data: { isVerified: true },
		})
		return profile
	}
}
