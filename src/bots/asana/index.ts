import asana from 'asana'
import { getToken } from 'util/getToken'
import { prisma } from 'util/prisma'

const actAsUser = async () => {
	const data = await prisma.user.findFirstOrThrow({
		where: {
			asanaActAs: true,
		},
		select: {
			accounts: {
				where: {
					provider: 'asana',
				},
				select: {
					providerAccountId: true,
				},
			},
		},
	})
	console.info(`actAsUser result: ${data.accounts[0]?.providerAccountId}`)
	return data.accounts[0]?.providerAccountId
}

/**
 * It takes a user token and returns an Asana client
 * @param {string} userToken - The user's access token.
 */
export const asanaClient = async (userToken?: string | null | undefined) => {
	if (!userToken) {
		const userId = await actAsUser()
		if (typeof userId !== 'string') throw 'No User'

		userToken = await getToken(userId)
		if (typeof userToken !== 'string') throw 'Token error'
	}
	const client = asana.Client.create().useAccessToken(userToken)
	return client
}
