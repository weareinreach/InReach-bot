import { createNodeMiddleware, createProbot } from 'probot'
import { githubBot } from '../../../bots'

const probot = createProbot()

export default createNodeMiddleware(githubBot, {
	probot,
	webhooksPath: '/api/github',
})
