import crypto from 'crypto'
import invariant from 'tiny-invariant'
import { NextApiRequest, NextApiResponse } from 'next'

const token = {
	asana: process.env.ASANA_CLIENT_SECRET,
	github: process.env.GITHUB_CLIENT_SECRET,
	slack: process.env.SLACK_CLIENT_SECRET,
	slackjr: process.env.SLACKJR_CLIENT_SECRET,
	zoom: process.env.ZOOM_CLIENT_SECRET,
}
const sigHeader = {
	asana: 'x-asana-request-signature',
	asanaHook: 'x-hook-signature',
	github: '',
	slack: '',
	slackjr: '',
	zoom: 'x-zm-signature',
}

/**
 * It takes a secret and a content string, and returns a SHA256 hash of the content string, using the
 * secret as the key
 * @param secret - The secret key used to create the signature.
 * @param content - The content to be signed.
 * @returns SHA256 hash signature
 */
export const createSignature = (secret: string, content: string) =>
	crypto.createHmac('SHA256', secret).update(content).digest('hex')

/**
 * It compares two signatures and returns true if they match
 * @param sig1 - The signature you received from the request header
 * @param sig2 - The signature that was sent to us by the client.
 * @returns boolean
 */
export const matchSignature = (sig1: string, sig2: string) =>
	crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig2))

/**
 * It takes a service name, a request object, and a response object, and returns true if the request
 * signature is valid, or sends a 401 response if it's not
 * @param VerifySignature
 * @returns `true` | `401 unauthorized` response
 */
export const verifySignature = ({ service, req, res }: VerifySignature) => {
	const signature =
		req.headers[
			service === 'asana'
				? sigHeader.asana || sigHeader.asanaHook
				: sigHeader[service]
		]
	invariant(typeof signature === 'string', 'Invalid Signature')
	let payload: string = ''

	switch (service) {
		case 'asana':
			payload =
				req.method === 'POST'
					? req.body.data
					: new URLSearchParams(req.query as Record<string, any>).toString()
			break
	}
	const computedSignature = createSignature(token[service], payload)

	if (matchSignature(signature, computedSignature)) {
		console.log(`${service} request signature verified`)
		return true
	}
	console.warn(`${service} request signature verification failed!`)
	return res.status(401).json({ message: 'Signature verification failed.' })
}

type VerifySignature = {
	service: keyof typeof token
	req: NextApiRequest
	res: NextApiResponse
}
