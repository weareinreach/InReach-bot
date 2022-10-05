import { prisma } from 'util/prisma'
import { DateTime } from 'luxon'
import type { CoworkAttendee } from '../slackUtil/redis'

/**
 * It finds a room by its uuid
 * @param {string} uuid - The unique identifier of the room you want to find.
 * @returns A room object
 */
export const findRoom = async (uuid: string) => {
	const room = await prisma.coworking.findFirst({
		where: {
			uuid,
		},
	})
	return room
}

/**
 * It creates a new room in the database
 * @param {string} uuid - The unique identifier for the room.
 * @param {string} threadTimestamp - The timestamp of the thread that the user is in.
 * @param {string} jrThreadTimestamp - The timestamp of the thread that the user is in with the Junior
 * @param {string} startTime - The time the room was created
 * @returns A room object
 */
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

/**
 * It updates the end time of a coworking room, and then deletes all the attendees
 * @param {string} uuid - The uuid of the room you want to end
 * @param {string} end_time - The time that the room should end.
 * @returns The updated room
 */
export const endRoom = async (uuid: string, end_time: string) => {
	const result = await prisma.coworking.update({
		where: { uuid },
		data: {
			endTime: DateTime.fromISO(end_time).toJSDate(),
		},
	})
	await prisma.coworkingAttendee.deleteMany()
	return result
}

/**
 * It takes a user object, and then it upserts that user into the database
 * @param {CoworkAttendee} user - CoworkAttendee
 * @returns The attendee object
 */
export const addAttendee = async (user: CoworkAttendee) => {
	const attendee = await prisma.coworkingAttendee.upsert({
		where: {
			slackId: user.id,
		},
		create: {
			slackId: user.id,
			slackOrgId: user.org,
			image:
				user.profile?.image_32 ?? `${process.env.VERCEL_URL}/inreach-sm.png`,
			name: user.profile!.display_name as string,
		},
		update: {
			slackOrgId: user.org,
			image:
				user.profile?.image_32 ?? `${process.env.VERCEL_URL}/inreach-sm.png`,
			name: user.profile!.display_name as string,
		},
	})
	return attendee
}

/**
 * It deletes all attendees with the name provided
 * @param {string} name - string
 * @returns The attendee that was deleted
 */
export const rmAttendee = async (name: string) => {
	const attendee = await prisma.coworkingAttendee.deleteMany({
		where: { name },
	})
	return attendee
}
