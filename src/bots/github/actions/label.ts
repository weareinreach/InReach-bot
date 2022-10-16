import type { LabelEvent } from '@octokit/webhooks-types'
import {
	upsertLabel,
	createAsanaEnum,
	modifyAsanaEnum,
} from 'src/bots/asana/customField'
import invariant from 'tiny-invariant'
import { convertColor } from 'util/colors'
import { prisma } from 'util/prisma'

/**
 * It takes a GitHub label event, and creates or updates an Asana enum based on the label's name and
 * color
 * @param payload - LabelEvent from Github
 * @returns The label created or updated
 */
export const labelActions = async (payload: LabelEvent) => {
	const { action, label } = payload
	const labelColor = convertColor(label.color)
	invariant(labelColor, 'Color not found')
	switch (action) {
		case 'created':
			const asanaLabelCreate = await createAsanaEnum({
				color: labelColor,
				name: label.name,
			})
			const labelCreated = await upsertLabel({
				ghId: label.id,
				name: label.name,
				color: labelColor,
				gid: asanaLabelCreate.gid,
			})
			return labelCreated

			break

		case 'edited':
		case 'deleted':
			const { gid: labelUpdateGid } = await prisma.asanaLabel.findUniqueOrThrow(
				{
					where: {
						ghId: label.id,
					},
					select: {
						gid: true,
					},
				}
			)
			const asanaLabelUpdate = await modifyAsanaEnum({
				enumGid: labelUpdateGid,
				color: labelColor,
				name: label.name,
				enabled: action === 'edited',
			})
			const labelUpdated = upsertLabel({
				color: asanaLabelUpdate.color,
				ghId: label.id,
				gid: asanaLabelUpdate.gid,
				name: asanaLabelUpdate.name,
				active: asanaLabelUpdate.enabled,
			})
			return labelUpdated

			break
	}
}
