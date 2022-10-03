import type { NextApiRequest, NextApiResponse } from 'next'
import { githubClient } from 'src/bots/github'
const typeahead_response = {
	items: [
		{
			title: "I'm a title",
			subtitle: "I'm a subtitle",
			value: 'some_value',
			icon_url: 'https://placekitten.com/16/16',
		},
		{
			title: "I'm a title",
			subtitle: "I'm a subtitle",
			value: 'some_value',
			icon_url: 'https://placekitten.com/16/16',
		},
	],
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	console.log('lookup', req.query)
	res.status(200).json(typeahead_response)
}

export default handler
