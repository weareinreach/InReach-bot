import NextConnectReceiver from 'util/NextConnectReciever'
import { App, LogLevel } from '@slack/bolt'
import { slackBot } from 'src/bots/slack'
import { prismaConvoStore } from 'src/bots/slackUtil/convoStore'

const slackReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET || 'invalid',
	// The `processBeforeResponse` option is required for all FaaS environments.
	// It allows Bolt methods (e.g. `app.message`) to handle a Slack request
	// before the Bolt framework responds to the request (e.g. `ack()`). This is
	// important because FaaS immediately terminate handlers after the response.
	processBeforeResponse: true,
})
const slack = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: slackReceiver,
	logLevel: LogLevel.DEBUG,
	convoStore: new prismaConvoStore(),
	developerMode: false,
})

slackBot(slack)

const slackRouter = slackReceiver.start()

export { slackRouter as default, slack }
