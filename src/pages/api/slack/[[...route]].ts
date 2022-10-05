import NextConnectReceiver from 'util/NextConnectReciever'
import { App, LogLevel } from '@slack/bolt'
import { slackBot } from 'src/bots/slack'
import { prismaConvoStore } from 'src/bots/slackUtil/convoStore'

const slackReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	processBeforeResponse: true,
})
export const slack = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: slackReceiver,
	logLevel:
		process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
	logger: {
		debug: (...msgs) => {
			console.log('InReachBot debug: ' + JSON.stringify(msgs, null, 2))
		},
		info: (...msgs) => {
			console.info('InReachBot info: ' + JSON.stringify(msgs, null, 2))
		},
		warn: (...msgs) => {
			console.warn('InReachBot warn: ' + JSON.stringify(msgs, null, 2))
		},
		error: (...msgs) => {
			console.error('InReachBot error: ' + JSON.stringify(msgs, null, 2))
		},
		setLevel: () => {},
		getLevel: () =>
			process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
		setName: (name) => {},
	},
	// convoStore: new prismaConvoStore(),
	socketMode: false,
	developerMode: process.env.NODE_ENV !== 'production',
})

slackBot(slack)

const slackRouter = slackReceiver.start()

export { slackRouter as default }
