import type { NextApiRequest, NextApiResponse } from 'next'
import { probot } from '../../github'
import NextCors from 'nextjs-cors'
import { prisma } from 'util/prisma'

const org = 'weareinreach'
const issueRepos = ['test-repo', 'inreach-api']

const modal = async () => {
	const repos = await prisma.activeRepo.findMany({
		select: {
			repo: true,
			org: {
				select: { githubOwner: true },
			},
		},
	})

	const issues = await Promise.all(
		repos.map(async (result) => ({
			[`${result.org.githubOwner}/${result.repo}`]: await getIssues(
				result.org.githubOwner,
				result.repo
			),
		}))
	).then((x) =>
		x.reduce(
			(prev, curr) => ({
				...prev,
				...curr,
			}),
			{}
		)
	)
	const dropOptions = Object.keys(issues).map((item) => ({
		id: item,
		label: item,
	}))
	console.log(dropOptions)

	return {
		template: 'form_metadata_v0',
		metadata: {
			title: 'Associate GitHub Issue',
			submit_button_text: 'Submit',
			on_submit_callback:
				'https://3000.tunnel.joekarow.dev/api/asana/issue/submit',
			on_change_callback: `https://3000.tunnel.joekarow.dev/api/asana/issue/onchange?data=${JSON.stringify(
				issues
			)}`,
			fields: [
				{
					type: 'dropdown',
					id: 'repo',
					name: 'GitHub Repo',
					is_required: true,
					is_watched: true,
					options: dropOptions,
					width: 'half',
				},
				{
					type: 'dropdown',
					id: 'issue',
					name: 'GitHub Repo',
					is_required: true,
					options: [{ id: 'none', label: 'none' }],
					width: 'full',
				},
			],
		},
	}
}

const getIssues = async (owner: string, repo: string) => {
	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))
	const { data } = await gh.issues.listForRepo({
		owner,
		repo,
	})

	const filteredIssues = data
		.filter((x) => x.pull_request === undefined)
		.map((issue) => {
			return {
				owner: owner,
				repo: repo,
				number: issue.number,
				title: issue.title,
				body: issue.body,
			}
		})
	return filteredIssues
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await NextCors(req, res, {
		origin: 'https://app.asana.com',
	})
	console.log('widget')

	// console.log(await gh.issues.listForRepo({ owner: org, repo: 'inreach-api' }))
	res.json(await modal())
}

export default handler
