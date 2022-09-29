import NextConnectReceiver from 'util/NextConnectReciever'
import { App as AppJr, LogLevel } from '@slack/bolt'
import { prismaConvoStore } from 'src/bots/slackUtil/convoStore'
import { slackJrBot } from 'src/bots/slackJr'

const slackJrReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACKJR_SIGNING_SECRET || 'invalid',
	// The `processBeforeResponse` option is required for all FaaS environments.
	// It allows Bolt methods (e.g. `app.message`) to handle a Slack request
	// before the Bolt framework responds to the request (e.g. `ack()`). This is
	// important because FaaS immediately terminate handlers after the response.
	processBeforeResponse: true,
})

export const slackJr = new AppJr({
	token: process.env.SLACKJR_BOT_TOKEN,
	signingSecret: process.env.SLACKJR_SIGNING_SECRET,
	receiver: slackJrReceiver,
	logLevel: LogLevel.DEBUG,
	convoStore: new prismaConvoStore(),
	developerMode: false,
})

slackJrBot(slackJr)

const slackJrRouter = slackJrReceiver.start()

export default slackJrRouter
