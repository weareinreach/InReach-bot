import { App, ButtonAction } from '@slack/bolt'
import { storeUser, storeAttendee } from './slackUtil/redis'
import { createInvite } from './zoom'

export const slackJrBot = (app: App) => {
	app.use(async ({ payload, next }) => {
		console.log('InReachBotJr', payload)
		await next()
	})

	app.action('getinvite', async (params) => {
		const { ack, body, client } = params
		// const payload = params.payload as ButtonAction

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

		// const uuid = payload.value
		// await storeUser(uuid, user.profile?.display_name as string)
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
}
