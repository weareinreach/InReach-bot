import type { NextApiRequest, NextApiResponse } from 'next'
import { githubClient } from 'src/bots/github'

const widget = {
	template: 'summary_with_details_v0',
	metadata: {
		title: 'My Widget',
		subtitle: 'Subtitle text',
		fields: [
			{
				name: 'Pill',
				type: 'pill',
				text: 'Some text',
				color: 'green',
			},
			{
				name: 'Text',
				type: 'text_with_icon',
				text: 'Some text',
				icon_url: 'https://www.fillmurray.com/16/16',
			},
			{
				name: 'Text',
				type: 'text_with_icon',
				text: 'Some text',
			},
		],
		footer: {
			footer_type: 'custom_text',
			text: 'Last updated today',
		},
	},
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	console.log('widget')
	// console.log(req)
	console.log('body', req.body)
	console.log('headers', req.headers)
	console.log(req.query)
	res.status(200).json(widget)
}

export default handler
