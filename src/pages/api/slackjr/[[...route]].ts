import NextConnectReceiver from 'util/NextConnectReciever'
import { App, LogLevel } from '@slack/bolt'
import { prismaConvoStore } from 'src/bots/slackUtil/convoStore'
import { slackJrBot } from 'src/bots/slackJr'
import { NextApiRequest, NextApiResponse } from 'next'

const slackJrReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACKJR_SIGNING_SECRET || 'invalid',
	processBeforeResponse: true,
	endpoints: {
		events: '/api/slackjr/events',
		commands: '/api/slackjr/commands',
		actions: '/api/slackjr/actions',
	},
})

export const slackJr = new App({
	// signingSecret: process.env.SLACKJR_SIGNING_SECRET,
	// clientId: process.env.SLACKJR_CLIENT_ID,
	// clientSecret: process.env.SLACKJR_CLIENT_SECRET,
	token: process.env.SLACKJR_BOT_TOKEN,
	receiver: slackJrReceiver,
	logLevel:
		process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
	logger: {
		debug: (...msgs) => {
			console.log('InReachBotJr debug: ' + JSON.stringify(msgs, null, 2))
		},
		info: (...msgs) => {
			console.info('InReachBotJr info: ' + JSON.stringify(msgs, null, 2))
		},
		warn: (...msgs) => {
			console.warn('InReachBotJr warn: ' + JSON.stringify(msgs, null, 2))
		},
		error: (...msgs) => {
			console.error('InReachBotJr error: ' + JSON.stringify(msgs, null, 2))
		},
		setLevel: (level) => {},
		getLevel: () =>
			process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
		setName: (name) => {},
	},
	// convoStore: new prismaConvoStore(),
	socketMode: false,
	developerMode: process.env.NODE_ENV !== 'production',
})

slackJrBot(slackJr)

const slackJrRouter = slackJrReceiver.start()
slackJrRouter.get(
	'/api/jrslack',
	(req: NextApiRequest, res: NextApiResponse) => {
		res.status(200).json({
			test: true,
		})
	}
)

export { slackJrRouter as default }
