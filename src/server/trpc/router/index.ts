// src/server/trpc/router/index.ts
import { router } from '../trpc'
import { authRouter } from './auth'
import { githubRouter } from './github'
// import { asanaRouter } from './asana'

export const appRouter = router({
	github: githubRouter,
	// asana: asanaRouter,
	auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
