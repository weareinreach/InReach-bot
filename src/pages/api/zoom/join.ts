import type { NextApiRequest, NextApiResponse } from 'next'
import { createInvite } from 'src/bots/zoom'
import { redis } from 'util/redis'

const inviteLink = async (user: string, res: NextApiResponse) => {
	const link = await createInvite(user, process.env.ZOOM_COWORKING_MEETING_ID)
	if (link) return res.redirect(307, link).end()
	return res.status(500).end()
}
async function delay(delayInms: number) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(2)
		}, delayInms)
	})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	console.log(req.query)
	// const protocol =
	// 	process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
	const url = [`${process.env.VERCEL_URL}${req.url!.split('?')[0]}`]
	const attempt = req.query.attempt ?? 1
	let user: string | null = (req.query.user as string) ?? null
	const uuid = req.query.uuid
	console.log(`Attempt ${attempt}`)

	// no uuid? bad request!
	if (typeof req.query.uuid !== 'string')
		return res.status(400).json({ message: 'missing uuid' })

	user = await redis.get(uuid as string)

	if (typeof user === 'string') {
		console.log(`user is a string! get invite for: ${user}`)
		return await inviteLink(user, res)
	}

	if (+attempt == 5) {
		console.log('no more attempts')
		return res
			.status(404)
			.json({ message: 'No results found after 5 attempts' })
	}
	url.push(`?uuid=${uuid}`)
	url.push(`&attempt=${+attempt + 1}`)
	console.log('delay 2 seconds')
	await delay(500)
	console.log(`Redirecting to: ${url.join('')}`)
	return res.redirect(url.join(''))
}

export default handler
