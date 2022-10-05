import NextAuth, { type NextAuthOptions } from 'next-auth'
import SlackProvider from 'next-auth/providers/slack'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from 'util/prisma'

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { profileEnd } from 'console'

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
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
			profile(profile) {
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

export default NextAuth(authOptions)
