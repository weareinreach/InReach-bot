import type { NextApiRequest, NextApiResponse } from 'next'
import { probot } from '../../github'
import NextCors from 'nextjs-cors'
import { attachIssue } from 'src/bots/asana/attachIssue'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))
	console.log(req.body)
	const data: IssueSubmission = JSON.parse(req.body.data)
	console.log(data)
	const [org, repo] = data.values.repo.split('/')

	const labels = [data.values.labelsPriority, data.values.labelsType].filter(
		(x) => x !== ''
	)

	const body = data.values.body.replace('<BODY>', '').replace('</BODY>', '')

	const newIssue = await gh.issues.create({
		owner: org as string,
		repo: repo as string,
		title: data.values.title,
		body,
		labels: labels,
	})

	console.log(await newIssue)
	const attachedIssue = await attachIssue({
		owner: org as string,
		repo: repo as string,
		issue_number: newIssue.data.number,
		asana_ticket: data.task,
		asana_workspace: data.workspace,
	})
	res.status(200).json({
		resource_name: attachedIssue.title,
		resource_url: attachedIssue.attachedIssue.issueUrl,
	})
}

export default handler

// Generated by https://quicktype.io

export interface IssueSubmission {
	attachment: number
	asset: number
	user: number
	workspace: number
	expires: number
	expires_at: string
	locale: string
	values: Values
	task: number
}

export interface Values {
	create: string
	repo: `${string}/${string}`
	title: string
	body: string
	labelsType: string
	labelsPriority: string
}
