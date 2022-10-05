import NextConnectReceiver from 'util/NextConnectReciever'
import { App, LogLevel } from '@slack/bolt'
import { prismaConvoStore } from 'src/bots/slackUtil/convoStore'
import { slackJrBot } from 'src/bots/slackJr'
import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from 'util/logger'

const slackJrReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACKJR_SIGNING_SECRET || 'invalid',
	processBeforeResponse: true,
	endpoints: {
		events: '/api/slackjr/events',
		commands: '/api/slackjr/commands',
		actions: '/api/slackjr/actions',
	},
})
const loglevel =
	process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG

export const slackJr = new App({
	token: process.env.SLACKJR_BOT_TOKEN,
	receiver: slackJrReceiver,
	// logLevel:
	// 	process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
	logger: {
		debug: (...msgs) => {
			logger.debug('InReachBotJr:', msgs)
		},
		info: (...msgs) => {
			logger.info('InReachBotJr:', msgs)
		},
		warn: (...msgs) => {
			logger.warn('InReachBotJr:', msgs)
		},
		error: (...msgs) => {
			logger.error('InReachBotJr:', msgs)
		},
		setLevel: (level) => {
			level = loglevel
		},
		getLevel: () => loglevel,
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
