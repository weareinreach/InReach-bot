// src/server/db/client.ts
import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

export const prisma =
	global.prisma ||
	new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? // ? ['query', 'error', 'warn']
				  ['error', 'warn']
				: ['error'],
	})
prisma.$use(async (params, next) => {
	const before = Date.now()

	const result = await next(params)

	const after = Date.now()

	logger.info(`Query ${params.model}.${params.action} took ${after - before}ms`)

	return result
})

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
