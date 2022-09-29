import { createNodeMiddleware, createProbot } from 'probot'
import { githubBot } from 'src/bots/github'

const probot = createProbot()

export default createNodeMiddleware(githubBot, {
	probot,
	webhooksPath: '/api/github',
})
