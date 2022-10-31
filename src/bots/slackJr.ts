import { App } from '@slack/bolt'
import { storeAttendee } from './slackUtil/redis'
import { createInvite } from './zoom'

export const slackJrBot = (app: App) => {
	app.use(async ({ payload, next }) => {
		// console.log('InReachBotJr', payload)
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
		// console.log('slack: invite accepted')
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
		// console.log('app home opened', event)
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
