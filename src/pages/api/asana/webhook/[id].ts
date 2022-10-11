import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'util/prisma'
import NextCors from 'nextjs-cors'
import { handleDetach, WebhookEvent } from 'src/bots/asana/detachIssue'
import { createSignature, matchSignature } from 'util/crypto'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	const { id } = req.query
	console.log(`Incoming project webhook: ${id}`)

	if (typeof id !== 'string') return res.status(400).end()

	/* This is the first time the webhook is being set up. */
	if (req.headers['x-hook-secret']) {
		console.log('This is a new webhook')
		const secret = req.headers['x-hook-secret'] as string

		const webhookSecret = await prisma.asanaWebhook.upsert({
			where: {
				webhookId: id,
			},
			update: {
				token: secret,
			},
			create: {
				webhookId: id,
				token: secret,
			},
		})

		if (webhookSecret.token !== secret) return res.status(500).end()
		res.setHeader('X-Hook-Secret', secret)
		res.status(200).end()
	} else if (req.headers['x-hook-signature']) {
		/* This is the part of the code that handles the webhooks. */
		console.log('Check signature')
		const { token: secret } = await prisma.asanaWebhook.findUniqueOrThrow({
			where: {
				webhookId: id,
			},
			select: { token: true },
		})
		if (typeof secret !== 'string')
			return res.status(404).json({ message: 'Id not found' })
		const computedSignature = createSignature(secret, JSON.stringify(req.body))

		const sigMatch = matchSignature(
			req.headers['x-hook-signature'] as string,
			computedSignature
		)

		console.log(`Signature Match: ${sigMatch}`)
		if (!sigMatch) {
			// Fail
			console.warn('Webhook Signature Mismatch', req.body)
			res.status(401).end()
		} else {
			// Success
			const events: Array<WebhookEvent> = req.body.events
			console.log(`Events on ${Date()}:`)
			console.log(events)
			if (events.length >= 1) handleDetach(events)
			res.status(200).end()
		}
	} else {
		console.error('Something went wrong!')
	}
}
export default handler
