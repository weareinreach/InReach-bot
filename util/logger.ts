// import { createLogger, transports, format } from 'winston'

// export const logger = createLogger({
// 	transports: [
// 		new transports.Console({
// 			format: format.simple(),
// 		}),
// 	],
// })

import pino from 'pino'

export const logger = pino({
	transport: {
		target: 'pino-pretty',
		options: { colorize: true, levelFirst: true },
	},
	base: {
		env: process.env.NODE_ENV,
		revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
	},
})
