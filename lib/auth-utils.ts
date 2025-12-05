import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword)
}

export function generateVerificationToken(): string {
	return randomBytes(32).toString('hex')
}

export function getVerificationTokenExpiry(): Date {
	const now = new Date()
	now.setHours(now.getHours() + 24)
	return now
}
