import { Prisma } from '@prisma/client'
import { DefaultSession, DefaultUser, User } from 'next-auth'
import type { GithubProfile } from 'next-auth/providers/github'
import type { SlackProfile } from 'next-auth/providers/slack'

declare module 'next-auth' {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user?: {
			id: string
			admin: boolean
		} & DefaultSession['user']
	}
	interface User extends DefaultUser {
		admin?: boolean
		asanaActAs?: boolean
		createdAt?: Date
		updatedAt?: Date
	}
	interface Profile extends AsanaProfile, SlackProfile, GithubProfile {
		sub?: string
		name?: string
		email?: string
		picture?: string
	}
	interface AsanaProfile {}
}
