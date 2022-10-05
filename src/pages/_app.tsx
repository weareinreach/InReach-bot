import '../styles/globals.css'
import type { AppType } from 'next/dist/shared/lib/utils'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import React, { useState, useEffect } from 'react'
import {
	Hydrate,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const ReactQueryDevtoolsProduction = React.lazy(() =>
	import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(
		(d) => ({
			default: d.ReactQueryDevtools,
		})
	)
)

const MyApp: AppType<{ session: Session | null; dehydratedState: unknown }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } })
	)
	const [showDevtools, setShowDevtools] = useState(false)
	useEffect(() => {
		// @ts-ignore
		window.toggleDevtools = () => setShowDevtools((old) => !old)
	}, [])

	return (
		<SessionProvider session={session}>
			<QueryClientProvider client={queryClient}>
				<Hydrate state={pageProps.dehydratedState}>
					<Component {...pageProps} />
				</Hydrate>
				<ReactQueryDevtools initialIsOpen={false} />
				{showDevtools && (
					<React.Suspense fallback={null}>
						<ReactQueryDevtoolsProduction />
					</React.Suspense>
				)}
			</QueryClientProvider>
		</SessionProvider>
	)
}

export default MyApp
