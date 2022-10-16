import NextAuth, { type NextAuthOptions } from 'next-auth'
import SlackProvider from 'next-auth/providers/slack'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from 'util/prisma'

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
