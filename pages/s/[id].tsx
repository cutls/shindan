import type { NextPage, GetServerSideProps } from 'next'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import SideMenu from '../../components/Menu'
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Badge,
	Button,
	Divider,
	Flex,
	Heading,
	IconButton,
	LinkBox,
	LinkOverlay,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Portal,
	Spinner,
	Text,
	useDisclosure,
} from '@chakra-ui/react'
import styles from '../../styles/Home.module.scss'
import { ChevronDownIcon, DownloadIcon, TimeIcon, ViewIcon } from '@chakra-ui/icons'
import dayjs from 'dayjs'
import * as api from '../../utils/api'
import { Credential } from '../../interfaces/credential'
import { IShindan } from '../../interfaces/db'
interface ISelected {
	questionIndex: number
	selectIndex: number
}

const Home = (props: Credential) => {
	const router = useRouter()
	const { isOpen, onOpen, onClose } = useDisclosure()
	const cancelRef = useRef<any>()
	const [user, setUser] = useState(false)
	const [loading, setLoading] = useState(false)
	const [data, setData] = useState<IShindan | null>(null)
	const init = useCallback(async (id: string) => {
		if (!id) return alert('Error')
		const { data, error } = await api.post<IShindan>(`/api/get`, { id })
		if (data && !error) setData(data)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		if (router.isReady) {
			const routeId = router.query.id
			if (typeof routeId !== 'string') return
			init(routeId)
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}
	}, [router])
	const [selected, setSelected] = useState<ISelected[]>([])
	const select = (i: number, j: number) => {
		const qs = data?.questions
		if (!qs) return
		const newSelected = []
		const alreadyChoosen = !!selected.find((s) => s.questionIndex === i)
		for (const s of selected) {
			if(s.questionIndex === i) {
				newSelected.push({ questionIndex: i, selectIndex: j })
			} else {
				newSelected.push(s)
			}
		}
		if (!alreadyChoosen) newSelected.push({ questionIndex: i, selectIndex: j })
		setSelected(newSelected)
		console.log(selected)
	}
	const getIsSelected = (i: number, j: number) => !!selected.find((s) => s.questionIndex === i && s.selectIndex === j)

	if (!data) return <Spinner />
	return (
		<div>
			<Head>
				<title>{data.name} - shindan</title>
			</Head>
			<Flex flexWrap="wrap">
				<SideMenu isUser={user} />
				<div style={{ padding: 15 }} className={styles.main}>
					<Heading as="h1" size="xl">
						{data.name}
					</Heading>
					<div style={{height: 15}} />
					{data.questions.map((q, i) => <div className={styles.question} key={`q--${i}`}>
						<Heading as="h3" size="md">
							{q.text}
						</Heading>
						{q.selections.map((s, j) =>
							<div className={[styles.selectable, getIsSelected(i, j) ? styles.selected : null].join(' ')} key={`q--${i}--${j}`} onClick={() => select(i, j) }>
								{s.name}
							</div>
						)}
					</div>)}
				</div>
			</Flex>
		</div>
	)
}

export default Home