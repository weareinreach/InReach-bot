import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!req.query.data) return res.status(400).end()
	const issues = JSON.parse(req.query.data as string)

	console.log(req)
	// console.log(issues)
	return res.status(200).json({})
}

export default handler
