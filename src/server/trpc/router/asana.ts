import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
// import { asanaClient } from 'src/bots/asana'
// import { createAsanaWebhook } from 'src/bots/asana/createWebhook'

// export const asanaRouter = router({
// 	getProjects: protectedProcedure.query(async () => {
// 		const asana = await asanaClient()
// 		const { data } = await asana.projects.findAll({
// 			workspace: process.env.ASANA_WORKSPACE,
// 		})
// 		return data
// 	}),
// 	getWorkspaces: protectedProcedure.query(async () => {
// 		const asana = await asanaClient()
// 		const { data } = await asana.workspaces.findAll()
// 		return data
// 	}),
// 	getActiveProjects: protectedProcedure.query(async ({ ctx }) => {
// 		const projects = await ctx.prisma.asanaBoard.findMany({
// 			select: {
// 				id: true,
// 				boardId: true,
// 				boardName: true,
// 				asanaWebhook: { select: { webhookId: true } },
// 			},
// 		})

// 		return projects
// 	}),
// 	createWebhook: protectedProcedure
// 		.input(z.string())
// 		.mutation(async ({ input }) => {
// 			const webhook = await createAsanaWebhook(input)
// 			return webhook
// 		}),
// })
export {}
