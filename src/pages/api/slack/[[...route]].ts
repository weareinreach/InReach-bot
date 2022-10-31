import NextConnectReceiver from 'util/NextConnectReciever'
import { App, LogLevel } from '@slack/bolt'
import { slackBot } from 'src/bots/slack'
import { prismaConvoStore } from 'src/bots/slackUtil/convoStore'
import { logger } from 'util/logger'

const slackReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	processBeforeResponse: true,
})
const loglevel =
	process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG
export const slack = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: slackReceiver,
	logLevel:
		process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
	logger: {
		debug: (...msgs) => {
			logger.debug('InReachBot debug: ' + JSON.stringify(msgs, null, 2))
		},
		info: (...msgs) => {
			logger.info('InReachBot info: ' + JSON.stringify(msgs, null, 2))
		},
		warn: (...msgs) => {
			logger.warn('InReachBot warn: ' + JSON.stringify(msgs, null, 2))
		},
		error: (...msgs) => {
			logger.error('InReachBot error: ' + JSON.stringify(msgs, null, 2))
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

slackBot(slack)

const slackRouter = slackReceiver.start()

export { slackRouter as default }
