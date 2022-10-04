import { prisma } from 'util/prisma'
import { probot } from 'src/pages/api/github'
import { asanaClient } from '.'

export const attachIssue = async (props: AttachIssueProps) => {
	const { owner, repo, issue_number, asana_ticket, asana_workspace } = props

	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))

	const { data: ghIssue } = await gh.issues.get({ owner, repo, issue_number })

	const attachedIssue = await prisma.linkedIssues.upsert({
		where: {
			asanaTicket: asana_ticket.toString(),
		},
		update: {
			githubOwner: owner,
			githubRepo: repo,
			githubIssue: issue_number.toString(),
			issueUrl: ghIssue.html_url,
		},
		create: {
			asanaTicket: asana_ticket.toString(),
			githubOwner: owner,
			githubRepo: repo,
			githubIssue: issue_number.toString(),
			issueUrl: ghIssue.html_url,
		},
	})

	const bodyUpdate = `${ghIssue.body ?? ''} 
<!--Asana:${asana_ticket}--> 
Asana Task: [${asana_ticket}](https://app.asana.com/0/${asana_workspace}/${asana_ticket}) 
<!--/Asana-->
`
	await gh.issues.update({
		owner,
		repo,
		issue_number,
		body: bodyUpdate,
	})

	// const webhook = await asanaClient.webhooks.create(asana_ticket, `${process.env.VERCEL_URL}/api/asana/webhook`, {filters:{
	// 	event:
	// }})
	// console.log(webhook)
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
}
