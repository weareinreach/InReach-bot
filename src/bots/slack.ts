import { App, ButtonAction } from '@slack/bolt'
import { slack as slackApp } from 'src/pages/api/slack/[[...route]]'
import { storeAttendee, storeUser } from './slackUtil/redis'
import { createInvite } from './zoom'

export const slackBot = (app: App) => {
	app.use(async ({ payload, next }) => {
		console.log('InReachBot', payload)
		await next()
	})

	app.action('getinvite', async (params) => {
		const { ack, body, client } = params

		await ack()

		const user = await client.users.profile.get({ user: body.user.id })
		await storeAttendee(user.profile?.display_name as string, {
			id: body.user.id,
			org: body.team!.id,
			profile: user.profile!,
		})

		const link = await createInvite(
			user.profile?.display_name as string,
			process.env.ZOOM_COWORKING_MEETING_ID
		)

		const messageBlock = [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `Here's your link to join the fun! The invite link will expire in 5 minutes, so click soon!`,
				},
				accessory: {
					type: 'button',
					text: {
						type: 'plain_text',
						text: 'Let me in!',
						emoji: true,
					},
					value: 'joinzoom',
					url: link,
					action_id: 'joinzoom',
				},
			},
		]

		client.chat.postEphemeral({
			channel: body.channel?.id as string,
			user: body.user.id,
			blocks: messageBlock,
		})
	})
	app.action('joinzoom', async ({ ack }) => ack())
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
