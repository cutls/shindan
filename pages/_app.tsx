import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { ChakraProvider, Progress } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { PageLoadingContext } from '../utils/context'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()
	const [pageLoading, setPageLoading] = useState(false)

	useEffect(() => {
		const handleStart = (url: string) => url !== router.asPath && setPageLoading(true)
		const handleComplete = () => setPageLoading(false)
		router.events.on('routeChangeStart', handleStart)
		router.events.on('routeChangeComplete', handleComplete)
		router.events.on('routeChangeError', handleComplete)
		return () => {
			router.events.off('routeChangeStart', handleStart)
			router.events.off('routeChangeComplete', handleComplete)
			router.events.off('routeChangeError', handleComplete)
		}
	})
	return (
		<ChakraProvider>
			<SessionProvider session={pageProps.session}>
				<PageLoadingContext.Provider value={{ loading: pageLoading }}>
					{pageLoading && <Progress size='xs' isIndeterminate style={{position: 'absolute', width: '100%'}} />}
					<Component {...pageProps} />
				</PageLoadingContext.Provider>
			</SessionProvider>
		</ChakraProvider>
	)
}

export default MyApp
