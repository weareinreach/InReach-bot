import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
	const hookToken = process.env.WEBHOOK_SECRET as string
	const tokenSent = req.headers.authorization
	if (tokenSent !== hookToken) res.status(401).json({ message: 'Unauthorized' })

	res.status(200).json({ message: 'ok' })
}

export default handler
