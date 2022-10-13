import { prisma } from 'util/prisma'
import { asanaBlockRegex } from 'util/regex'
import { githubClient } from '../github'
import type { WebhookEvent } from './webhookHandler'

/**
 * It takes a webhook event, finds the issue that was detached, detaches it from GitHub, and then
 * deletes the issue from the database
 * @param event - WebhookEvent
 * @returns A boolean
 */
export const detachIssue = async (event: WebhookEvent) => {
	const issue = await prisma.linkedIssues.findFirstOrThrow({
		where: {
			attachmentId: event.resource.gid,
		},
		select: {
			id: true,
			githubIssue: true,
			githubOwner: true,
			githubRepo: true,
		},
	})

	const detach = await detachIssueFromGH(issue)

	if (detach)
		await prisma.linkedIssues.delete({
			where: {
				id: issue.id,
			},
		})

	return detach
}

/**
 * It takes a GitHub issue number, owner, and repo, and removes the Asana link from the issue
 * @param params - GitHubIssue
 * @returns A boolean.
 */
const detachIssueFromGH = async (params: GitHubIssue) => {
	try {
		const { githubIssue, githubOwner, githubRepo } = params

		/* Getting the issue from GitHub. */
		const issueCurrent = await githubClient.rest.issues.get({
			issue_number: parseInt(githubIssue),
			owner: githubOwner,
			repo: githubRepo,
		})

		/* Updating the issue on GitHub. */
		const issueUpdated = await githubClient.rest.issues.update({
			issue_number: parseInt(githubIssue),
			owner: githubOwner,
			repo: githubRepo,
			body: issueCurrent.data.body!.replace(asanaBlockRegex, ''),
		})
		if (issueUpdated.status === 200) {
			return true
		}
		return false
	} catch (err) {
		return false
	}
}

interface GitHubIssue {
	id: string
	githubIssue: string
	githubOwner: string
	githubRepo: string
}
