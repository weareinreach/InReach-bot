import { App, ButtonAction } from '@slack/bolt'
// import {
// 	slackJr as slackApp,
// 	slackJr,
// } from 'src/pages/api/jrslack/[[...route]]'
// import { newMessageBlock, newMessageInteractive } from './slackUtil'
import { storeUser } from './slackUtil/redis'

export const slackJrBot = (app: App) => {
	app.use(async ({ payload, next }) => {
		console.log('InReachBotJr', payload)
		await next()
	})
	app.event('url_verification', async ({ payload, client }) => {
		console.log(payload)
	})
	app.event('message', async ({ event, say }) => {
		const text = (event as any).text
		say({
			text: text || 'Hello world!',
		})
	})
	app.action('button-action', async (params) => {
		const { ack, body } = params
		const payload = params.payload as ButtonAction

		await ack()
		/* It's a debugging statement. */
		console.group('slack button')
		console.log('payload', payload)
		// console.log('body', body)
		const uuid = payload.value
		console.groupEnd()
		console.log(uuid)
		storeUser(uuid, body.user.id)
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
