import type { NextApiRequest, NextApiResponse } from 'next'
import { getSSRInvite } from 'src/bots/zoom'
import { logger } from 'util/logger'

type Data = {
	link: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	try {
		const id = req.query.id as string

		const link = await getSSRInvite(id)
		logger.info('api', id, link)
		if (link) return res.status(200).json({ link })

		return res.status(404).end()
	} catch (err) {
		logger.error(err)
		return res.status(500).end()
	}
}

export default handler
