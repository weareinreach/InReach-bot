import type { NextApiRequest, NextApiResponse } from 'next'
import { createInvite } from 'src/bots/zoom'

type Data = {
	link: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { name } = req.body.data
		console.log(req.body)
		const link = await createInvite(name, process.env.ZOOM_COWORKING_MEETING_ID)
		if (link) return res.status(200).json({ link })
	} catch (err) {
		console.error(`/api/zoom/link`, err)
		if (typeof err === 'number') return res.status(err).end()
		return res.status(500).end()
	}
}

export default handler
