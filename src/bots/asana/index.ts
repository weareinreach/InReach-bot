import asana from 'asana'

// export const asanaClient = asana.Client.create({
// 	clientId: process.env.ASANA_CLIENT_ID,
// 	clientSecret: process.env.ASANA_CLIENT_SECRET,
// 	redirectUri: `${process.env.VERCEL_URL}/api/asana/oauth`,
// })
export const asanaClient = asana.Client.create().useAccessToken(
	process.env.ASANA_PAT
)
