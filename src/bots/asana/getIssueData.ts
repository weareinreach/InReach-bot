import { prisma } from 'util/prisma'
import { probot } from '../github'
import { asanaBlockRegex } from 'util/regex'

const ignoreUsers = ['renovate[bot]']

/**
 * It takes in a GitHub owner and repo name, and returns an array of issues that are not pull requests,
 * and do not have the Asana Ticket block in their body
 * @param owner - The owner of the repo
 * @param repo - The name of the repo you want to get issues from
 * @returns An array of objects with the following properties:
 * - owner
 * - repo
 * - number
 * - title
 * - body
 */
export const getIssuesFromGH = async (owner: string, repo: string) => {
	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))
	const { data } = await gh.issues.listForRepo({
		owner,
		repo,
	})
	const filteredIssues = data.filter((x) => {
		const body = x.body ?? ''
		return (
			x.pull_request === undefined &&
			!body.match(asanaBlockRegex) &&
			!!ignoreUsers.some((ignored) => ignored !== x.user?.login)
		)
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

/**
 * It gets all the active repos from the database, then gets all the issues from GitHub for each repo,
 * and returns an object with the repo name as the key and the issues as the value
 * @returns An object with the key being the repo name and the value being an array of issues
 */
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
