import axios from 'axios'

const cronApi = 'https://api.cron-job.org'
const cronAuth = `Bearer ${process.env.CRON_API_KEY}`

export const createJob = () => {
	const payload = {
		job: {
			url: '',
			enabled: true,
			saveResponses: false,
			schedule: {
				timezone: 'UTC',
			},
		},
	}

	axios.put(`${cronApi}/jobs`, payload, {
		headers: {
			Authorization: cronAuth,
		},
	})
}
