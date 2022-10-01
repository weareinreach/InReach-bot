import type { App } from '@slack/bolt'
import type { ZoomReqBody } from 'src/pages/api/zoom'
import { slack } from 'src/pages/api/slack/[[...route]]'
import { slackJr } from 'src/pages/api/slackjr/[[...route]]'
import { prisma } from 'util/prisma'

const body = {
	start: 'A new Co-Working Session has Started!',
	end: 'The current Co-Working Session has ended.',
}
const button = {
	start: 'Start New',
	join: 'Join in!',
}

const notice = {
	title: 'Heads up!',
	body: 'This is a Zoom link - following it will most likely open Zoom and add you to our Co-Working Room.',
	confirm: "Let's go!",
	cancel: "Stop, I've changed my mind!",
}

const updateMessage = async (
	client: App,
	channel: string,
	timestamp?: string
) => {
	const lastRecord = await prisma.coworking.findMany({
		select: { id: true, createdAt: true },
		orderBy: { createdAt: 'desc' },
		take: 1,
	})
	const message = {
		channel,
		text: timestamp ? body.end : body.start,
		unfurl_links: false,
		unfurl_media: false,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: timestamp ? body.end : body.start,
				},
				accessory: {
					type: 'button',
					text: {
						type: 'plain_text',
						text: timestamp ? button.start : button.join,
						emoji: true,
					},
					value: lastRecord[0]?.id,
					// url: process.env.ZOOM_MEETING_URL,
					url: `http://localhost:3000/api/zoom/join?uuid=${lastRecord[0]?.id}`,
					action_id: 'button-action',
					style: 'primary',
					confirm: {
						title: {
							type: 'plain_text',
							text: notice.title,
						},
						text: {
							type: 'mrkdwn',
							text: notice.body,
						},
						confirm: {
							type: 'plain_text',
							text: notice.confirm,
						},
						deny: {
							type: 'plain_text',
							text: notice.cancel,
						},
					},
				},
			},
		],
	}

	const result = timestamp
		? client.client.chat.update({ ...message, ts: timestamp })
		: client.client.chat.postMessage(message)
	return result
}

const postComment = async (
	client: App,
	timestamp: string,
	channel: string,
	username: string,
	event: ZoomReqBody['event']
) => {
	const result = await client.client.chat.postMessage({
		thread_ts: timestamp,
		text:
			event === 'meeting.participant_joined'
				? `${username} has joined!`
				: `${username} has left. We'll miss you!`,
		channel,
	})
	return result
}

export const slackUpdateMessage = async (timestamps?: {
	timestamp: string
	timestampJr: string
}) => {
	const { timestamp, timestampJr } = timestamps ?? {
		timestamp: undefined,
		timestampJr: undefined,
	}
	const inreach = await updateMessage(
		slack,
		process.env.SLACK_COWORKING_CHANNEL_ID,
		timestamp
	)
	const inreachJr = await updateMessage(
		slackJr,
		process.env.SLACKJR_COWORKING_CHANNEL_ID,
		timestampJr
	)
	console.info(`Messages posted/updated: 
	InReach: ${inreach.ok}
	JrBoard: ${inreachJr.ok}`)
	return { inreach, inreachJr }
}

export const slackPostComment = async ({
	timestamp,
	timestampJr,
	username,
	event,
}: {
	timestamp: string
	timestampJr: string
	username: string
	event: ZoomReqBody['event']
}) => {
	const inreach = await postComment(
		slack,
		timestamp,
		process.env.SLACK_COWORKING_CHANNEL_ID,
		username,
		event
	)
	const inreachJr = await postComment(
		slackJr,
		timestampJr,
		process.env.SLACKJR_COWORKING_CHANNEL_ID,
		username,
		event
	)
	return { inreach, inreachJr }
}
