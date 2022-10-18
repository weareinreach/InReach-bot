import type { NextApiRequest, NextApiResponse } from 'next'
import { probot } from 'src/bots/github'
import NextCors from 'nextjs-cors'
import { verifySignature } from 'util/crypto'
import { bodyTagsRegex } from 'util/regex'
import invariant from 'tiny-invariant'
import { bodyBlock } from 'src/bots/asana/attachIssue'
import { allowedMethods } from 'util/allowedMethods'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	if (!allowedMethods(['POST'], req)) {
		res.status(405).end()
		return
	}
	if (!verifySignature({ service: 'asana', req }))
		return res.status(401).json({ message: 'Signature verification failed.' })

	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))

	const data: IssueSubmission = JSON.parse(req.body.data)

	const [org, repo]: string[] = data.values.repo.split('/')
	invariant(org && repo, 'Invalid Org/Repo')

	const labels = [data.values.labelsPriority, data.values.labelsType].filter(
		(x) => x !== ''
	)

	const body = data.values.body.replace(bodyTagsRegex, '')

	const newIssue = await gh.issues.create({
		owner: org,
		repo: repo,
		title: data.values.title,
		body: bodyBlock(body, data.task),
		labels: labels,
	})

	const attachedIssue = await prisma?.linkedIssues.upsert({
		where: {
			asanaTicket: data.task.toString(),
		},
		update: {
			githubOwner: org,
			githubRepo: repo,
			githubIssue: newIssue.data.number.toString(),
			issueUrl: newIssue.data.html_url,
			attachmentId: data.attachment.toString(),
		},
		create: {
			asanaTicket: data.task.toString(),
			githubOwner: org,
			githubRepo: repo,
			githubIssue: newIssue.data.number.toString(),
			issueUrl: newIssue.data.html_url,
			attachmentId: data.attachment.toString(),
		},
	})
	invariant(attachedIssue, 'Issue attach error')

	res.status(200).json({
		resource_name: newIssue.data.title,
		resource_url: attachedIssue.issueUrl,
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
