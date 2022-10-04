import { getIssueList, getIssuesFromGH } from './getIssueData'
import { prisma } from 'util/prisma'
import { probot } from 'src/pages/api/github'
import { asanaClient } from '.'

// const getIssues = async (owner: string, repo: string) => {
// 	const gh = await probot.auth(parseInt(process.env.GITHUB_INSTALL_ID))
// 	const { data } = await gh.issues.listForRepo({
// 		owner,
// 		repo,
// 	})
// 	const attachedTicket = /<!--Asana:\d*-->/g
// 	const filteredIssues = data
// 		.filter(
// 			(x) =>
// 				x.pull_request === undefined && !attachedTicket.test(x.body as string)
// 		)
// 		.map((issue) => {
// 			return {
// 				owner: owner,
// 				repo: repo,
// 				number: issue.number,
// 				title: issue.title,
// 				body: issue.body,
// 			}
// 		})
// 	return filteredIssues
// }
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

// export const attachModal = async () => {
// 	const repos = await prisma.activeRepo.findMany({
// 		select: {
// 			repo: true,
// 			org: {
// 				select: { githubOwner: true },
// 			},
// 		},
// 	})

// 	const issues = await Promise.all(
// 		repos.map(async (result) => ({
// 			[`${result.org.githubOwner}/${result.repo}`]: await getIssuesFromGH(
// 				result.org.githubOwner,
// 				result.repo
// 			),
// 		}))
// 	).then((x) =>
// 		x.reduce(
// 			(prev, curr) => ({
// 				...prev,
// 				...curr,
// 			}),
// 			{}
// 		)
// 	)
// 	const dropOptions = Object.keys(issues).map((item) => ({
// 		id: item,
// 		label: item,
// 	}))
// 	console.log(dropOptions)

// 	return {
// 		template: 'form_metadata_v0',
// 		metadata: {
// 			title: 'GitHub Issues',
// 			submit_button_text: 'Submit',
// 			on_submit_callback:
// 				'https://3000.tunnel.joekarow.dev/api/asana/issue/submit',
// 			on_change_callback: `https://3000.tunnel.joekarow.dev/api/asana/issue/onchange?data=${JSON.stringify(
// 				issues
// 			)}`,
// 			fields: [
// 				createorAttach('attach'),
// 				{
// 					type: 'dropdown',
// 					id: 'repo',
// 					name: 'GitHub Repo',
// 					is_required: true,
// 					is_watched: true,
// 					options: dropOptions,
// 					width: 'half',
// 				},
// 				{
// 					type: 'dropdown',
// 					id: 'issue',
// 					name: 'GitHub Repo',
// 					is_required: true,
// 					options: [{ id: 'none', label: 'none' }],
// 					width: 'full',
// 				},
// 			],
// 		},
// 	}
// }
interface DropDownValues {
	id: string
	label: string
	icon_url?: string
}

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

export const createIssueModal = async (task: string) => {
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
					width: 'full',
				},

				{
					type: 'rich_text',
					id: 'body',
					name: 'Issue body',
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
