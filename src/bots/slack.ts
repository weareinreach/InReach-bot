import { App, ButtonAction } from '@slack/bolt'
import { slack as slackApp } from 'src/pages/api/slack/[[...route]]'
import { storeAttendee, storeUser } from './slackUtil/redis'

export const slackBot = (app: App) => {
	app.use(async ({ payload, next }) => {
		console.log('InReachBot', payload)
		await next()
	})

	app.action('button-action', async (params) => {
		const { ack, body, client } = params
		const payload = params.payload as ButtonAction

		await ack()
		/* It's a debugging statement. */
		const uuid = payload.value
		const user = await client.users.profile.get({ user: body.user.id })
		storeUser(uuid, user.profile?.display_name as string)
		await storeAttendee(user.profile?.display_name as string, {
			id: body.user.id,
			org: body.team!.id,
			profile: user.profile!,
		})
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
	app.command('intest', async ({ ack, body, client, respond }) => {
		const convo = body.channel_id
		const call = await client.calls.add({
			external_unique_id: Date.now().toString(),
			join_url:
				'https://us06web.zoom.us/j/87291056330?pwd=cjdTMzNkOHY1SGpoNjZ6YXl5WHVrdz09&wp=wJcGEk1bh_OpOaeCoQb_RgXkUOtKveVe7L65Zzd_fl6t3wmI3mAZUY60yncmYk9Y97BMZ7nL4_hY3WsPyH2tM5aM.6iS2UJ3NuZpZSjO9',
		})
		await ack()
		respond(JSON.stringify(call, null, 2))
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
