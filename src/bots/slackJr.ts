import { App, Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt'
import {
	slackJr as slackApp,
	slackJr,
} from 'src/pages/api/jrslack/[[...route]]'
import { newMessageBlock, newMessageInteractive } from './slackUtil'

export const slackJrBot = (app: App) => {
	app.use(async ({ payload, next, context, body }) => {
		console.log(payload, body)
		// try {
		// 	await context.updateConversation()
		// } catch (err) {
		// 	throw err
		// }
		await next()
	})
	app.action('button-action', async ({ ack, payload }) => {
		console.log('button pressed!', payload)
		await ack()
		// console.log(payload, context, body)
	})
	app.event('app_home_opened', async ({ event, client }) => {
		console.log('app home opened', event)
		await client.views.publish({
			user_id: event.user,
			view: {
				type: 'home',
				blocks: [
					{
						type: 'section',
						text: {
							text: 'This is published from Next.js',
							type: 'plain_text',
						},
					},
				],
			},
		})
	})
}
