import axios from 'axios'
import { getUser } from './slackUtil/redis'

const ZOOM_API = 'https://api.zoom.us/v2'

const getAccessToken = async () => {
	const payloadUnencoded = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
	const authToken = Buffer.from(payloadUnencoded).toString('base64')
	const response = await axios.post<ZoomAuthResponse>(
		`https://zoom.us/oauth/token`,
		'',
		{
			headers: {
				Authorization: `Basic ${authToken}`,
			},
			params: {
				grant_type: 'account_credentials',
				account_id: process.env.ZOOM_ACCOUNT_ID,
			},
		}
	)
	console.log('Zoom token generated')
	return response.data.access_token
}

export const createInvite = async (userId: string, meetingId: string) => {
	try {
		const token = await getAccessToken()

		const invite = await axios.post<ZoomInviteResponse>(
			`${ZOOM_API}/meetings/${meetingId}/invite_links`,
			{
				attendees: [
					{
						name: userId,
					},
				],
				ttl: 300,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (invite.data.attendees.length) {
			return invite.data.attendees[0]?.join_url as string
		}
	} catch (err) {
		throw err
	}
}

export const getSSRInvite = async (id: string) => {
	try {
		const user = await getUser(id)
		if (!user) throw 'user404'

		return await createInvite(user, process.env.ZOOM_COWORKING_MEETING_ID)
	} catch (err) {
		if ((err = 'user404')) throw new Error('User not found')
	}
}

interface ZoomAuthResponse {
	access_token: string
	token_type: 'bearer'
	expire_in: number
	scope: string
}
interface ZoomInviteResponse {
	attendees: ZoomAttendees[]
	ttl: number
}
interface ZoomAttendees {
	name: string
	join_url: string
}
