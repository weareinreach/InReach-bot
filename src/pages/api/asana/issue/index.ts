import type { NextApiRequest, NextApiResponse } from 'next'
import { probot } from '../../github'
import NextCors from 'nextjs-cors'
import { firstModal } from 'src/bots/asana/modal'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	console.log('widget')

	// console.log(await gh.issues.listForRepo({ owner: org, repo: 'inreach-api' }))
	res.json(firstModal)
}

export default handler
