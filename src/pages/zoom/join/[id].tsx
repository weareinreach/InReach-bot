import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query'
import { getSSRInvite } from 'src/bots/zoom'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { logger } from 'util/logger'

const fetchLink = async (id: string) => {
	try {
		const { data } = await axios.get<{ user: string }>(`/api/zoom/${id}`)
		return data.user
	} catch (err) {
		logger.error(err)
		throw err
	}
}

const JoinZoom = () => {
	const router = useRouter()
	const id = router.query.id as string
	const { data, isError, isLoading, isSuccess, error } = useQuery(
		['coworker', id],
		() => fetchLink(id),
		{
			refetchOnWindowFocus: false,
		}
	)
	const [redirectTime, setRedirectTime] = useState(3)
	useEffect(() => {
		if (data && isSuccess) {
			if (redirectTime == 0) {
				router.push(data)
				return
			}

			setTimeout(() => {
				setRedirectTime((redirectTime) => redirectTime - 1)
			}, 1000)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [redirectTime, data, isSuccess])

	if (isLoading) return <div>Loading Meeting...</div>
	if (isError) {
		logger.error(error)
		return <div>An error occurred!</div>
	}
	if (isSuccess) return <div>Joining Meeting in {redirectTime} seconds...</div>
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { req, res, params } = ctx
	const id = params?.id ?? ''
	const queryClient = new QueryClient()

	if (!id || typeof id !== 'string') return { notFound: true }

	await queryClient.prefetchQuery(['coworker', id], () => getSSRInvite(id))

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
		},
	}
}

export default JoinZoom
