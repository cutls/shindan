import Head from 'next/head'
import { parseCookies } from 'nookies'
import Menu from '../components/Menu'
import { Divider, Flex, Heading, Button } from '@chakra-ui/react'
import { Credential } from '../interfaces/credential'
import { useEffect, useState } from 'react'
import router from 'next/router'
import NextLink from 'next/link'
import styles from '../styles/Home.module.scss'

const Home = (props: Credential) => {
	return (
		<div>
			<Head>
				<title>shindan</title>
			</Head>
			<Flex justifyContent="center" alignItems="center" flexDir="column" className={styles.centerOfScreen}>
				<Heading as="h1" size="3xl">
					shindan
				</Heading>
				<p style={{ marginTop: 15, marginBottom: 15 }}>オープンソース診断作成Webアプリケーション</p>
				<NextLink href="/auth/login" passHref>
					<Button size="lg" colorScheme="teal">はじめる</Button>
				</NextLink>
			</Flex>
		</div>
	)
}

export default Home
