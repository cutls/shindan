import { GetServerSideProps } from 'next'
import { getProviders, signIn } from 'next-auth/react'
import { Button, Container, Heading, Spinner } from '@chakra-ui/react'
import { FaGoogle } from 'react-icons/fa'
import Head from 'next/head'
import styles from '../../styles/Home.module.scss'
import { useSession } from 'next-auth/react'
import { IGoogleCredential } from '../../interfaces/credential'
import { useContext, useEffect, useState } from 'react'
import router from 'next/router'
import { setCookie } from 'nookies'
import { PageLoadingContext } from '../../utils/context'
const gcGuard = (item: any): item is IGoogleCredential => item && item.accessToken

export default function SignIn({ providers }: any) {
	const { data: session } = useSession()
	const { loading: pageLoading } = useContext(PageLoadingContext)
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		if (!gcGuard(session)) return setLoading(false)
		setLoading(true)
		setCookie(null, 'google', JSON.stringify(session), {
			maxAge: 60 * 60,
			path: '/'
		})

		setTimeout(() => {
			router.push('/my')
			setLoading(false)
		}, 500)
	}, [session])
	if (loading || pageLoading)
		return (
			<>
				<Head>
					<title>shindan - login(loading)</title>
				</Head>
				<Container centerContent className={styles.fullCenter}>
					<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
				</Container>
			</>
		)
	if (!providers) return <Heading>Error</Heading>
	return (
		<div>
			<Head>
				<title>shindan - login(continue)</title>
			</Head>
			<main>
				<Container centerContent className={styles.fullCenter}>
					<Heading>ログイン</Heading>
					<p>ログインを続行するためには下のボタンを押してください。</p>
					{Object.values(providers).map((provider: any) => (
						<Button colorScheme="teal" leftIcon={<FaGoogle />} onClick={() => signIn(provider.id)} key={provider.id}>
							Googleでログイン
						</Button>
					))}
					<p>ログインを完了されている場合は、しばらくお待ちください。</p>
				</Container>
			</main>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const providers = await getProviders()
	return {
		props: { providers },
	}
}
