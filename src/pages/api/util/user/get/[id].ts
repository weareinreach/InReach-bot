import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { getUser } from 'src/bots/slackUtil/redis'

type Data = {
	user: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	try {
		const userId = req.query.id
		if (typeof userId !== 'string') throw 400

		const user = await getUser(userId)

		if (!user) throw 404

		res.status(200).json({ user })
	} catch (err) {
		console.error(`/api/util/user/get/[id]: ${err}`)
		if (typeof err === 'number') res.status(err).end()
	}
}

export default handler
