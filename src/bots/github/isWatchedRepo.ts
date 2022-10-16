import { prisma } from 'util/prisma'
import type {
	IssuesEvent,
	LabelEvent,
	PullRequestEvent,
	PullRequestReviewEvent,
	CreateEvent,
} from '@octokit/webhooks-types'
import { Prisma } from '@prisma/client'

/**
 * "If the repo is in the database, return true."
 *
 * The function is called `isWatchedRepo` and it takes a payload as an argument. The payload is the
 * data that is sent to the webhook
 * @param payload - GitHub webhook payload
 * @returns A boolean
 */
type GitHubPayload =
	| IssuesEvent
	| LabelEvent
	| PullRequestEvent
	| PullRequestReviewEvent
	| CreateEvent
export const isWatchedRepo = async (payload: GitHubPayload) => {
	try {
		const result = await prisma.activeRepo.findFirstOrThrow({
			where: {
				repo: payload.repository.name,
				org: {
					githubOwner: payload.repository.owner.login,
				},
			},
		})

		if (result) return true
	} catch (err) {
		if (err instanceof Prisma.NotFoundError) {
			console.log('event for unmonitored repo')
			return false
		}
	}
}
