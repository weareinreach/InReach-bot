import { createNodeMiddleware, createProbot } from 'probot'
import { githubBot } from 'src/bots/github'

export const probot = createProbot({
	overrides: {
		privateKey: Buffer.from(
			process.env.GITHUB_PRIVATE_KEY,
			'base64'
		).toString(),
		appId: process.env.GITHUB_APP_ID,
	},
})

export default createNodeMiddleware(githubBot, {
	probot,
	webhooksPath: '/api/github',
})
