import '../styles/globals.css'
import type { AppType } from 'next/dist/shared/lib/utils'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useState } from 'react'
import {
	Hydrate,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const MyApp: AppType<{ session: Session | null; dehydratedState: unknown }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } })
	)

	return (
		<SessionProvider session={session}>
			<QueryClientProvider client={queryClient}>
				<Hydrate state={pageProps.dehydratedState}>
					<Component {...pageProps} />
				</Hydrate>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</SessionProvider>
	)
}

export default MyApp
