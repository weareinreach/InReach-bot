import {
	App,
	LogLevel,
	Middleware,
	SlackCommandMiddlewareArgs,
	HTTPReceiver,
} from '@slack/bolt'
import { slack as slackApp } from 'src/pages/api/slack/[[...route]]'

// async function addContext({ payload, client, context, next }) {
// 	const { user } = await client.users.info({
// 		user: payload.user_id,
// 		include_locale: true,
// 	})
// 	// Add user's timezone context
// 	context.tz_offset = user.tz_offset
// 	// context.updateConversation(payload.user_id, Date.now() + 60 * 5)
// 	// Pass control to the next middleware function
// 	await next()
// }

export const slackBot = (app: App) => {
	app.use(async ({ payload, next, context }) => {
		console.log(payload)
		// try {
		// 	await context.updateConversation()
		// } catch (err) {
		// 	throw err
		// }
		await next()
	})

	// app.event('message', async ({ event, say, context }) => {
	// 	console.log(JSON.stringify(event, null, 2))
	// 	await context.updateConversation()
	// 	const text = (event as any).text
	// 	say({
	// 		text: text || 'Hello world!',
	// 	})
	// })
	// app.command(
	// 	'/inreach',
	// 	// addContext,
	// 	async ({ command, ack, say, context, payload, client }) => {
	// 		await ack()
	// 		context.updateConversation(payload.user_id)
	// 		console.log(JSON.stringify(payload, null, 2))
	// 		// client.views.open({
	// 		// 	trigger_id: payload.trigger_id,
	// 		// 	view: newMessageBlock as ModalView,
	// 		// })
	// 		say(newMessageInteractive)
	// 	}
	// )
	app.view(
		{ callback_id: 'newMessage', type: 'view_submission' },
		async ({ ack, body, view, client, logger, context, payload }) => {
			await ack()
			console.log(JSON.stringify(body, null, 2))
		}
	)

	const noActFields = ['channel', 'wdays', 'time']
	app.action('button-action', async ({ ack }) => {
		await ack()
		// console.log(payload, context, body)
	})
	app.action(
		'clickSave',
		async ({ ack, body, client, context, payload, say }) => {
			await ack()
			say(JSON.stringify(payload, null, 2))
		}
	)
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

type SlackMessage = {
	channel: string
	message: string
}

export const slackWeb = {
	sendMessage: async (data: SlackMessage) => {
		const { channel, message } = data
		const result = await slackApp.client.chat.postMessage({
			channel,
			text: message,
		})
		return `${channel}: ${result.ts}`
	},

	listChannels: async () => {
		const result = await slackApp.client.conversations.list()
	},
}
