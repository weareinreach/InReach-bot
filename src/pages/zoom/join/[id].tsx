import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { getUser } from 'src/bots/slackUtil/redis'
import { createSignature, matchSignature } from 'util/crypto'

const fetchUser = async (id: string) => {
	try {
		console.info('fetchUser fired')
		const { data } = await axios.get<{ user: string }>(
			`/api/util/user/get/${id}`
		)
		console.log('fetchuser', data)
		return data.user
	} catch (err) {
		console.error(err)
		throw err
	}
}

const fetchLink = async (name: string) => {
	try {
		console.info('fetchLink fired')
		const { data, status, statusText } = await axios.get<{ link: string }>(
			`/api/zoom/${encodeURIComponent(name)}`
		)
		console.log('fetchlink', data)
		return data.link
	} catch (err) {
		throw new Error(typeof err === 'string' ? err : JSON.stringify(err))
	}
}

const JoinZoom = () => {
	const router = useRouter()
	const id = router.query.id as string
	const { data: user } = useQuery(['coworker', id], () => fetchUser(id), {
		refetchOnWindowFocus: false,
	})

	const { data, isError, isLoading, isSuccess, error } = useQuery(
		['coworker', id, 'link'],
		() => fetchLink(user as string),
		{
			refetchOnWindowFocus: false,
			enabled: !!user,
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
				console.log(redirectTime)
				setRedirectTime((redirectTime) => redirectTime - 1)
			}, 1000)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [redirectTime, data, isSuccess])

	if (isLoading) return <div>Loading Meeting...</div>
	if (isError) {
		console.error(error)
		return (
			<>
				<div>An error occurred!</div>
			</>
		)
	}
	if (isSuccess) return <div>Joining Meeting in {redirectTime} seconds...</div>
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { req, res, params } = ctx
	const id = params?.id ?? ''
	const queryClient = new QueryClient()

	if (!id || typeof id !== 'string') return { notFound: true }

	await queryClient.prefetchQuery(['coworker', id], () => getUser(id), {
		staleTime: 10 * 1000,
	})

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
		},
	}
}

export default JoinZoom
