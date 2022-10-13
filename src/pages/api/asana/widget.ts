import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { createWidget } from 'src/bots/asana/createWidget'
import { verifySignature } from 'util/crypto'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	verifySignature({ service: 'asana', req, res })
	if (!req.query.task) return res.status(400).end()
	const { task, attachment } = req.query

	const widget = await createWidget(task as string, attachment as string)

	res.status(200).json(widget)
}

export default handler

interface UrlParms {
	task: string
	attachment: string
}
