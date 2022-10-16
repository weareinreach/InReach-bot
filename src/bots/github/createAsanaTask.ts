import { asanaClient } from '../asana'
import { prisma } from 'util/prisma'
import type { IssuesOpenedEvent } from '@octokit/webhooks-types'
import invariant from 'tiny-invariant'
import { attachIssueToGH } from '../asana/attachIssue'
import { extractTaskFromBlock, githubIssueRegex, htmlRegex } from 'util/regex'
import {
	getAsanaGhLabelsEnum,
	ghLabelFieldGid,
	sourceGitHubField,
} from '../asana/customField'
import type { components as AsanaAPI } from 'types/asana-api'
import showdown from 'showdown'
import { asanaBatch } from '../asana/batchTransaction'
import { z } from 'zod'
import { attachItem } from '../asana/attachItem'

const asanaWorkspace = process.env.ASANA_WORKSPACE

/* A schema that validates an array of strings to be URLs. */
const imageArrSchema = z.array(z.string().url())

/**
 * It creates an Asana task, attaches the GitHub issue to it, and then attaches the Asana task to the
 * GitHub issue
 * @param payload - IssuesOpenedEvent
 */
export const createAsanaTask = async (payload: IssuesOpenedEvent) => {
	try {
		const asana = await asanaClient()

		/* Checking if the issue already has an Asana task attached to it. */
		const existingTask = extractTaskFromBlock.exec(payload.issue.body ?? '')
		if (existingTask?.length) {
			invariant(existingTask[0])
			const attachedTask = await asana.attachments.findByTask(existingTask[0])
			if (
				attachedTask.data.some((task) => githubIssueRegex.test(task.view_url))
			) {
				console.log('Issue already attached to task')
				return
			}
		}

		/* Finding the asana board that is associated with the repo. */
		const asanaProject = await prisma.activeRepo.findFirstOrThrow({
			where: {
				repo: payload.repository.name,
			},
			select: {
				asanaBoard: {
					select: { boardId: true },
				},
			},
		})
		invariant(asanaProject.asanaBoard?.boardId, 'No board returned')
		const asanaBoard = asanaProject.asanaBoard.boardId

		/* Getting the labels from the GitHub issue and then mapping them to the Asana labels. */
		let asanaLabels: AsanaAPI['schemas']['EnumOption'][] = []
		const custom_fields: Record<string, string | string[]> = {
			[sourceGitHubField.fieldGid]: sourceGitHubField.optGid,
		}
		if (payload.issue?.labels?.length) {
			asanaLabels = await getAsanaGhLabelsEnum()
			const labels = payload.issue.labels.map((label) => {
				try {
					const result = asanaLabels.find((item) => item.name === label.name)
					invariant(result?.gid, 'Label not found')
					return result.gid.toString()
				} catch (err) {
					console.log(err)
				}
			})
			const filteredLabels = labels.filter((x) => x)
			custom_fields[ghLabelFieldGid] =
				filteredLabels.length === 1
					? (filteredLabels[0] as string)
					: (filteredLabels as string[])
		}

		/* Converting the GitHub Markdown to HTML and then removing/altering HTML tags to fit Asana's specs. */
		let taskBody: string | undefined = undefined
		let extractedImages: Array<string | undefined> = []
		if (payload.issue.body) {
			/** Init an instance of {@link https://showdownjs.com/ Showdown} for HTML to Markdown conversion */
			const convert = new showdown.Converter({
				emoji: true,
				ghCodeBlocks: true,
				ghCompatibleHeaderId: true,
				ghMentions: true,
				requireSpaceBeforeHeadingText: true,
				strikethrough: true,
				underline: true,
				noHeaderId: true,
			})

			/* Converting the HTML to Markdown. */
			taskBody = `<body>${convert.makeHtml(payload.issue.body)}</body>`

			/* Extracting all the images from the HTML body of the issue. */
			const images = taskBody.matchAll(htmlRegex.image)

			/* Iterating over the images array and pushing the image url to the extractedImages array. */
			for (let image of images) extractedImages.push(image[1])

			/** Removing/altering HTML to fit {@link https://developers.asana.com/docs/rich-text Asana's specs} */
			taskBody = taskBody
				.replace(htmlRegex.strip, '')
				.replace(htmlRegex.heading, '$1strong$2')
				.replace(htmlRegex.image, '*IMAGE PLACEHOLDER - SEE ATTACHMENTS*')
		}

		/* Creating a task in Asana. */
		const { data: asanaTask } = await asana.dispatcher.post('/tasks', {
			name: payload.issue.title,
			html_notes: `${taskBody}`,
			workspace: asanaWorkspace,
			external: {
				gid: payload.issue.id.toString(),
				data: payload.issue.id.toString(),
			},
			projects: [asanaBoard],
			custom_fields,
		})

		/* Attaching the GitHub issue to the Asana task. */
		const attachedIssue = await attachItem({
			name: payload.issue.title,
			parent: asanaTask.gid,
			resource_subtype: 'external',
			url: payload.issue.html_url,
		})

		/* Checking if the images are valid URLs and then creating a batch of actions to attach them to the Asana task. */
		const imagesToAttach = imageArrSchema.safeParse(extractedImages)
		const attachedImages = imagesToAttach.success
			? await Promise.all(
					imagesToAttach.data.map((image, i) => {
						console.log('add image to batch')
						return attachItem({
							parent: asanaTask.gid,
							name: `Image #${i + 1} from GitHub Issue`,
							resource_subtype: 'external' as const,
							url: image,
						})
					})
			  )
			: undefined

		/* Attaching the issue to the Asana task. */
		const attachedToGH = await attachIssueToGH({
			asana_ticket: asanaTask.gid,
			attachment: attachedIssue.data.gid,
			issue_number: payload.issue.number,
			githubId: payload.issue.id,
			owner: payload.repository.owner.login,
			repo: payload.repository.name,
		})
		return {
			task: asanaTask,
			issue: attachedToGH,
			attachedImages,
		}
	} catch (err) {
		console.error(err)
	}
}
