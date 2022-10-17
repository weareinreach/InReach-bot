import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { firstModal } from 'src/bots/asana/modal'
import { verifySignature } from 'util/crypto'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	if (!(await verifySignature({ service: 'asana', req })))
		return res.status(401).json({ message: 'Signature verification failed.' })

	// console.log(await gh.issues.listForRepo({ owner: org, repo: 'inreach-api' }))
	res.json(firstModal)
}

export default handler
