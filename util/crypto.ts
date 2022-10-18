import crypto, { webcrypto } from 'crypto'
import { NextApiRequest } from 'next'

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
 * It takes an object with a bunch of optional properties, and returns a string with those properties
 * in a specific order
 *
 * For some reaason, Vercel has been changing the order of the query string, causing the Asana GET signature
 * verification to fail.
 *
 * @param  query - Asana Query Params
 * @returns A string
 */
const reorderAsanaQuery = (query: AsanaQueryOrder) => {
	const {
		attachment,
		asset,
		workspace,
		expires,
		expires_at,
		locale,
		resource_url,
		task,
		user,
	} = query
	return new URLSearchParams({
		attachment,
		asset,
		workspace,
		expires,
		expires_at,
		locale,
		resource_url,
		task,
		user,
	}).toString()
}

/**
 * It takes a secret and a content string, and returns a SHA256 hash of the content string, using the
 * secret as the key
 * @param secret - The secret key used to create the signature.
 * @param content - The content to be signed.
 * @returns SHA256 hash signature
 */
export const createSignature = (secret: string, content: string) =>
	crypto.createHmac('sha256', secret).update(content).digest('hex')

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
export const verifySignature = ({ service, req }: VerifySignature) => {
	const signature =
		req.headers[
			service === 'asana'
				? sigHeader.asana || sigHeader.asanaHook
				: sigHeader[service]
		]
	if (typeof signature !== 'string') {
		console.warn('Signature is not a string')
		return false
	}
	let payload: string = ''

	switch (service) {
		case 'asanapr':
		case 'asana':
			payload =
				req.method === 'POST'
					? JSON.stringify(req.body.data)
					: reorderAsanaQuery(req.query as AsanaQueryOrder)
			break
	}
	const computedSignature = createSignature(token[service], payload)

	if (matchSignature(signature, computedSignature)) {
		console.log(`${service} request signature verified`)
		return true
	}
	console.warn(`${service} request signature verification failed!`)
	return false
}

type VerifySignature = {
	service: keyof typeof token
	req: NextApiRequest
}

type AsanaQueryOrder = {
	attachment: string
	asset: string
	workspace: string
	expires: string
	expires_at: string
	locale: string
	resource_url: string
	task: string
	user: string
}
