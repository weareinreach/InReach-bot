import type { ModalView } from '@slack/web-api'

export const newMessageBlock: ModalView = {
	type: 'modal',
	callback_id: 'newMessage',
	title: {
		type: 'plain_text',
		text: 'Set up recurring message',
		emoji: true,
	},
	submit: {
		type: 'plain_text',
		text: 'Submit',
		emoji: true,
	},
	close: {
		type: 'plain_text',
		text: 'Cancel',
		emoji: true,
	},
	blocks: [
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: 'Select the channel, days, and time you wish for your message to be sent.',
				emoji: true,
			},
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'conversations_select',
					placeholder: {
						type: 'plain_text',
						text: 'Select channel',
						emoji: true,
					},
					filter: {
						include: ['public', 'private', 'mpim'],
					},
					action_id: 'channel',
				},
			],
		},
		{
			type: 'input',
			element: {
				type: 'multi_static_select',
				placeholder: {
					type: 'plain_text',
					text: 'Select options',
					emoji: true,
				},
				options: [
					{
						text: {
							type: 'plain_text',
							text: 'Sunday',
							emoji: true,
						},
						value: '0',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Monday',
							emoji: true,
						},
						value: '1',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Tuesday',
							emoji: true,
						},
						value: '2',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Wednesday',
							emoji: true,
						},
						value: '3',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Thursday',
							emoji: true,
						},
						value: '4',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Friday',
							emoji: true,
						},
						value: '5',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Saturday',
							emoji: true,
						},
						value: '6',
					},
				],
				action_id: 'wdays',
			},
			label: {
				type: 'plain_text',
				text: 'Select days',
				emoji: true,
			},
		},
		{
			type: 'input',
			element: {
				type: 'timepicker',
				placeholder: {
					type: 'plain_text',
					text: 'Select time',
					emoji: true,
				},
				action_id: 'time',
			},
			label: {
				type: 'plain_text',
				text: 'Select time',
				emoji: true,
			},
		},
	],
}

export const newMessageInteractive = {
	blocks: [
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: 'Select the channel, days, and time you wish for your message to be sent.',
				emoji: true,
			},
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'conversations_select',
					placeholder: {
						type: 'plain_text',
						text: 'Select channel',
						emoji: true,
					},
					filter: {
						include: ['public', 'private', 'mpim'],
					},
					action_id: 'channel',
				},
			],
		},
		{
			type: 'input',
			element: {
				type: 'multi_static_select',
				placeholder: {
					type: 'plain_text',
					text: 'Select options',
					emoji: true,
				},
				options: [
					{
						text: {
							type: 'plain_text',
							text: 'Sunday',
							emoji: true,
						},
						value: '0',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Monday',
							emoji: true,
						},
						value: '1',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Tuesday',
							emoji: true,
						},
						value: '2',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Wednesday',
							emoji: true,
						},
						value: '3',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Thursday',
							emoji: true,
						},
						value: '4',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Friday',
							emoji: true,
						},
						value: '5',
					},
					{
						text: {
							type: 'plain_text',
							text: 'Saturday',
							emoji: true,
						},
						value: '6',
					},
				],
				action_id: 'wdays',
			},
			label: {
				type: 'plain_text',
				text: 'Select days',
				emoji: true,
			},
		},
		{
			type: 'input',
			element: {
				type: 'timepicker',
				placeholder: {
					type: 'plain_text',
					text: 'Select time',
					emoji: true,
				},
				action_id: 'time',
			},
			label: {
				type: 'plain_text',
				text: 'Select time',
				emoji: true,
			},
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'button',
					text: {
						type: 'plain_text',
						text: 'Save',
						emoji: true,
					},
					value: 'click-save',
					action_id: 'clickSave',
				},
			],
		},
	],
}
