import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import Menu from '../components/Menu'
import { Button, Divider, Flex, Heading, Link, Portal } from '@chakra-ui/react'
import { Credential } from '../interfaces/credential'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import router from 'next/router'
import NextLink from 'next/link'
import styles from '../styles/Home.module.scss'

const Home = (props: Credential) => {
	const [user, setUser] = useState(false)
	const [lastUsed, setLastUsed] = useState('')
	useEffect(() => {
		const lastUsed = window.localStorage.getItem('lastUsed')
		if (lastUsed) setLastUsed(lastUsed)
		const cks = parseCookies()
		if (cks.google) setUser(true)
		if (cks.google || cks.accessToken) return
		if (!cks.google && !cks.accessToken) router.push('/auth/login')
	}, [])
	return (
		<div>
			<Head>
				<title>shindan</title>
			</Head>
			<Flex flexWrap="wrap">
				<Menu isUser={user} />
				<div style={{ padding: 15 }}>
					<Heading>shindan.vercel.app</Heading>
				</div>
			</Flex>
			<div style={{ height: 15 }} />
			<Divider />
			<Portal>
				<p style={{ fontSize: 10, fontStyle: 'italic' }}>cutls 2022 [Next.js, TypeScript, Vercel]</p>
			</Portal>
		</div>
	)
}

export default Home
