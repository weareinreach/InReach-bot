import NextAuth, { type NextAuthOptions } from 'next-auth'
import SlackProvider from 'next-auth/providers/slack'
import { prisma } from 'util/prisma'

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'

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
			clientId: process.env.SLACK_CLIENT_ID as string,
			clientSecret: process.env.SLACK_CLIENT_SECRET as string,
		}),
	],
}

export default NextAuth(authOptions)
