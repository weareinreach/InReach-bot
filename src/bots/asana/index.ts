import asana from 'asana'
import { getToken } from 'util/getToken'
import { prisma } from 'util/prisma'

/**
 * It finds the first user with the `asanaActAs` flag set to `true`, and returns the
 * `providerAccountId` of the first Asana account associated with that user
 * @returns The providerAccountId of the user with the asanaActAs flag set to true.
 */
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
	return data.accounts[0]?.providerAccountId
}

/**
 * It returns an Asana client object that can be used to make requests to the Asana API
 * @param [userToken] - The user's Asana access token. If not provided, the
 * function will attempt to get the token from the database.
 * @returns A function that returns a promise that resolves to an Asana client.
 */
export const asanaClient = async (userToken?: string | null | undefined) => {
	if (!userToken) {
		const userId = await actAsUser()
		if (typeof userId !== 'string') throw 'No User'

		userToken = await getToken(userId)
		if (typeof userToken !== 'string') throw 'Token error'
	}
	// const client = asana.Client.create({
	// 	defaultHeaders: {
	// 		'Asana-Enable': 'new_user_task_lists new_project_templates',
	// 	},
	// }).useAccessToken(userToken)
	const oauth = asana.Client.create({
		clientId: process.env.ASANA_CLIENT_ID,
		clientSecret: process.env.ASANA_CLIENT_SECRET,
		redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/asana`,
		defaultHeaders: {
			'Asana-Disable': 'new_user_task_lists,new_project_templates',
		},
	})
	const client = oauth.useOauth({ credentials: userToken })
	return client
}
