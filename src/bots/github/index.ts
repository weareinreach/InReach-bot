import { createProbot, Probot } from 'probot'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'
import { createAsanaTask } from './createAsanaTask'
import { isWatchedRepo } from './isWatchedRepo'
import { asanaBlockRegex } from 'util/regex'
import { labelActions } from './actions/label'
import { Prisma } from '@prisma/client'
import { linkPullRequest } from './actions/prLink'

export const probot = createProbot({
	overrides: {
		privateKey: Buffer.from(process.env.GITHUB_PRIVATE_KEY, 'base64').toString(
			'utf-8'
		),
		appId: process.env.GITHUB_APP_ID,
	},
})

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
	app.log('Probot loaded.')

	try {
		/* When an issue is opened, create an Asana ticket, if it's a watched Repo and a ticket has not already been created. */
		app.on('issues.opened', async (context) => {
			/* It's checking to see if the repo is watched. */
			if (!isWatchedRepo(context.payload)) return

			/* It's checking to see if the issue body contains the Asana block. */
			if (asanaBlockRegex.test(context.payload.issue.body ?? '')) {
				return
			}

			/* It's creating an Asana task. */
			const task = createAsanaTask(context.payload)
			return task
		})

		app.on('issues.edited', async (context) => {
			/* It's checking to see if the repo is watched. */
			if (!isWatchedRepo(context.payload)) return
			console.info('issue edited')

			console.dir(context.payload.changes)
			/* Do something with edited issues. */
		})

		app.on('label', async (context) => {
			/* It's checking to see if the repo is watched. */
			if (!isWatchedRepo(context.payload)) return
			console.info('label event')

			return await labelActions(context.payload)
		})
		app.on('pull_request', async (context) => {
			/* It's checking to see if the repo is watched. */
			if (!isWatchedRepo(context.payload)) return

			/* It's linking the PR to the Asana task. */
			await linkPullRequest(context)
		})
	} catch (err) {
		if (err instanceof Prisma.NotFoundError) {
			console.log('event for unmonitored repo')
		}
		console.error('github handler error')
		console.dir(err)
	}
}
