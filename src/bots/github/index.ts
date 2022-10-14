import { Probot } from 'probot'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'
import { createAsanaTask } from './createAsanaTask'
import { isWatchedRepo } from './isWatchedRepo'
import { asanaBlockRegex } from 'util/regex'
import { labelActions } from './labelActions'

/* It's creating a new Octokit client that uses the GitHub App's private key to authenticate. */
export const githubClient = new Octokit({
	authStrategy: createAppAuth,
	auth: {
		appId: parseInt(process.env.GITHUB_APP_ID),
		privateKey: Buffer.from(
			process.env.GITHUB_PRIVATE_KEY,
			'base64'
		).toString(),
		installationId: parseInt(process.env.GITHUB_INSTALL_ID),
	},
})

/**
 * `githubBot` is a function that takes a Probot app as an argument and returns a function that listens
 * for events and acts based on the event.
 * @param app - Probot - This is the Probot app that we're using to create our GitHub bot.
 */
export const githubBot = (app: Probot) => {
	/* When an issue is opened, create an Asana ticket, if it's a watched Repo and a ticket has not already been created. */
	app.on('issues.opened', async (context) => {
		if (
			!isWatchedRepo(
				context.payload.repository.owner.login,
				context.payload.repository.name
			)
		) {
			return
		}
		if (asanaBlockRegex.test(context.payload.issue.body ?? '')) {
			return
		}

		const task = createAsanaTask(context.payload)
		return task
	})

	app.on('issues.edited', async (context) => {
		/* Do something with edited issues. */
		console.dir('issue edited', context.payload.changes)
	})

	app.on('label', async (context) => {
		console.group('label event')
		console.dir(context.payload)
		const label = labelActions(context.payload)
		console.dir(label)
		console.groupEnd()
		return label
	})
}
