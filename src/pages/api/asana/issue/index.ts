import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { firstModal } from 'src/bots/asana/modal'
import { allowedMethods } from 'util/allowedMethods'
import { verifySignature } from 'util/crypto'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	if (!allowedMethods(['POST'], req)) {
		res.status(405).end()
		return
	}
	if (!verifySignature({ service: 'asana', req }))
		return res.status(401).json({ message: 'Signature verification failed.' })

	res.json(firstModal)
}

export default handler
