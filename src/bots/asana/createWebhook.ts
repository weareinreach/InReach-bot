import { asanaClient } from '.'

/**
 * It takes a boardId as a string and returns a string that is the base url of the app, plus the path
 * to the webhook endpoint, plus the boardId
 * @param boardId - The ID of the board you want to create a webhook for.
 */
const createWebhookUrl = (boardId: string) =>
	`${process.env.BASE_URL}/api/asana/webhook/${boardId}`

/**
 * It creates a webhook for the given boardId, and returns the webhook object
 * @param boardId - The ID of the board you want to create the webhook for.
 */
export const createAsanaWebhook = async (boardId: string) => {
	const asana = await asanaClient()

	const webhook = await asana.webhooks.create(
		boardId,
		createWebhookUrl(boardId),
		{
			filters: [
				{
					resource_type: 'attachment',
					action: 'deleted',
				},
				{
					resource_type: 'task',
					resource_subtype: 'default_task',
					action: 'changed',
					fields: ['assignee', 'tags'],
				},
				{
					resource_type: 'task',
					action: 'added',
					resource_subtype: 'default_task',
					parent: 'section',
				},
				{
					resource_type: 'task',
					action: 'removed',
					resource_subtype: 'default_task',
				},
			],
		}
	)
	return webhook
}
