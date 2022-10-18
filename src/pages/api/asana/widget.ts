import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { createWidget } from 'src/bots/asana/createWidget'
import { allowedMethods } from 'util/allowedMethods'
import { verifySignature } from 'util/crypto'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	// console.log('before nextcors')
	console.info(JSON.stringify(req.query, null, 2))
	console.dir(req)
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})

	if (!allowedMethods(['GET'], req)) {
		res.status(405).end()
		return
	}
	console.log('issue widget request')
	if (!verifySignature({ service: 'asana', req })) {
		res.status(401).json({ message: 'Signature verification failed.' })
		return
	}
	if (!req.query.task) {
		res.status(400).end()
		return
	}
	const { task, attachment } = req.query

	const widget = await createWidget(task as string, attachment as string)

	res.status(200).json(widget)
}

export default handler

interface UrlParms {
	task: string
	attachment: string
}
