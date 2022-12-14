import { prisma } from './prisma'
import axios from 'axios'
import { baseUrl } from './baseUrl'
import { DateTime } from 'luxon'

/**
 * It gets the token from the database, checks if it's expired, and if it is, it refreshes it
 * @param userId - The user's ID from the provider.
 * @returns The access token for the user
 */
export const getToken = async (userId: string) => {
	const token = await prisma.account.findFirst({
		where: {
			providerAccountId: userId,
		},
	})
	if (token?.expires_at && DateTime.now().toSeconds() > token.expires_at) {
		switch (token.provider) {
			case 'asana':
				console.log('Refreshing Asana token...')
				const asanaRequest = await axios.post<AsanaResponse>(
					'https://app.asana.com/-/oauth_token',
					{},
					{
						params: {
							grant_type: 'refresh_token',
							client_id: process.env.ASANA_CLIENT_ID,
							client_secret: process.env.ASANA_CLIENT_SECRET,
							redirect_uri: `${baseUrl}/api/auth/callback/asana`,
							refresh_token: token.refresh_token,
						},
					}
				)
				if (asanaRequest.status !== 200)
					throw new Error(asanaRequest.statusText)
				const asanaUpdate = await prisma.account.update({
					where: {
						id: token.id,
					},
					data: {
						access_token: asanaRequest.data.access_token,
						expires_at: Math.floor(
							DateTime.now()
								.plus({ seconds: asanaRequest.data.expires_in })
								.toSeconds()
						),
						refresh_token: asanaRequest.data.refresh_token,
					},
				})

				return asanaUpdate.access_token
		}
	}

	return token!.access_token
}

// Generated by https://quicktype.io

export interface AsanaResponse {
	access_token: string
	expires_in: number
	token_type: string
	refresh_token: string
	data: Data
}

export interface Data {
	id: string
	name: string
	email: string
}
