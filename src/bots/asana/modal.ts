import { getIssueList } from './getIssueData'
import { prisma } from 'util/prisma'
import type { OnChangeBody } from 'src/pages/api/asana/issue/onchange'
import { asanaClient } from '.'
/**
 * It returns a radio button field with two options, one for creating a new issue and one for attaching
 * an existing issue
 * @param {'create' | 'attach'} [selected] - The default value for the radio button.
 */
const createorAttach = (selected?: 'create' | 'attach') => ({
	type: 'radio_button',
	id: 'create',
	name: 'Create new issue or attach existing?',
	value: selected ?? '0',
	is_watched: true,
	is_required: true,
	options: [
		{
			id: 'create',
			label: 'Create new GitHub Issue',
		},
		{
			id: 'attach',
			label: 'Attach existing GitHub Issue',
		},
	],
})

/* Creating a modal that will be displayed to the user. */
export const firstModal = {
	template: 'form_metadata_v0',
	metadata: {
		title: 'Associate GitHub Issue',
		submit_button_text: 'Submit',
		on_submit_callback:
			'https://3000.tunnel.joekarow.dev/api/asana/issue/attach',
		on_change_callback: `https://3000.tunnel.joekarow.dev/api/asana/issue/onchange`,
		fields: [createorAttach()],
		is_required: true,
	},
}

interface DropDownValues {
	id: string
	label: string
	icon_url?: string
}

/**
 * It returns an object that contains a template and metadata. The metadata contains the title, submit
 * button text, and a list of fields. The fields are a dropdown of repos, and if a repo is selected, a
 * dropdown of issues
 * @param [repo] - The name of the repo to pre-select in the dropdown.
 * @returns An object with a template and metadata property.
 */
export const attachModal = async (repo?: string) => {
	const issues = await getIssueList()

	const repoList = Object.keys(issues).map((item) => ({
		id: item,
		label: item,
	}))

	let issueList: DropDownValues[] = []
	if (typeof repo === 'string') {
		if (issues[repo]!.length === 0) return
		issueList = issues[repo]!.map((item) => {
			const labelText = `#${item.number} - ${item.title}`
			const issueId = `${item.owner},${item.repo},${item.number}`
			return {
				id: issueId,
				label: labelText.substring(0, 80),
			}
		})
	}
	const issuePassthru = encodeURIComponent(JSON.stringify(issues))

	const modalFields = []
	modalFields.push({
		type: 'dropdown',
		id: 'repo',
		name: 'GitHub Repo',
		is_required: true,
		is_watched: true,
		options: repoList,
		width: 'half',
		value: repo ? repo : '',
	})
	if (repo && issueList.length !== 0)
		modalFields.push({
			type: 'dropdown',
			id: 'issue',
			name: 'GitHub Issue',
			is_required: true,
			options: issueList,
			width: 'full',
		})

	// console.log(modalFields)
	return {
		template: 'form_metadata_v0',
		metadata: {
			title: 'Associate GitHub Issue',
			submit_button_text: 'Submit',
			on_submit_callback:
				'https://3000.tunnel.joekarow.dev/api/asana/issue/attach',
			on_change_callback: `https://3000.tunnel.joekarow.dev/api/asana/issue/onchange?ghIssues=${issuePassthru}`,
			fields: [createorAttach('attach'), ...modalFields],
			is_required: true,
		},
	}
}

/**
 * It creates a modal that allows you to create a GitHub issue from an Asana task
 * @param taskData - OnChangeBody
 * @returns An object with a template and metadata
 */
export const createIssueModal = async (taskData: OnChangeBody) => {
	const asana = await asanaClient()
	const task = await asana.tasks.getTask(taskData.task)

	const repos = await prisma.activeRepo.findMany({
		select: {
			repo: true,
			org: {
				select: { githubOwner: true },
			},
		},
	})
	const repoOptions = repos.map((repo) => ({
		id: `${repo.org.githubOwner}/${repo.repo}`,
		label: `${repo.org.githubOwner}/${repo.repo}`,
	}))

	return {
		template: 'form_metadata_v0',
		metadata: {
			title: 'GitHub Issues',
			submit_button_text: 'Submit',
			on_submit_callback:
				'https://3000.tunnel.joekarow.dev/api/asana/issue/create',
			on_change_callback: `https://3000.tunnel.joekarow.dev/api/asana/issue/onchange`,
			fields: [
				createorAttach('create'),
				{
					type: 'dropdown',
					id: 'repo',
					name: 'GitHub Repo',
					is_required: true,
					options: repoOptions,
					width: 'full',
				},
				{
					type: 'single_line_text',
					id: 'title',
					name: 'Issue Title',
					is_required: true,
					placeholder: 'Type something...',
					value: task.name,
					width: 'full',
				},

				{
					type: 'rich_text',
					id: 'body',
					name: 'Issue body',
					value: task.notes,
					is_required: false,
				},
				{
					type: 'dropdown',
					id: 'labelsType',
					name: 'Type',
					is_required: false,
					width: 'half',
					options: [
						{
							id: 'bugfix',
							label: 'Bug Fix',
						},
						{
							id: 'new-feature',
							label: 'New Feature',
						},
						{
							id: 'refactor',
							label: 'Refactor code',
						},
					],
				},
				{
					type: 'dropdown',
					id: 'labelsPriority',
					name: 'Priority',
					is_required: false,
					width: 'half',
					options: [
						{
							id: 'priority-low',
							label: 'Low',
						},
						{
							id: 'priority-medium',
							label: 'Medium',
						},
						{
							id: 'priority-high',
							label: 'High',
						},
						{
							id: 'priority-critical',
							label: 'Critical',
						},
					],
				},
			],
		},
	}
}
