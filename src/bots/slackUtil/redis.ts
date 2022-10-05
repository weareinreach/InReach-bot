import { redis } from 'util/redis'
import type { UsersProfileGetResponse } from '@slack/web-api'
import axios from 'axios'

export const storeUser = async (uuid: string, user: string) => {
	const res = await redis.set(uuid, user, { ex: 10 })
	return res
}
export const getUser = async (uuid: string) => {
	const user = await redis.get<string>(uuid)
	return user
}

export const storeAttendee = async (
	display_name: string,
	userObj: CoworkAttendee
) => {
	const res = await redis.set(display_name, userObj, { ex: 120 })
	return res
}

export const getAttendee = async (display_name: string) => {
	const res = await redis.get<CoworkAttendee>(display_name)
	return res
}

export interface CoworkAttendee {
	id: string
	org: string
	profile: UsersProfileGetResponse['profile']
}
