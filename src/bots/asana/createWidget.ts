import { prisma } from 'util/prisma'
import { probot } from 'src/pages/api/github'
import { DateTime } from 'luxon'
import { asanaClient } from '.'
const baseUrl = process.env.VERCEL_URL

const icons = {
	draft: `${baseUrl}/issues/draft.png`,
	open: `${baseUrl}/issues/open.png`,
	closed: `${baseUrl}/issues/closed.png`,
	closedNoAct: `${baseUrl}/issues/closed2.png`,
}

export const createWidget = async (task: string, attachmentId: string) => {
	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))
	const linkedIssue = await prisma.linkedIssues.findFirst({
		where: { asanaTicket: task },
	})
	if (!linkedIssue) throw new Error('not found')
	if (linkedIssue.attachmentId !== attachmentId) {
		// const webhook = await asanaClient.webhooks.create(
		// 	task,
		// 	`${baseUrl}/api/asana/webhook`,
		// 	{
		// 		filters: [
		// 			{
		// 				resource_type: 'attachment',
		// 				action: 'deleted',
		// 			},
		// 			{
		// 				resource_type: 'attachment',
		// 				action: 'removed',
		// 			},
		// 		],
		// 	}
		// )
		await prisma.linkedIssues.update({
			where: {
				id: linkedIssue.id,
			},
			data: {
				attachmentId,
				// webhookId: webhook.gid,
			},
		})
	}
	const webhook = await asanaClient.webhooks.getById(
		linkedIssue.webhookId as string
	)
	console.log(webhook)
	const { data: githubIssue } = await gh.issues.get({
		owner: linkedIssue?.githubOwner,
		repo: linkedIssue?.githubRepo,
		issue_number: parseInt(linkedIssue?.githubIssue),
	})

	const getStatus = () => {
		if (githubIssue.draft) {
			return {
				status: 'Draft',
				color: 'red',
				icon: icons.draft,
			}
		}
		if (githubIssue.state === 'closed') {
			if ((githubIssue.state_reason = 'not_planned')) {
				return {
					status: 'Closed - Not Planned',
					color: 'gray',
					icon: icons.closedNoAct,
				}
			}
			return {
				status: 'Closed',
				color: 'blue',
				icon: icons.closed,
			}
		}
		return {
			status: 'Open',
			color: 'green',
			icon: icons.open,
		}
	}
	const getAssignees = () => {
		if (!githubIssue.assignees || !githubIssue.assignees.length)
			return {
				name: 'Assigned to:',
				type: 'text_with_icon',
				text: 'No one',
			}
		if (githubIssue.assignees.length === 1) {
			return {
				name: 'Assigned to:',
				type: 'text_with_icon',
				text: githubIssue.assignee?.login,
				icon_url: githubIssue.assignee?.avatar_url,
			}
		}
		return {
			name: 'Assigned to:',
			type: 'text_with_icon',
			text: `${githubIssue.assignee?.login} + ${
				githubIssue.assignees.length - 1
			} more`,
			icon_url: githubIssue.assignee?.avatar_url,
		}
	}
	// console.log(JSON.stringify(githubIssue, null, 2))
	return {
		template: 'summary_with_details_v0',
		metadata: {
			title: githubIssue.title,
			subtitle: `${linkedIssue.githubOwner}/${linkedIssue.githubRepo} - Issue #${linkedIssue.githubIssue}`,
			subicon_url: getStatus().icon,
			fields: [
				{
					name: 'Status',
					type: 'pill',
					text: getStatus().status,
					color: getStatus().color,
				},
				getAssignees(),
			],
			footer: {
				footer_type: 'created',
				created_at: DateTime.fromISO(githubIssue.created_at).toISO(),
			},
			num_comments: githubIssue.comments,
		},
	}
}
