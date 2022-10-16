import { asanaClient } from '../asana'
import { z } from 'zod'
import { AsanaColors } from 'util/colors'

/**
 * It takes a list of lists of actions, and sends them to Asana in batches of 10
 * @param paginatedTransactions - An array of arrays of actions. Each array of
 * actions is a batch.
 * @returns An array of objects.
 */
const runBatch = async (paginatedTransactions: AsanaBatchActionQueue) => {
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
export const asanaBatch = async <T extends ReturnTypes>(
	queue: AsanaActionQueue
): Promise<Array<ItemResponse<T>>> => {
	zAsanaActionQueue.parse(queue)
	console.info(`Asana batch transactions to process: ${queue.length}`)
	const paginatedTransactions: AsanaBatchActionQueue = []
	while (queue.length) {
		const set = queue.splice(0, 10) as AsanaBatch
		paginatedTransactions.push(set)
	}
	const results = await runBatch(paginatedTransactions)
	return results
}

/**
 * Zod schemas & Typescript defs
 */

type ListAttachments = z.infer<typeof zListAttachments>
const zListAttachments = z.object({
	parent: z.string(),
})

type CustomEnum = z.infer<typeof zCustomEnum>
const zCustomEnum = z.object({
	color: z.string(),
	name: z.string(),
})

type Options = z.infer<typeof zOptions>
const zOptions = z.object({
	fields: z.array(z.string()).optional(),
	limit: z.number().optional(),
})

const zData = z.union([zCustomEnum, zListAttachments])
const zAsanaActionDataReq = z.object({
	data: zData,
	method: z.union([z.literal('post'), z.literal('put')]),
	options: zOptions.optional(),
	relativePath: z.string(),
})
const zAsanaActionDataOpt = z.object({
	data: zData.optional(),
	method: z.union([z.literal('get'), z.literal('delete')]),
	options: zOptions.optional(),
	relativePath: z.string(),
})

export type AsanaAction = z.infer<typeof zAsanaAction>
export const zAsanaAction = z.union([zAsanaActionDataReq, zAsanaActionDataOpt])

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

interface ItemResponse<T> {
	body: Body<T>
	headers: Headers
	status_code: number
}

interface Body<T> {
	data: T
}

type ReturnTypes = EnumObject | AttachmentList | AttachmentItem | AsanaTask

export interface EnumObject {
	gid: string
	resource_type: string
	color: AsanaColors
	enabled: boolean
	name: string
}

export interface AttachmentList
	extends Array<
		Pick<AttachmentItem, 'gid' | 'resource_type' | 'name' | 'resource_subtype'>
	> {}

export interface AttachmentItem {
	gid: string
	created_at: Date
	download_url: string | null
	host: string
	name: string
	parent: Parent
	permanent_url: string
	resource_type: string
	resource_subtype: string
	view_url: string
}

interface Parent {
	gid: string
	name: string
	resource_type: string
	resource_subtype: string
}

interface Headers {
	location?: string
	keys?: string[]
	as_tuples?: string[]
	empty?: boolean
	traversable_again?: boolean
}

export interface AsanaTask {
	gid: string
	resource_type: string
	approval_status: string
	assignee_status: string
	completed: boolean
	completed_at: string
	completed_by: Assignee
	created_at: string
	dependencies: Dependen[]
	dependents: Dependen[]
	due_at: string
	due_on: string
	external: External
	hearted: boolean
	hearts: Heart[]
	html_notes: string
	is_rendered_as_separator: boolean
	liked: boolean
	likes: Heart[]
	memberships: Membership[]
	modified_at: string
	name: string
	notes: string
	num_hearts: number
	num_likes: number
	num_subtasks: number
	resource_subtype: string
	start_at: string
	start_on: string
	assignee: Assignee
	assignee_section: Assignee
	custom_fields: CustomField[]
	followers: Assignee[]
	parent: Assignee
	permalink_url: string
	projects: Assignee[]
	tags: Tag[]
	workspace: Assignee
}

interface Assignee {
	gid: string
	resource_type: string
	name: string
	resource_subtype?: string
}

interface CustomField {
	gid: string
	resource_type: string
	created_by: Assignee
	currency_code: string
	custom_label: string
	custom_label_position: string
	date_value: DateValue
	description: string
	display_value: string
	enabled: boolean
	enum_options: EnumValue[]
	enum_value: EnumValue
	format: string
	has_notifications_enabled: boolean
	is_global_to_workspace: boolean
	multi_enum_values: EnumValue[]
	name: string
	number_value: number
	people_value: Assignee[]
	precision: number
	resource_subtype: string
	text_value: string
	type: string
}

interface DateValue {
	date: string
	date_time: string
}

interface EnumValue {
	gid: string
	resource_type: string
	color: string
	enabled: boolean
	name: string
}

interface Dependen {
	gid: string
	resource_type: string
}

interface External {
	data: string
	gid: string
}

interface Heart {
	gid: string
	user: Assignee
}

interface Membership {
	project: Assignee
	section: Assignee
}

interface Tag {
	gid: string
	name: string
}
