import type { NextApiRequest, NextApiResponse } from 'next'
import { createInvite } from 'src/bots/zoom'

type Data = {
	link: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	try {
		const id = req.query.id as string
		if (!id) throw 400
		const link = await createInvite(id, process.env.ZOOM_COWORKING_MEETING_ID)
		if (link) return res.status(200).json({ link })
	} catch (err) {
		console.error(`/api/zoom/[id]`, err)
		if (typeof err === 'number') return res.status(err).end()
		return res.status(500).end()
	}
}

export default handler
