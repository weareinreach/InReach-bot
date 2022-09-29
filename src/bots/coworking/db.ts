import { prisma } from 'util/prisma'
import { DateTime } from 'luxon'

export const findRoom = async (uuid: string) => {
	const room = await prisma.coworking.findFirst({
		where: {
			uuid,
		},
	})
	return room
}

export const createRoom = async (
	uuid: string,
	threadTimestamp: string,
	jrThreadTimestamp: string,
	startTime: string
) => {
	const room = await prisma.coworking.create({
		data: {
			uuid,
			threadTimestamp,
			jrThreadTimestamp,
			startTime: DateTime.fromISO(startTime).toJSDate(),
		},
	})
	return room
}
export const endRoom = async (uuid: string, end_time: string) => {
	const result = await prisma.coworking.update({
		where: { uuid },
		data: {
			endTime: DateTime.fromISO(end_time).toJSDate(),
		},
	})
	return result
}
