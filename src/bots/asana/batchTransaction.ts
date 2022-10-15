import { asanaClient } from '../asana'
import type { EnumObject } from './customField'
import { z } from 'zod'

/**
 * It takes a list of lists of actions, and sends them to Asana in batches of 10
 * @param paginatedTransactions - An array of arrays of actions. Each array of
 * actions is a batch.
 * @returns An array of objects.
 */
export const runBatch = async (
	paginatedTransactions: AsanaBatchActionQueue
) => {
	const asana = await asanaClient()
	const batchResult = paginatedTransactions.map(async (set) => {
		const payload = {
			actions: set,
		}
		const { data } = await asana.dispatcher.post('/batch', payload)
		return data
	})

	const resultStep = await Promise.all(batchResult)
	const results = resultStep.flatMap((x) => x)
	return results
}

/**
 * It takes an array of AsanaAction objects, and returns an array of results
 * @param queue - Array<AsanaAction>
 * @returns An array of Datum objects
 */
export const asanaBatch = async (queue: AsanaActionQueue): Promise<Datum[]> => {
	zAsanaActionQueue.parse(queue)
	const paginatedTransactions: AsanaBatchActionQueue = []
	while (queue.length) {
		const set = queue.splice(0, 10) as AsanaBatch
		paginatedTransactions.push(set)
	}
	const results = await runBatch(paginatedTransactions)
	console.log('batch results')
	console.dir(results)
	return results
}

/**
 * Zod schemas & Typescript defs
 */
type AttachItem = z.infer<typeof zAttachItem>
const zAttachItem = z.object({
	name: z.string(),
	parent: z.string(),
})
type AttachUrl = z.infer<typeof zAttachUrl>
const zAttachUrl = zAttachItem.extend({
	resource_subtype: z.literal('external'),
	url: z.string(),
})

type AttachFile = z.infer<typeof zAttachFile>
const zAttachFile = zAttachItem.extend({
	resource_subtype: z.literal('asana_file_attachments'),
	file: z.string(),
})

type CustomEnum = z.infer<typeof zCustomEnum>
const zCustomEnum = z.object({
	color: z.string(),
	name: z.string(),
})

type Options = z.infer<typeof zOptions>
const zOptions = z.object({
	fields: z.array(z.string()),
	limit: z.number(),
})

export type AsanaAction = z.infer<typeof zAsanaAction>
export const zAsanaAction = z.object({
	data: z.union([zAttachFile, zAttachUrl, zCustomEnum]),
	method: z.union([
		z.literal('post'),
		z.literal('put'),
		z.literal('get'),
		z.literal('delete'),
	]),
	options: zOptions.optional(),
	relativePath: z.string(),
})

type AsanaActionQueue = z.infer<typeof zAsanaActionQueue>
const zAsanaActionQueue = z.array(zAsanaAction)
export const validActionQueue = (queue: any) =>
	zAsanaActionQueue.safeParse(queue).success
		? zAsanaActionQueue.parse(queue)
		: false

type AsanaBatch = z.infer<typeof zAsanaBatch>
const zAsanaBatch = zAsanaAction.array().max(10)

type AsanaBatchActionQueue = z.infer<typeof zAsanaBatchActionQueue>
const zAsanaBatchActionQueue = zAsanaBatch.array()

/**
 * Asana API Responses
 */

interface AsanaBatchResponse {
	data: Datum[]
}

interface Datum {
	body: Body
	headers: Headers
	status_code: number
}

interface Body {
	data: EnumObject
}

interface Headers {
	location?: string
	keys?: string[]
	as_tuples?: string[]
	empty?: boolean
	traversable_again?: boolean
}
