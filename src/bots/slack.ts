import { App } from '@slack/bolt'
import { slack as slackApp } from 'src/pages/api/slack/[[...route]]'
import { storeAttendee } from './slackUtil/redis'
import { createInvite } from './zoom'

export const slackBot = (app: App) => {
	app.use(async ({ body, next }) => {
		console.dir('InReachBot', body)
		await next()
	})
	app.action('getinvite', async (params) => {
		const { ack, body, client, payload, respond } = params
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

		const modalBlock = [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: "Here's your link to join -->",
				},
				accessory: {
					type: 'button',
					text: {
						type: 'plain_text',
						text: ':party_corgi: Lets go! :party_corgi:',
						emoji: true,
					},
					value: 'joined',
					url: link,
					action_id: 'joinzoom',
				},
			},
		]

		await client.views.open({
			// @ts-ignore
			trigger_id: body.trigger_id,
			view: {
				title: {
					type: 'plain_text',
					text: 'Coworking Room',
					emoji: true,
				},
				type: 'modal',
				blocks: modalBlock,
			},
		})
	})
	app.action('joinzoom', async ({ ack, client, body }) => {
		console.log('slack: invite accepted')
		await ack()

		await client.views.update({
			// @ts-ignore
			view_id: body.view.id,
			view: {
				type: 'modal',
				title: {
					type: 'plain_text',
					text: 'Coworking Room',
				},
				blocks: [
					{
						type: 'header',
						text: {
							type: 'plain_text',
							text: ':typing_frog:',
							emoji: true,
						},
					},
				],
			},
		})
	})
	app.view(
		'joinmodal',
		async ({ ack }) => await ack({ response_action: 'clear' })
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
