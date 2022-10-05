import { prisma } from 'util/prisma'
import { githubClient } from '../github'

/**
 * It takes in a bunch of props, and then it creates a new record in the database, and then it updates
 * the body of the issue with the asana ticket number
 * @param {AttachIssueProps} props - AttachIssueProps
 */
export const attachIssue = async (props: AttachIssueProps) => {
	const {
		owner,
		repo,
		issue_number,
		asana_ticket,
		asana_workspace,
		attachment,
		user,
	} = props

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
			issueUrl: ghIssue.html_url,
			attachmentId: attachment.toString(),
		},
		create: {
			asanaTicket: asana_ticket.toString(),
			githubOwner: owner,
			githubRepo: repo,
			githubIssue: issue_number.toString(),
			issueUrl: ghIssue.html_url,
			attachmentId: attachment.toString(),
		},
	})

	/* Updating the body of the issue with the asana ticket number. */

	const bodyUpdate = `${ghIssue.body ?? ''} 
<!--Asana:${asana_ticket}--> 
Asana Task: [${asana_ticket}](https://app.asana.com/0/${asana_workspace}/${asana_ticket}) 
<!--/Asana-->
`
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
	owner: string
	repo: string
	issue_number: number
	asana_ticket: number
	asana_workspace: number
	attachment: number
	user: number
}
