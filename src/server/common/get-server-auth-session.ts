// Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs

import type { GetServerSidePropsContext } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { authOptions as nextAuthOptions } from '../../pages/api/auth/[...nextauth]'

// Next API route example - /pages/api/restricted.ts
/**
 * It gets the session from the server and returns it
 * @param ctx - The context object passed to getServerSideProps
 * @returns The session object.
 */
export const getServerAuthSession = async (ctx: {
	req: GetServerSidePropsContext['req']
	res: GetServerSidePropsContext['res']
}) => {
	return await unstable_getServerSession(ctx.req, ctx.res, nextAuthOptions)
}
