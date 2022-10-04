import { prisma } from 'util/prisma'
import { probot } from 'src/pages/api/github'

export const getIssuesFromGH = async (owner: string, repo: string) => {
	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))
	const { data } = await gh.issues.listForRepo({
		owner,
		repo,
	})
	const attachedTicket = /<!--Asana:\d*-->/g
	const filteredIssues = data.filter((x) => {
		const body = x.body ?? ''
		return x.pull_request === undefined && !body.match(attachedTicket)
	})

	const returnIssues = filteredIssues.map((issue) => {
		return {
			owner: owner,
			repo: repo,
			number: issue.number,
			title: issue.title,
			body: issue.body,
		}
	})
	return returnIssues
}
export const getIssueList = async () => {
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
			[`${result.org.githubOwner}/${result.repo}`]: await getIssuesFromGH(
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
	return issues
}
