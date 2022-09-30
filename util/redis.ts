// src/server/db/client.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
	url: process.env.REDIS_ENDPOINT,
	token: process.env.REDIS_PASSWORD,
})
