import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { createPrWidget } from 'src/bots/asana/createPrWidget'
import { verifySignature } from 'util/crypto'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})

	if (!(await verifySignature({ service: 'asanapr', req })))
		return res.status(401).json({ message: 'Signature verification failed.' })
	if (!req.query.task) return res.status(400).end()
	const { task, attachment } = req.query

	const widget = await createPrWidget(task as string, attachment as string)

	return res.status(200).json(widget)
}

export default handler

interface UrlParms {
	task: string
	attachment: string
}
