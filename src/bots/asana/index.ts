import asana from 'asana'

export const asanaClient = asana.Client.create({
	clientId: process.env.ASANA_CLIENT_ID,
	clientSecret: process.env.ASANA_CLIENT_SECRET,
})
