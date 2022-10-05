import type { NextApiRequest, NextApiResponse } from 'next'
import { slackUpdateMessage } from 'src/bots/coworking/message'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const token = req.headers.token

	if (token === process.env.WEBHOOK_SECRET) {
		const result = await slackUpdateMessage()
		return res.status(200).json({ result })
	}
	return res.status(401).end()
}
export default handler
