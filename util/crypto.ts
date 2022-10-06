import crypto from 'crypto'

export const createSignature = (secret: string, content: string) =>
	crypto.createHmac('SHA256', secret).update(content).digest('hex')

export const matchSignature = (sig1: string, sig2: string) =>
	crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig2))
