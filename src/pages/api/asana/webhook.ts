import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
	let secret = ''
	console.log('webhook req', req)
	if (req.headers['x-hook-secret']) {
		console.log('This is a new webhook')
		secret = req.headers['x-hook-secret'] as string

		res.setHeader('X-Hook-Secret', secret)
		res.status(200).end()
	} else if (req.headers['x-hook-signature']) {
		const computedSignature = crypto
			.createHmac('SHA256', secret)
			.update(JSON.stringify(req.body))
			.digest('hex')

		if (
			!crypto.timingSafeEqual(
				Buffer.from(req.headers['x-hook-signature'] as string),
				Buffer.from(computedSignature)
			)
		) {
			// Fail
			res.status(401).end()
		} else {
			// Success
			console.log(`Events on ${Date()}:`)
			console.log(req.body.events)
			res.status(200).end()
		}
	} else {
		console.error('Something went wrong!')
	}
}
export default handler
