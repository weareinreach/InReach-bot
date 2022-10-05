import asana from 'asana'

/**
 * It takes a user token and returns an Asana client
 * @param {string} userToken - The user's access token.
 */
export const asanaClient = (userToken: string) =>
	asana.Client.create().useAccessToken(userToken)
