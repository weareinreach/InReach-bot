export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			GITHUB_APP_ID: string
			GITHUB_PRIVATE_KEY: string
			WEBHOOK_SECRET: string
			GITHUB_CLIENT_ID: string
			GITHUB_CLIENT_SECRET: string
			GITHUB_INSTALL_ID: string
			ASANA_CLIENT_ID: string
			ASANA_CLIENT_SECRET: string
			ASANA_WORKSPACE: string
			ASANA_PAT: string
			SLACK_APP_ID: string
			SLACK_CLIENT_ID: string
			SLACK_CLIENT_SECRET: string
			SLACK_SIGNING_SECRET: string
			SLACK_BOT_TOKEN: string

			SLACKJR_APP_ID: string
			SLACKJR_CLIENT_ID: string
			SLACKJR_CLIENT_SECRET: string
			SLACKJR_SIGNING_SECRET: string
			SLACKJR_BOT_TOKEN: string

			CRON_API_KEY: string
			DATABASE_URL: string
			NEXTAUTH_SECRET: string
			NEXTAUTH_URL: string

			SLACK_COWORKING_CHANNEL_ID: string
			SLACKJR_COWORKING_CHANNEL_ID: string
			ZOOM_COWORKING_MEETING_ID: string
			ZOOM_WEBHOOK_AUTH: string
			ZOOM_MEETING_URL: string
			ZOOM_ACCOUNT_ID: string
			ZOOM_CLIENT_ID: string
			ZOOM_CLIENT_SECRET: string
			ZOOM_SECRET_TOKEN: string

			REDIS_ENDPOINT: string
			REDIS_PASSWORD: string

			BASE_URL: string

			NEXT_PUBLIC_SENTRY_DSN: string

			ASANA_WORKSPACE: string
			PRASANA_CLIENT_ID: string
			PRASANA_CLIENT_SECRET: string
			SLACK_WORKSPACE_ID: string

			NEW_RELIC_APP_NAME: string
			NEW_RELIC_LICENSE_KEY: string
			NEW_RELIC_ATTRIBUTES_EXCLUDE: string
		}
	}
}
