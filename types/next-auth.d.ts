import { Prisma } from '@prisma/client'
import { DefaultSession, User } from 'next-auth'

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
}
interface User {
	admin: boolean
	id: string
	name: string
	image: string
	email: string
}
