import { prisma } from 'util/prisma'

/**
 * If the repo exists in the database, return true, otherwise return false.
 * @param owner - The owner of the repo
 * @param repo - The name of the repository
 * @returns A boolean
 */
export const isWatchedRepo = async (owner: string, repo: string) => {
	try {
		const result = await prisma.activeRepo.findFirstOrThrow({
			where: {
				repo: repo,
				org: {
					githubOwner: owner,
				},
			},
		})

		if (result) return true
	} catch (err) {
		return false
	}
}
