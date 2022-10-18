import { createNodeMiddleware } from 'probot'
import { githubBot, probot } from 'src/bots/github'
import { NextApiRequest, NextApiResponse } from 'next'
import { WebhookEventName } from '@octokit/webhooks-types'

const probotMiddleware = createNodeMiddleware(githubBot, {
	probot,
	webhooksPath: '/api/github',
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	probotMiddleware(req, res)
}

export default handler
