import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { prisma } from 'util/prisma'
import { asanaClient } from 'src/bots/asana'

export const asanaRouter = router({
	getProjects: protectedProcedure.query(async () => {
		const asana = await asanaClient()
		const { data } = await asana.projects.findAll({
			workspace: process.env.ASANA_WORKSPACE,
		})
		return data
	}),
	getWorkspaces: protectedProcedure.query(async () => {
		const asana = await asanaClient()
		const { data } = await asana.workspaces.findAll()
		return data
	}),
})
