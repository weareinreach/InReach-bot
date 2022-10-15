import { prisma } from 'util/prisma'
import { githubClient } from '../github'

export const bodyBlock = (
	body: string | null | undefined,
	task: string | number
) =>
	`${
		body ?? ''
	}\n\n<!--Asana:${task}-->\n\n***\n\n#### Asana Ticket\n\n> [Asana-${task}](https://app.asana.com/0/0/${task})\n<!--/Asana-->`

/**
 * It takes in a bunch of props, gets the issue from github, creates a new record in the database,
 * updates the body of the issue with the asana ticket number, and returns the title of the issue and
 * the attached issue
 * @returns The title of the issue and the attached issue.
 */
export const attachIssueToGH = async (props: AttachIssueProps) => {
	const { owner, repo, issue_number, asana_ticket, githubId, attachment } =
		props

	/* Getting the issue from github. */
	const { data: ghIssue } = await githubClient.rest.issues.get({
		owner,
		repo,
		issue_number,
	})

	/* Creating a new record in the database. */
	const attachedIssue = await prisma.linkedIssues.upsert({
		where: {
			asanaTicket: asana_ticket.toString(),
		},
		update: {
			githubOwner: owner,
			githubRepo: repo,
			githubIssue: issue_number.toString(),
			githubId: ghIssue.id.toString(),
			issueUrl: ghIssue.html_url,
			attachmentId: attachment.toString(),
		},
		create: {
			asanaTicket: asana_ticket.toString(),
			githubOwner: owner,
			githubRepo: repo,
			githubIssue: issue_number.toString(),
			githubId: ghIssue.id.toString(),
			issueUrl: ghIssue.html_url,
			attachmentId: attachment.toString(),
		},
	})

	/* Updating the body of the issue with the asana ticket number. */

	const bodyUpdate = bodyBlock(ghIssue.body, asana_ticket)
	await githubClient.rest.issues.update({
		owner,
		repo,
		issue_number,
		body: bodyUpdate,
	})

	return {
		title: ghIssue.title,
		attachedIssue,
	}
}

interface AttachIssueProps {
	/** GitHub Owner/Org */
	owner: string
	/** GitHub repository name */
	repo: string
	/** GitHub Issue number */
	issue_number: number
	/** GitHub Issue ID */
	githubId?: number | string
	/** Asana Ticket number */
	asana_ticket: number | string
	/** Asana Attachment ID */
	attachment: number | string
}
