'use client'

import { useState } from 'react'
import { Copy, Check, Loader2, ShieldCheck } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { TwoFactorSetupResponse } from '@/src/modules/settings'

interface TwoFactorDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	setupData: TwoFactorSetupResponse | null
	onVerify: (code: string) => Promise<boolean>
	onCancel: () => void
	isLoading: boolean
}

export function TwoFactorDialog({
	open,
	onOpenChange,
	setupData,
	onVerify,
	onCancel,
	isLoading,
}: TwoFactorDialogProps) {
	const [verificationCode, setVerificationCode] = useState('')
	const [step, setStep] = useState<'setup' | 'backup'>('setup')
	const [copiedSecret, setCopiedSecret] = useState(false)
	const [copiedCodes, setCopiedCodes] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleVerify = async () => {
		setError(null)
		try {
			const success = await onVerify(verificationCode)
			if (success) {
				setStep('backup')
			} else {
				setError('Invalid verification code')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Verification failed')
		}
	}

	const handleClose = () => {
		setVerificationCode('')
		setStep('setup')
		setCopiedSecret(false)
		setCopiedCodes(false)
		setError(null)
		onCancel()
		onOpenChange(false)
	}

	const copyToClipboard = async (text: string, type: 'secret' | 'codes') => {
		await navigator.clipboard.writeText(text)
		if (type === 'secret') {
			setCopiedSecret(true)
			setTimeout(() => setCopiedSecret(false), 2000)
		} else {
			setCopiedCodes(true)
			setTimeout(() => setCopiedCodes(false), 2000)
		}
	}

	const handleDone = () => {
		handleClose()
	}

	if (!setupData) return null

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='max-w-md'>
				{step === 'setup' ? (
					<>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-2'>
								<ShieldCheck className='h-5 w-5 text-primary' />
								Set Up Two-Factor Authentication
							</DialogTitle>
							<DialogDescription>
								Scan the QR code with your authenticator app or enter the secret key manually.
							</DialogDescription>
						</DialogHeader>
						<div className='space-y-4'>
							<div className='flex justify-center p-4 bg-white rounded-lg'>
								<img
									src={setupData.qrCode}
									alt='2FA QR Code'
									className='w-48 h-48'
								/>
							</div>
							<div className='space-y-2'>
								<Label className='text-sm text-muted-foreground'>Or enter this secret key manually:</Label>
								<div className='flex items-center gap-2'>
									<code className='flex-1 p-2 bg-muted rounded text-sm font-mono break-all'>
										{setupData.secret}
									</code>
									<Button
										variant='outline'
										size='sm'
										onClick={() => copyToClipboard(setupData.secret, 'secret')}
									>
										{copiedSecret ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
									</Button>
								</div>
							</div>
							<Separator />
							{error && (
								<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-3'>
									<p className='text-sm text-destructive'>{error}</p>
								</div>
							)}
							<div className='space-y-2'>
								<Label htmlFor='verificationCode'>Enter verification code</Label>
								<Input
									id='verificationCode'
									value={verificationCode}
									onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
									placeholder='000000'
									className='text-center text-lg font-mono tracking-widest'
									maxLength={6}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant='outline' onClick={handleClose} disabled={isLoading}>
								Cancel
							</Button>
							<Button
								onClick={handleVerify}
								disabled={isLoading || verificationCode.length !== 6}
							>
								{isLoading ? (
									<>
										<Loader2 className='h-4 w-4 mr-2 animate-spin' />
										Verifying...
									</>
								) : (
									'Verify & Enable'
								)}
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-2'>
								<Check className='h-5 w-5 text-green-500' />
								Two-Factor Authentication Enabled
							</DialogTitle>
							<DialogDescription>
								Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
							</DialogDescription>
						</DialogHeader>
						<div className='space-y-4'>
							<div className='p-4 bg-muted rounded-lg'>
								<div className='grid grid-cols-2 gap-2'>
									{setupData.backupCodes.map((code, index) => (
										<code key={index} className='text-sm font-mono text-center py-1'>
											{code}
										</code>
									))}
								</div>
							</div>
							<Button
								variant='outline'
								className='w-full'
								onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'codes')}
							>
								{copiedCodes ? (
									<>
										<Check className='h-4 w-4 mr-2' />
										Copied!
									</>
								) : (
									<>
										<Copy className='h-4 w-4 mr-2' />
										Copy Backup Codes
									</>
								)}
							</Button>
							<p className='text-xs text-muted-foreground text-center'>
								Each backup code can only be used once.
							</p>
						</div>
						<DialogFooter>
							<Button onClick={handleDone} className='w-full'>
								Done
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
