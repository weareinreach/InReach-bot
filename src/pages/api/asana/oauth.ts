import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { asanaClient } from 'src/bots/asana'
import { setCookie } from 'cookies-next'
import { DateTime } from 'luxon'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	const code: string | undefined = req.query.code as string

	if (code) {
		const token = await asanaClient.app.accessTokenFromCode(code)
		setCookie('asanaToken', token.access_token as string, {
			httpOnly: true,
			expires: DateTime.now().plus({ hours: 1 }).toJSDate(),
			secure: true,
		})
	}
}

export default handler
