import styles from '../styles/Home.module.scss'
import { NextComponentType } from 'next'
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	LinkOverlay,
	LinkBox,
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	useDisclosure,
	Button,
	Flex,
	Heading,
	Link,
	Spinner,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useEffect, useState, useLayoutEffect } from 'react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { FaUpload } from 'react-icons/fa'
import * as api from '../utils/api'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { signOut } from 'next-auth/react'
import router from 'next/router'

const MenuComponent = (props: { isUser: boolean }) => {
	const { isUser } = props
	const [loading, setLoading] = useState(false)
	const logout = () => {
		setLoading(true)
		setCookie(null, 'accessToken', '', { maxAge: 0 })
		setCookie(null, 'google', '', { maxAge: 0 })
		if (isUser) setTimeout(() => signOut(), 500)
		if (!isUser) setTimeout(() => router.push('/auth/login'), 500)
	}
	return (
		<div>
			<NextLink href="/create" passHref>
				<Button width="calc(100% - 30px)" leftIcon={<FaUpload />}>
					新規作成
				</Button>
			</NextLink>
			<div style={{ padding: 5 }}>
				<a className={styles.link} onClick={() => logout()}>
					ログアウト
					{loading && <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="sm" />}
				</a>
			</div>
		</div>
	)
}
export const useIsomorphicEffect = () => {
	return typeof window !== 'undefined' ? useLayoutEffect : useEffect
}
function useWindowSize() {
	const isomorphicEffect = useIsomorphicEffect()
	const [size, setSize] = useState([0, 0])
	isomorphicEffect(() => {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight])
		}
		window.addEventListener('resize', updateSize)
		updateSize()
		return () => window.removeEventListener('resize', updateSize)
	}, [])
	return size
}
export const Menu = (props: { isUser: boolean }) => {
	const [width] = useWindowSize()
	const { isOpen, onOpen, onClose } = useDisclosure()
	return (
		<>
			{width < 901 ? (
				<>
					<Flex className={styles.header} align="center">
						<Button leftIcon={<HamburgerIcon />} onClick={onOpen} variant="outline">
							メニュー
						</Button>
						<NextLink href="/" passHref>
							<Link>
								<Heading style={{ paddingLeft: 10 }} size="md">
									shindanapp.vercel.app
								</Heading>
							</Link>
						</NextLink>
					</Flex>
					<Drawer isOpen={isOpen} placement="left" onClose={onClose}>
						<DrawerOverlay />
						<DrawerContent>
							<DrawerCloseButton />
							<DrawerHeader>
								{props.isUser ? (
									<span>ログインされています</span>
								) : (
									<span>メニュー</span>
								)}
							</DrawerHeader>
							<DrawerBody>
								<MenuComponent isUser={props.isUser} />
							</DrawerBody>
						</DrawerContent>
					</Drawer>
				</>
			) : (
				<div>
					<NextLink href={props.isUser ? '/upload' : '/'} passHref>
						<Link>
							{props.isUser ? (
								<span>ログインされています</span>
							) : (
								<Heading style={{ padding: 5 }} size="md">
									shindanapp.vercel.app
								</Heading>
							)}
						</Link>
					</NextLink>
					<MenuComponent isUser={props.isUser} />
				</div>
			)}
		</>
	)
}

export default Menu
