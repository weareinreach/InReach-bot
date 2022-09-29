import { prisma } from 'util/prisma'
import { DateTime } from 'luxon'

export class prismaConvoStore {
	set(conversationId: string, value: any, expireMins: number) {
		console.log('convo set')
		const expireDate = DateTime.now().plus({ minutes: expireMins ?? 5 })

		// Returns a Promise
		return new Promise((resolve, reject) => {
			console.log(conversationId, value, expireDate)
			const convo = prisma.convoStore
				.upsert({
					where: {
						conversationId,
					},
					create: {
						conversationId,
						value,
						expiresAt: expireDate.toJSDate(),
					},
					update: {
						value,
						expiresAt: expireDate.toJSDate(),
					},
				})
				.then((result) => resolve(result))
				.catch((err) => reject(new Error(err)))
		})
	}

	get(conversationId: string) {
		// Returns a Promise
		console.log('convo get')
		return new Promise((resolve, reject) => {
			prisma.convoStore
				.findFirst({ where: { conversationId } })
				.then((result) => {
					if (result !== null) {
						console.log(
							DateTime.fromJSDate(result.expiresAt)
								.diffNow('seconds')
								.as('seconds')
						)
						if (
							DateTime.fromJSDate(result.expiresAt)
								.diffNow('seconds')
								.as('seconds') <= 0
						) {
							prisma.convoStore.delete({ where: { id: result.id } })
							reject(new Error('Conversation expired.'))
						}
						resolve(result.value)
					}
					reject(new Error('Conversation not found.'))
				})

			// 	db()
			// 		.ref('conversations/' + conversationId)
			// 		.once('value')
			// 		.then((result) => {
			// 			if (result !== undefined) {
			// 				if (
			// 					result.expiresAt !== undefined &&
			// 					Date.now() > result.expiresAt
			// 				) {
			// 					db()
			// 						.ref('conversations/' + conversationId)
			// 						.delete()

			// 					reject(new Error('Conversation expired'))
			// 				}
			// 				resolve(result.value)
			// 			} else {
			// 				// Conversation not found
			// 				reject(new Error('Conversation not found'))
			// 			}
			// 		})
			// })
		})
	}
}
