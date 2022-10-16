import { prisma } from 'util/prisma'
import { githubClient } from '../github'
import { DateTime } from 'luxon'
const baseUrl = process.env.BASE_URL
import { githubPrExtractRegex } from 'util/regex'
import { asanaClient } from '.'
import invariant from 'tiny-invariant'
import { z } from 'zod'

const icons = {
	draft: `${baseUrl}/pr/draft.png`,
	open: `${baseUrl}/pr/open.png`,
	closed: `${baseUrl}/pr/closed.png`,
	merged: `${baseUrl}/pr/merged.png`,
}

const prDetailsSchema = z.array(z.any())
/**
 * It returns an object with the template, metadata, and attachment_id properties
 * @param task - The task ID of the task that the widget is being created for.
 * @param attachmentId - The ID of the attachment that was created.
 * @returns An Asana Widget definition object
 *
 */
export const createPrWidget = async (task: string, attachmentId: string) => {
	const asana = await asanaClient()

	const attachment = await asana.attachments.findById(attachmentId)

	const prDetails = githubPrExtractRegex.exec(attachment.view_url)

	invariant(
		prDetails?.groups?.owner && prDetails?.groups?.repo && prDetails?.groups?.pr
	)
	console.log(prDetails!.groups!.pr, typeof prDetails!.groups!.pr)

	/* Getting the issue from github. */
	const { data: githubIssue } = await githubClient.rest.pulls.get({
		owner: prDetails.groups.owner,
		repo: prDetails.groups.repo,
		pull_number: parseInt(prDetails.groups.pr),
	})
	// console.log(githubIssue)
	/**
	 * It returns an object with a status, color, and icon property based on the state of the issue
	 * @returns An object with three properties: status, color, and icon.
	 */
	const getStatus = () => {
		if (githubIssue.draft) {
			return {
				status: 'Draft',
				color: 'cool-gray',
				icon: icons.draft,
			}
		}
		if (githubIssue.state === 'closed') {
			if (githubIssue.merged) {
				return {
					status: 'Merged',
					color: 'purple',
					icon: icons.merged,
				}
			}
			return {
				status: 'Closed',
				color: 'orange',
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
			subtitle: `${prDetails[0]}/${prDetails[1]} - PR #${prDetails[2]}`,
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
