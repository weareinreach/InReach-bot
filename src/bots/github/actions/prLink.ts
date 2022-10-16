import type { GraphQlQueryResponseData } from '@octokit/graphql'
import type { Context } from 'probot'
import {
	asanaBatch,
	AsanaTask,
	AttachmentItem,
} from 'src/bots/asana/batchTransaction'
import { z } from 'zod'
import { githubPullRegex } from 'util/regex'
import { attachItem, getAttachments } from '../../asana/attachItem'

/* A graphql query to get the linked issues. */
const linkedIssueGQL = `
query LinkedPr($node_id: ID!) {
  node(id: $node_id) {
    ... on PullRequest {
      id
      closingIssuesReferences(first: 50) {
        edges {
          node {
            bodyHTML
            databaseId
            id
            number
            state
          }
        }
      }
    }
  }
}
`
/* A schema for the response from the graphql query. */
const linkedIssueSchema = z.object({
	//node.closingIssuesReferences.edges[0].node.databaseId
	node: z.object({
		closingIssuesReferences: z.object({
			edges: z.array(
				z.object({
					node: z.object({
						databaseId: z.number(),
					}),
				})
			),
		}),
	}),
})

export const linkPullRequest = async (context: Context<'pull_request'>) => {
	/* Using the graphql query to get the linked issues. */
	const linkedPrQuery = await context.octokit.graphql<GraphQlQueryResponseData>(
		linkedIssueGQL,
		{
			node_id: context.payload.pull_request.node_id,
		}
	)

	/* Parsing the response from the graphql query and returning the databaseIds of the linked issues. */
	const linkedIssues = await linkedIssueSchema
		.parseAsync(linkedPrQuery)
		.then((result) =>
			result.node.closingIssuesReferences.edges.map(
				(item) => item.node.databaseId
			)
		)

	/* A map of the attachments of the linked issues. */
	const attachmentMap = new Map<string, AttachmentItem[]>()

	/** Getting the gid of the linked issues.
	 *  @returns Array of tasks
	 */
	const asanaTasks = await asanaBatch<AsanaTask>(
		linkedIssues.map((issue) => ({
			method: 'get' as const,
			relativePath: `/tasks/external:${issue}`,
			options: {
				fields: ['gid'],
			},
		}))
	)

	for (let task of asanaTasks) {
		const attachments = await getAttachments(task.body.data.gid)
		attachmentMap.set(task.body.data.gid, attachments)
	}

	attachmentMap.forEach(async (value, key) => {
		if (!value.some((item) => githubPullRegex.test(item.view_url))) {
			console.log(`Attaching to ${key}`)
			return await attachItem({
				parent: key,
				resource_subtype: 'external',
				name: context.payload.pull_request.title,
				url: context.payload.pull_request.html_url,
			})
		}
	})
	console.log('nothing to attach')
	// /** Getting the attachments of the linked issues.
	//  *  @returns Nested Array - `[[attachments by task]]`
	//  */
	// const taskAttachments = await asanaBatch<AttachmentList>(
	// 	asanaTasks.map((item) => ({
	// 		method: 'get' as const,
	// 		relativePath: '/attachments',
	// 		data: {
	// 			parent: item.body.data.gid,
	// 		},
	// 	}))
	// ).then((result) => ({}))
	// console.dir(taskAttachmentsList)

	// /* Getting the details of the attachments of the linked issues. */
	// const taskAttachmentsDetails = await asanaBatch<AttachmentItem>(
	// 	taskAttachmentsList.flatMap((item) =>
	// 		item.body.data.map((attachment) => ({
	// 			method: 'get' as const,
	// 			relativePath: `/attachments/${attachment.gid}`,
	// 		}))
	// 	)
	// )
	// console.dir(taskAttachmentsDetails)

	// const attachTest = await Promise.all(
	// 	asanaTasks.map(
	// 		async (task) =>
	// 			await attachItem({
	// 				url: context.payload.pull_request.html_url,
	// 				resource_subtype: 'external',
	// 				name: context.payload.pull_request.title,
	// 				parent: task.body.data.gid,
	// 			})
	// 	)
	// )
	// console.log(attachTest)
	// const linkedPullRequests = taskAttachmentsDetails.map((attachment)=> {
	// 	const attachedUrl = attachment.body.data.view_url
	// 	if (!githubPullRegex.test(attachedUrl))

	// })
}
