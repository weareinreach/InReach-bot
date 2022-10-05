import { App, ButtonAction } from '@slack/bolt'
import { storeUser, storeAttendee } from './slackUtil/redis'

export const slackJrBot = (app: App) => {
	app.use(async ({ payload, next }) => {
		console.log('InReachBotJr', payload)
		await next()
	})
	app.action('button-action', async (params) => {
		const { ack, body, client } = params
		const payload = params.payload as ButtonAction

		await ack()

		const uuid = payload.value
		const user = await client.users.profile.get({ user: body.user.id })
		await storeUser(uuid, user.profile?.display_name as string)
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
}
