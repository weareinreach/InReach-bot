import type { NextApiRequest, NextApiResponse } from 'next'
import { githubClient } from 'src/bots/github'

const attachment_response = {
	resource_name: "I'm an Attachment",
	resource_url: 'https://localhost:8000',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	console.log('attach')
	// console.log(req)
	// console.log('body', req.body)
	// console.log('headers', req.headers)
	console.log(req.query)
	res.status(200).json(attachment_response)
}

export default handler
