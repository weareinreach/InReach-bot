import axios from 'axios'

const ZOOM_API = 'https://api.zoom.us/v2'

const getAccessToken = async () => {
	const payloadUnencoded = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
	const authToken = Buffer.from(payloadUnencoded).toString('base64')
	const { data } = await axios.post<ZoomAuthResponse>(
		`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
		'',
		{
			headers: {
				Authorization: `Basic ${authToken}`,
			},
		}
	)
	console.log('Zoom token generated')
	return data.access_token
}

export const createInvite = async (userId: string, meetingId: string) => {
	const token = await getAccessToken()

	const { data } = await axios.post<ZoomInviteResponse>(
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
	if (data.attendees.length) {
		return data.attendees[0]?.join_url
	} else throw new Error(JSON.stringify(data, null, 2))
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
