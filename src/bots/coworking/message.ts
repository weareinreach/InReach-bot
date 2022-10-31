import type { App } from '@slack/bolt'
import type { ZoomReqBody } from 'src/pages/api/zoom'
import { slack } from 'src/pages/api/slack/[[...route]]'
import { slackJr } from 'src/pages/api/slackjr/[[...route]]'
import { prisma } from 'util/prisma'
import { v4 as uuidv4 } from 'uuid'
import { logger } from 'util/logger'

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

const attendees = async () => {
	const party = await prisma.coworkingAttendee.findMany({
		select: { name: true, image: true },
	})
	const partyList = party.flatMap((person, i, arr) => {
		let name
		if (i + 1 === arr.length) name = person.name
		else if (i + 1 === arr.length - 1 && arr.length >= 3)
			name = `${person.name}, and`
		else if (i + 1 < arr.length && arr.length === 2) name = `${person.name} and`
		else if (i + 1 < arr.length && arr.length > 2) name = `${person.name},`

		return [
			{
				type: 'image',
				image_url: person.image,
				alt_text: person.name,
			},
			{
				type: 'plain_text',
				text: name,
			},
		]
	})
	// console.log(partyList)
	return partyList
}

const updateMessage = async (
	client: App,
	channel: string,
	timestamp?: string,
	attendeeUpdate?: boolean
) => {
	const uniqueId = uuidv4()
	const participantList = await attendees()

	const meetingEnded =
		timestamp && (!attendeeUpdate || participantList.length === 0)

	const participantBlock = [
		{
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text: '*Currently here:*',
				},
			],
		},
		{
			type: 'context',
			elements: participantList,
		},
	]
	const baseMessage = {
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: meetingEnded ? body.end : body.start,
		},
		accessory: {
			type: 'button',
			text: {
				type: 'plain_text',
				text: meetingEnded ? button.start : button.join,
				emoji: true,
			},
			value: uniqueId,
			// url: `${process.env.BASE_URL}/zoom/join/${uniqueId}`,
			action_id: 'getinvite',
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
	}

	const message = {
		channel,
		text: meetingEnded ? body.end : body.start,
		unfurl_links: false,
		unfurl_media: false,
		blocks:
			participantList.length && attendeeUpdate
				? [baseMessage, ...participantBlock]
				: [baseMessage],
	}
	// console.log('message to post', message)
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

export const slackUpdateMessage = async (
	timestamps?: {
		timestamp: string
		timestampJr: string
	},
	attendeeUpdate = false
) => {
	const { timestamp, timestampJr } = timestamps ?? {
		timestamp: undefined,
		timestampJr: undefined,
	}
	const inreach = await updateMessage(
		slack,
		process.env.SLACK_COWORKING_CHANNEL_ID,
		timestamp,
		attendeeUpdate
	)
	const inreachJr = await updateMessage(
		slackJr,
		process.env.SLACKJR_COWORKING_CHANNEL_ID,
		timestampJr,
		attendeeUpdate
	)
	logger.info(`Messages posted/updated:
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
