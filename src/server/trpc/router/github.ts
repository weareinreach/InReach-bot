import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import ObjectID from 'bson-objectid'

export const githubRouter = router({
	getActiveRepos: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.activeRepo.findMany({
			include: {
				org: true,
				asanaBoard: true,
			},
		})
	}),
	attachAsanaBoard: protectedProcedure
		.input(z.array(z.object({ repo: z.string(), asana: z.string() })))
		.mutation(async ({ ctx, input }) => {
			const payload = input.map((item) =>
				ctx.prisma.activeRepo.update({
					where: { id: item.repo },
					data: {
						asanaBoard: {
							connectOrCreate: {
								where: {
									boardId: item.asana,
								},
								create: {
									boardId: item.asana,
								},
							},
						},
					},
				})
			)
			const results = await ctx.prisma.$transaction(payload)
			return results
		}),
})
