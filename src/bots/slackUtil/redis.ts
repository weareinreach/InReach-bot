import { redis } from 'util/redis'

export const storeUser = async (uuid: string, user: string) => {
	console.log('storeUser')
	const res = await redis.set(uuid, user, { ex: 10 })
	console.log(res)
	return res
}
