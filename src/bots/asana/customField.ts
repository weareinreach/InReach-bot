import invariant from 'tiny-invariant'
import { prisma } from 'util/prisma'
import { asanaClient } from '.'
import { AsanaColors } from 'util/colors'
import { asanaBatch } from './batchTransaction'
import type { components as AsanaAPI } from 'types/asana-api'

/* The Asana GID for the "Github Labels" custom field */
export const ghLabelFieldGid = '1203169756518998'

export const sourceGitHubField = {
	fieldGid: '1203159428717046',
	optGid: '1203159428721265',
} as const

/**
 * It creates an Asana enum option for a custom field
 * @param props
 * @returns An Asana custom field member object
 */
export const createAsanaEnum: AsanaEnumCreate = async ({
	fieldGid = ghLabelFieldGid,
	color,
	name,
	enabled = true,
}) => {
	const asana = await asanaClient()
	const { data } = (await asana.dispatcher.post(
		`/custom_fields/${fieldGid}/enum_options`,
		{
			color,
			enabled,
			name,
		}
	)) as AsanaEnumResponse
	return data
}

/**
 * It takes an array of objects, each of which has a `fieldGid`, `color`, and `name` property, and
 * returns an array of objects, each of which has a `gid`, `resource_type`, `enabled`, `name`, and
 * `color` property
 * @param props - An array of objects that contain the following properties:
 */
export const batchCreateAsanaEnum: BatchAsanaEnumCreate = async (props) => {
	const queue = props.map((task) => {
		const { fieldGid = ghLabelFieldGid, color, name, enabled = true } = task
		return {
			data: { color, name },
			method: 'post',
			relativePath: `/custom_fields/${fieldGid}/enum_options`,
		}
	})
	const batchData = await asanaBatch(queue)
	const formattedData = batchData.map((result) => ({
		gid: result.body.data.gid,
		resource_type: result.body.data.resource_type,
		enabled: result.body.data.enabled,
		name: result.body.data.name,
		color: result.body.data.color,
	}))
	return formattedData
}

/**
 * It modifies an Asana enum option for a custom field
 * @param
 * @returns An Asana custom field member object
 */
export const modifyAsanaEnum: AsanaEnumMod = async ({
	enumGid,
	color,
	name,
	enabled = true,
}) => {
	const asana = await asanaClient()
	const { data } = (await asana.customFields.dispatchPut(
		`/enum_options/${enumGid}`,
		{
			color,
			name,
			enabled,
		}
	)) as AsanaEnumResponse
	return data
}

/**
 * It gets the custom field enum values from Asana
 * @returns An array of Asana custom field member objects
 */
export const getAsanaGhLabelsEnum: AsanaGetCustomField = async () => {
	const asana = await asanaClient()
	const { data } = (await asana.dispatcher.get(
		`/custom_fields/${ghLabelFieldGid}`
	)) as AsanaGetCustomFieldResponse
	invariant(data?.enum_options, 'No results')
	return data.enum_options
}

/**
 * It takes in a label object and either creates a new label or updates an existing one
 * @returns The label object
 */
export const upsertLabel = async ({
	ghId,
	name,
	color,
	gid,
	active = true,
}: UpsertLabelProps) => {
	const label = await prisma.asanaLabel.upsert({
		where: {
			ghId,
		},
		update: {
			name,
			color,
			enabled: active,
		},
		create: {
			name,
			color,
			ghId,
			gid,
			enabled: active,
		},
	})
	return label
}

type UpsertLabelProps = {
	/** Github item id */
	ghId: number
	/** Label name */
	name: string
	/** One of {@link AsanaColors} */
	color: AsanaColors | string
	/** The gid of the Asana label */
	gid: string
	/** Is this label active in Asana? */
	active?: boolean
}

interface AsanaEnumResponse {
	data: EnumObject
}
export interface EnumObject {
	gid: string
	resource_type: string
	color: AsanaColors
	enabled: boolean
	name: string
}
type AsanaEnumProps = {
	/** One of {@link AsanaColors} */
	color: string | AsanaColors
	/** Name of the label */
	name: string
	/** Is this label active in Asana? */
	enabled?: boolean
}
type AsanaCreateEnumProps = AsanaEnumProps & { fieldGid?: string }
type AsanaModEnumProps = AsanaEnumProps & { enumGid: string }

type AsanaEnumCreate = (props: AsanaCreateEnumProps) => Promise<EnumObject>
type BatchAsanaEnumCreate = (
	props: AsanaCreateEnumProps[]
) => Promise<EnumObject[]>
type AsanaEnumMod = (props: AsanaModEnumProps) => Promise<EnumObject>
export type AsanaGetCustomField = () => Promise<
	AsanaAPI['schemas']['EnumOption'][]
>

type LookupAsanaGhEnumId = (labelText: string) => Promise<EnumObject['gid']>

// Generated by https://quicktype.io

type AsanaGetCustomFieldResponse = AsanaAPI['schemas']['CustomFieldObject']

interface CustomField {
	gid: string
	resource_type: string
	created_by: CreatedBy
	currency_code: string
	custom_label: string
	custom_label_position: string
	date_value: DateValue
	description: string
	display_value: string
	enabled: boolean
	enum_options: EnumObject[]
	enum_value: EnumObject
	format: string
	has_notifications_enabled: boolean
	is_global_to_workspace: boolean
	multi_enum_values: EnumObject[]
	name: string
	number_value: number
	people_value: CreatedBy[]
	precision: number
	resource_subtype: string
	text_value: string
	type: string
}

interface CreatedBy {
	gid: string
	resource_type: string
	name: string
}

interface DateValue {
	date: string
	date_time: string
}

// Generated by https://quicktype.io

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
