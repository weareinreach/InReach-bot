import { Probot } from 'probot'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'

/* Creating a new Octokit client with the appId, privateKey, and installationId. */
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

export const githubBot = (app: Probot) => {
	app.on('issues.opened', async (context) => {
		const issueComment = context.issue({
			body: 'Thanks for opening this issue!',
		})
		// await context.octokit.issues.createComment(issueComment)
	})
	app.on('issues.edited', async (context) => {
		console.log('issue edited')
		console.log(context.payload.changes)
	})
	// For more information on building apps:
	// https://probot.github.io/docs/

	// To get your app running against GitHub, see:
	// https://probot.github.io/docs/development/
}
