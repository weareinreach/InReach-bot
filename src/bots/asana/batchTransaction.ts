import { asanaClient } from '../asana'
import type { EnumObject } from './customField'

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
export const asanaBatch = async (
	queue: Array<AsanaAction>
): Promise<Datum[]> => {
	const paginatedTransactions: AsanaBatchActionQueue = []
	while (queue.length) {
		const set = queue.splice(0, 10) as AsanaBatch
		paginatedTransactions.push(set)
	}
	let i = 1
	const results = await runBatch(paginatedTransactions)
	return results
}

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

/** Contains up to 10 {@link AsanaAction}s */
type AsanaBatch = [
	AsanaAction,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?,
	AsanaAction?
]

/** Array of {@link AsanaBatch}es. */
type AsanaBatchActionQueue = Array<AsanaBatch>

interface AsanaAction {
	data: CreateCustomEnum
	method: 'post' | 'put' | 'get' | 'delete' | string
	options?: Options
	relativePath: string
}

interface CreateCustomEnum {
	color: string
	name: string
}

interface Options {
	fields: string[]
	limit: number
}
