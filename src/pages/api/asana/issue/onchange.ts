import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { attachModal, createIssueModal } from 'src/bots/asana/modal'

const getView = async (data: OnChangeBody) => {
	console.log(data)
	if (data.changed_field === 'create') {
		if (data.values.create === 'create') {
			return createIssueModal(data.task.toString())
		}
		return await attachModal()
	}

	if (data.changed_field === 'repo') {
		return await attachModal(data.values.repo)
	}
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	console.log(req.body.data)
	const data: OnChangeBody = JSON.parse(req.body.data)

	const view = await getView(data)

	// const view = await modal(data.values.repo)

	return res.status(200).json(view)
}

export default handler

interface OnChangeBody {
	user: number
	changed_field: string
	workspace: number
	expires: number
	expires_at: string
	locale: string
	values: Values
	task: number
}

interface Values {
	repo?: string
	issue?: string
	create?: string
}
