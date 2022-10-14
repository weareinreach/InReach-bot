import {
	Badge,
	createStyles,
	Container,
	Group,
	Text,
	Tabs,
	Title,
	Select,
	Stack,
	Button,
	Space,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { trpc } from 'util/trpc'
import { useEffect } from 'react'
import { createAsanaWebhook } from 'src/bots/asana/createWebhook'

const useStyles = createStyles((theme) => ({
	header: {
		paddingTop: theme.spacing.sm,
		backgroundColor:
			theme.colorScheme === 'dark'
				? theme.colors.dark[6]
				: theme.colors.gray[0],
		borderBottom: `1px solid ${
			theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[2]
		}`,
		marginBottom: 120,
	},

	mainSection: {
		paddingBottom: theme.spacing.sm,
	},

	tabs: {
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},

	tabsList: {
		borderBottom: '0 !important',
	},

	tab: {
		fontWeight: 500,
		height: 38,
		backgroundColor: 'transparent',

		'&:hover': {
			backgroundColor:
				theme.colorScheme === 'dark'
					? theme.colors.dark[5]
					: theme.colors.gray[1],
		},

		'&[data-active]': {
			backgroundColor:
				theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
			borderColor:
				theme.colorScheme === 'dark'
					? theme.colors.dark[7]
					: theme.colors.gray[2],
		},
	},
	panel: {
		backgroundColor: 'white',
	},
	repoName: {
		textAlign: 'center',
	},
	repoGroup: {
		alignItems: 'center',
	},
	badgeHover: {
		'&:hover': {
			cursor: 'pointer',
		},
	},
	none: {},
}))

const Dashboard = () => {
	const { classes, theme, cx } = useStyles()
	const tabs = ['GitHub', 'Asana', 'Zoom']
	const { data: session } = useSession()
	const form = useForm<Record<string, string>>()
	const repos = trpc.github.getActiveRepos.useQuery()
	// const asanaWorkspace = trpc.asana.getWorkspaces.useQuery()
	const asanaProjects = trpc.asana.getProjects.useQuery()
	const asanaBoardMutation = trpc.github.attachAsanaBoard.useMutation()
	const asanaActiveProjects = trpc.asana.getActiveProjects.useQuery()
	const asanaWebhookCreate = trpc.asana.createWebhook.useMutation()

	const handleSubmit = () => {
		const ids = Object.keys(form.values)
		const schema = z.array(z.object({ repo: z.string(), asana: z.string() }))
		const data = ids.map((item) => {
			if (form.isTouched(item)) {
				const dataItem = form.values[item]
				if (typeof dataItem === 'string')
					return {
						repo: item,
						asana: dataItem,
					}
			}
			return null
		})
		const validated = schema.parse(data)
		if (data.length) asanaBoardMutation.mutate(validated)
	}

	const projectOptions = asanaProjects.isFetched
		? asanaProjects.data!.map((item) => ({
				value: item.gid,
				label: item.name,
		  }))
		: [{ value: '', label: '' }]

	const items = tabs.map((tab) => (
		<Tabs.Tab value={tab} key={tab}>
			{tab}
		</Tabs.Tab>
	))
	const repoList =
		repos.isFetched && repos.data
			? repos.data!.map((repo) => {
					return (
						<Group key={repo.id} className={classes.repoGroup}>
							<Text
								className={classes.repoName}
							>{`${repo.org.githubOwner}/${repo.repo}`}</Text>
							<Select
								data={projectOptions}
								placeholder='Select Asana Board'
								{...form.getInputProps(repo.id)}
							/>
						</Group>
					)
			  })
			: null

	const webhookStatus =
		asanaActiveProjects.data && asanaActiveProjects.isFetched
			? asanaActiveProjects.data?.map((item) => {
					const webhookExists = !!item.asanaWebhook?.webhookId
					return (
						<Group key={item.id}>
							<Badge
								color={webhookExists ? 'blue' : 'red'}
								size='lg'
								className={webhookExists ? classes.none : classes.badgeHover}
								onClick={
									webhookExists
										? undefined
										: () => asanaWebhookCreate.mutate(item.boardId)
								}
							>
								{webhookExists ? 'Active' : 'Activate'}
							</Badge>
							<Text>{`${item.boardId} - ${
								item.boardName ?? 'Board name missing'
							}`}</Text>
						</Group>
					)
			  })
			: null

	useEffect(() => {
		if (
			repos.isFetched &&
			asanaProjects.isFetched &&
			repos.data &&
			asanaProjects.data
		) {
			repos.data.forEach((item) =>
				item.asanaBoard?.boardId
					? form.setFieldValue(item.id, item.asanaBoard?.boardId)
					: null
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [repos.isFetched, asanaProjects.isFetched])

	return (
		<>
			<div className={classes.header}>
				<Container className={classes.mainSection}>
					<Title order={1}>InReach Bot Settings</Title>
				</Container>
			</div>
			<Container>
				<Container>
					<Title order={4}>Associate GitHub repo to Asana Board</Title>
					{repoList ? (
						<form onSubmit={form.onSubmit(() => handleSubmit())}>
							<Stack>{repoList}</Stack>
							<Button type='submit'>Save</Button>
						</form>
					) : null}
				</Container>
				<Space h='lg' />
				<Container>
					<Title order={4}>Asana Webhook Status</Title>
					{webhookStatus ? webhookStatus : null}
				</Container>
			</Container>
		</>
	)
}

export default Dashboard
