import asana from 'asana'
import { z } from 'zod'
import { asanaClient } from '.'
import { asanaBatch, AttachmentItem, AttachmentList } from './batchTransaction'

export const attachItem = async (
	attachment: AttachmentProps
): Promise<AttachResponse> => {
	const asana = await asanaClient()
	const { parent, name, resource_subtype } = attachment
	const item =
		resource_subtype === 'external'
			? { url: attachment.url }
			: { file: attachment.file }

	return await asana.dispatcher.post('/attachments/', {
		parent,
		name,
		resource_subtype,
		...item,
	})
}

/**
 * It takes a task ID, and returns a list of attachments for that task
 * @param gid - The gid of the task you want to get the attachments for
 * @returns An array of AttachmentItem objects
 */
export const getAttachments = async (
	gid: string
): Promise<AttachmentItem[]> => {
	const asana = await asanaClient()
	const { data: attachList } = (await asana.dispatcher.get('/attachments', {
		parent: gid,
	})) as { data: AttachmentList }
	console.log(attachList)
	const attachDetails = await Promise.all(
		await asanaBatch<AttachmentItem>(
			attachList.map((attachment) => ({
				method: 'get' as const,
				relativePath: `/attachments/${attachment.gid}`,
			}))
		)
	)

	const results = attachDetails.map((item) => item.body.data)

	return results
}

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

type AttachmentProps = z.infer<typeof zAttachmentProps>
const zAttachmentProps = z.union([zAttachFile, zAttachUrl])

interface AttachResponse {
	data: Data
}

interface Data {
	gid: string
	resource_type: string
	name: string
	resource_subtype: string
	created_at: string
	download_url: string
	host: string
	parent: Parent
	permanent_url: string
	size: number
	view_url: string
}

interface Parent {
	gid: string
	resource_type: string
	name: string
	resource_subtype: string
}
