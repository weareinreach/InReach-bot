import NextConnectReceiver from 'util/NextConnectReciever'
import { App, LogLevel } from '@slack/bolt'
import type { NextApiRequest, NextApiResponse } from 'next'
import { slackBot } from 'bots'
import { prismaConvoStore } from 'bots/slackUtil/convoStore'

export const slackReceiver = new NextConnectReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET || 'invalid',
	// The `processBeforeResponse` option is required for all FaaS environments.
	// It allows Bolt methods (e.g. `app.message`) to handle a Slack request
	// before the Bolt framework responds to the request (e.g. `ack()`). This is
	// important because FaaS immediately terminate handlers after the response.
	processBeforeResponse: true,
})
export const slackApp = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: slackReceiver,
	logLevel: LogLevel.DEBUG,
	convoStore: new prismaConvoStore(),
})

slackBot(slackApp)

const slackRouter = slackReceiver.start()

export default slackRouter
