// import crypto from 'crypto'
// import invariant from 'tiny-invariant'
import { NextApiRequest, NextApiResponse } from 'next'

const token = {
	asana: process.env.ASANA_CLIENT_SECRET,
	github: process.env.GITHUB_CLIENT_SECRET,
	slack: process.env.SLACK_CLIENT_SECRET,
	slackjr: process.env.SLACKJR_CLIENT_SECRET,
	zoom: process.env.ZOOM_CLIENT_SECRET,
	asanapr: process.env.PRASANA_CLIENT_SECRET,
}
const sigHeader = {
	asana: 'x-asana-request-signature',
	asanaHook: 'x-hook-signature',
	github: '',
	slack: '',
	slackjr: '',
	zoom: 'x-zm-signature',
	asanapr: 'x-asana-request-signature',
}

/**
 * It takes a secret string and returns a key that can be used to sign and verify data
 * @param {string} secret - The secret key used to sign the token.
 */
const createKey = async (secret: string) =>
	await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	)

export const verifySignature = async ({ service, req }: VerifySignature) => {
	const key = await createKey(token[service])

	const signatureVal =
		req.headers[
			service === 'asana'
				? sigHeader.asana || sigHeader.asanaHook
				: sigHeader[service]
		]
	if (typeof signatureVal !== 'string') {
		console.log('Signature is not a string')
		return false
	}

	const signature = Uint8Array.from(atob(signatureVal), (c) => c.charCodeAt(0))
	let payload: string = ''
	switch (service) {
		case 'asanapr':
		case 'asana':
			payload =
				req.method === 'POST'
					? req.body.data
					: new URLSearchParams(req.query as Record<string, any>).toString()
			break
	}

	const isValid = await crypto.subtle.verify(
		{ name: 'HMAC' },
		key,
		signature,
		Uint8Array.from(payload, (c) => c.charCodeAt(0))
	)

	if (isValid) {
		console.info(`${service} request signature verification passed.`)
		return true
	}
	console.warn(`${service} request signature verification failed!`)
	return false
}

// /**
//  * It takes a secret and a content string, and returns a SHA256 hash of the content string, using the
//  * secret as the key
//  * @param secret - The secret key used to create the signature.
//  * @param content - The content to be signed.
//  * @returns SHA256 hash signature
//  */
// export const createSignature = (secret: string, content: string) =>
// 	crypto.createHmac('SHA256', secret).update(content).digest('hex')

// /**
//  * It compares two signatures and returns true if they match
//  * @param sig1 - The signature you received from the request header
//  * @param sig2 - The signature that was sent to us by the client.
//  * @returns boolean
//  */
// export const matchSignature = (sig1: string, sig2: string) =>
// 	crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig2))

// /**
//  * It takes a service name, a request object, and a response object, and returns true if the request
//  * signature is valid, or sends a 401 response if it's not
//  * @param VerifySignature
//  * @returns `true` | `401 unauthorized` response
//  */
// export const verifySignature = ({ service, req, res }: VerifySignature) => {
// 	const signature =
// 		req.headers[
// 			service === 'asana'
// 				? sigHeader.asana || sigHeader.asanaHook
// 				: sigHeader[service]
// 		]
// 	invariant(typeof signature === 'string', 'Invalid Signature')
// 	let payload: string = ''

// 	switch (service) {
// 		case 'asanapr':
// 		case 'asana':
// 			payload =
// 				req.method === 'POST'
// 					? req.body.data
// 					: new URLSearchParams(req.query as Record<string, any>).toString()
// 			break
// 	}
// 	const computedSignature = createSignature(token[service], payload)

// 	if (matchSignature(signature, computedSignature)) {
// 		console.log(`${service} request signature verified`)
// 		return true
// 	}
// 	console.warn(`${service} request signature verification failed!`)
// 	// return res.status(401).json({ message: 'Signature verification failed.' })
// 	return false
// }

type VerifySignature = {
	service: keyof typeof token
	req: NextApiRequest
}
