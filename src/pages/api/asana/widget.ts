import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { asanaClient } from 'src/bots/asana'
import { createWidget } from 'src/bots/asana/createWidget'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	console.log('widget')
	console.log(req.query)
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
