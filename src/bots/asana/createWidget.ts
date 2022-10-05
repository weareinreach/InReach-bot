import { prisma } from 'util/prisma'
import { githubClient } from '../github'
import { DateTime } from 'luxon'
const baseUrl = process.env.BASE_URL

const icons = {
	draft: `${baseUrl}/issues/draft.png`,
	open: `${baseUrl}/issues/open.png`,
	closed: `${baseUrl}/issues/closed.png`,
	closedNoAct: `${baseUrl}/issues/closed2.png`,
}

/**
 * It returns an object with the template, metadata, and attachment_id properties
 * @param {string} task - The task ID of the task that the widget is being created for.
 * @param {string} attachmentId - The ID of the attachment that was created.
 * @returns An Asana Widget definition object
 *
 */
export const createWidget = async (task: string, attachmentId: string) => {
	/* Finding the linked issue in the database. */
	const linkedIssue = await prisma.linkedIssues.findFirst({
		where: { asanaTicket: task },
	})
	if (!linkedIssue) throw new Error('not found')

	/* Getting the issue from github. */
	const { data: githubIssue } = await githubClient.rest.issues.get({
		owner: linkedIssue?.githubOwner,
		repo: linkedIssue?.githubRepo,
		issue_number: parseInt(linkedIssue?.githubIssue),
	})

	/**
	 * It returns an object with a status, color, and icon property based on the state of the issue
	 * @returns An object with three properties: status, color, and icon.
	 */
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

	/**
	 * It returns a field object with the name "Assigned to:" and the text "No one" if there are no
	 * assignees, otherwise it returns a field object with the name "Assigned to:" and the text "username +
	 * x more" if there are more than one assignees, otherwise it returns a field object with the name
	 * "Assigned to:" and the text "username" if there is only one assignee
	 * @returns An object with the following properties:
	 * 	name: 'Assigned to:',
	 * 	type: 'text_with_icon',
	 * 	text: 'No one',
	 * 	icon_url: undefined
	 */
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
