import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { attachModal, createIssueModal } from 'src/bots/asana/modal'
import { verifySignature } from 'util/crypto'

/**
 * It returns a modal view based on the value of the changed field
 * @param {OnChangeBody} data - OnChangeBody
 * @returns A modal view
 */
const getView = async (data: OnChangeBody) => {
	if (data.changed_field === 'create') {
		if (data.values.create === 'create') {
			return createIssueModal(data)
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
	if (!verifySignature({ service: 'asanapr', req, res }))
		return res.status(401).json({ message: 'Signature verification failed.' })

	const data: OnChangeBody = JSON.parse(req.body.data)

	const view = await getView(data)

	// const view = await modal(data.values.repo)

	return res.status(200).json(view)
}

export default handler

export interface OnChangeBody {
	user: string
	changed_field: string
	workspace: string
	expires: number
	expires_at: string
	locale: string
	values: Values
	task: string
}

interface Values {
	repo?: string
	issue?: string
	create?: string
}
