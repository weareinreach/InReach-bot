import NextAuth, { type NextAuthOptions } from 'next-auth'
import SlackProvider from 'next-auth/providers/slack'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from 'util/prisma'
import { githubClient } from 'src/bots/github/index'
// import { asanaClient } from 'src/bots/asana'

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
				session.user.admin = user.admin as boolean
			}
			return session
		},
		async signIn({ account, user, profile }) {
			if (user.createdAt) return true
			switch (account?.provider) {
				case 'slack': {
					if (
						profile?.['https://slack.com/team_id'] ===
						process.env.SLACK_WORKSPACE_ID
					)
						return true
					break
				}
				case 'github': {
					const gh = githubClient
					const member = await gh.rest.orgs.getMembershipForUser({
						org: 'weareinreach',
						username: profile!.login,
					})
					if (member.status === 200) return true
					break
				}
				// case 'asanapr':
				// case 'asana': {
				// 	const asana = await asanaClient()
				// 	const asanauser = await asana.users.findById(profile?.sub as string)
				// 	if (
				// 		asanauser.workspaces.some(
				// 			(space) => space.gid === process.env.ASANA_WORKSPACE
				// 		)
				// 	)
				// 		return true
				// }

				default:
					return false
			}
			return false
		},
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	providers: [
		SlackProvider({
			clientId: process.env.SLACK_CLIENT_ID,
			clientSecret: process.env.SLACK_CLIENT_SECRET,
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
		{
			id: 'asana',
			name: 'Asana',
			type: 'oauth',
			wellKnown:
				'https://app.asana.com/api/1.0/.well-known/openid-configuration',
			clientId: process.env.ASANA_CLIENT_ID,
			clientSecret: process.env.ASANA_CLIENT_SECRET,
			authorization: { params: { scope: 'openid email profile default' } },
			idToken: true,
			checks: ['state'],
			profile(profile: AsanaProfile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
				}
			},
		},
		{
			id: 'asanapr',
			name: 'Asana PR',
			type: 'oauth',
			wellKnown:
				'https://app.asana.com/api/1.0/.well-known/openid-configuration',
			clientId: process.env.PRASANA_CLIENT_ID,
			clientSecret: process.env.PRASANA_CLIENT_SECRET,
			authorization: { params: { scope: 'openid email profile default' } },
			idToken: true,
			checks: ['state'],
			profile(profile: AsanaProfile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
				}
			},
		},
	],
}

type AsanaProfile = {
	sub: string
	name: string
	email: string
	picture: string
}

export default NextAuth(authOptions)
