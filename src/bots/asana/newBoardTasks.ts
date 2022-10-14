import { prisma } from 'util/prisma'
import { githubClient } from '../github'
import { getAsanaEnum, batchCreateAsanaEnum } from './customField'
import { convertColor } from 'util/colors'
import invariant from 'tiny-invariant'
import { AsanaLabel } from '@prisma/client'

/**
 * It takes a GitHub organization and repository name, fetches all the labels from GitHub, fetches all
 * the labels from Asana, creates any missing labels in Asana, and then updates the database with the
 * new labels
 * @param org - The organization name
 * @param repo - The name of the repository you want to sync labels from.
 * @returns An array of AsanaLabel objects
 */
export const syncLabels: SyncLabels = async (org, repo) => {
	const githubLabels = await githubClient.request(
		'GET /repos/{owner}/{repo}/labels',
		{
			owner: org,
			repo,
			per_page: 100,
		}
	)
	const asanaLabels = await getAsanaEnum()

	const asanaTransactions = githubLabels.data.flatMap((label) => {
		const labelExistsAsana = asanaLabels.some(
			(item) => item.name === label.name
		)
		if (labelExistsAsana) return []

		const labelColor = convertColor(label.color)
		invariant(labelColor, 'Color not found')
		return {
			color: labelColor,
			name: label.name,
		}
	})

	const asanaLabelUpdate = await batchCreateAsanaEnum(asanaTransactions)

	const pendingDbTrans = asanaLabelUpdate.flatMap((label) => {
		const { name, color, enabled, gid } = label
		const ghLabel = githubLabels.data.find((item) => item.name === name)
		if (ghLabel)
			return {
				name,
				color,
				gid,
				enabled,
				ghId: ghLabel.id,
			}
		return []
	})
	const dbTransactions = pendingDbTrans.map((label) => {
		const { name, color, enabled, gid, ghId } = label
		return prisma.asanaLabel.upsert({
			where: {
				ghId,
			},
			update: {
				name,
				color,
				enabled,
			},
			create: {
				name,
				color,
				ghId,
				gid,
				enabled,
			},
		})
	})
	const result = await prisma.$transaction(dbTransactions)
	return result
}

type SyncLabels = (
	org: string,
	repo: string
) => void | Promise<Array<AsanaLabel>>
