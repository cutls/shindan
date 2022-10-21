import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import SideMenu from '../../components/Menu'
import {
	Button,
	Divider,
	Flex,
	Heading,
	SlideFade,
	Spinner,
	useDisclosure,
} from '@chakra-ui/react'
import styles from '../../styles/Home.module.scss'
import * as api from '../../utils/api'
import { Credential } from '../../interfaces/credential'
import { IResult, IShindan } from '../../interfaces/db'
interface ISelected {
	questionIndex: number
	selectIndex: number
}
interface IExtendedResult extends IResult {
	point: number
}
const openNewTab = (link: string) => (!window.open(link) ? (location.href = link) : window.open(link))

const Home = (props: Credential) => {
	const router = useRouter()
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [mode, setMode] = useState<'answer' | 'result'>('answer')
	const [resultTitle, setResultTitle] = useState('')
	const [resultDesc, setResultDesc] = useState('')

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
	const makePublic = async () => {
		try {
			const id = router.query.id
			if (!id) return alert('Error')
			const { data, error } = await api.post<any>(`/api/user/visibility`, { id, status: 'public' })
			if (data && !error) setData(data)
		} catch {
			alert(`Error`)
		}
	}
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
		const newSelected = []
		const alreadyChoosen = !!selected.find((s) => s.questionIndex === i)
		for (const s of selected) {
			if (s.questionIndex === i) {
				newSelected.push({ questionIndex: i, selectIndex: j })
			} else {
				newSelected.push(s)
			}
		}
		if (!alreadyChoosen) newSelected.push({ questionIndex: i, selectIndex: j })
		setSelected(newSelected)
	}
	const calculate = () => {
		const points: IExtendedResult[] = []
		for (const r of data?.results || []) points.push({
			point: 0,
			...r
		})
		const sortedSelected = selected.sort()
		const qs = data?.questions
		if (!qs) return
		for (const s of sortedSelected) {
			const i = s.selectIndex
			const weights = qs[s.questionIndex].selections[i].weight
			for (const w of weights) {
				const ri = points.findIndex((r) => r.id === w.for)
				points[ri].point = points[ri].point + w.weight
			}
		}
		const sortedPoints = points.sort((a, b) => b.point - a.point)
		setResultTitle(sortedPoints[0].title)
		setResultDesc(sortedPoints[0].description)
		setMode('result')
	}
	const shareTo = (media: 'twitter' | 'line') => {
		if (media === 'twitter') openNewTab(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`診断「${data?.name}」の結果は${resultTitle}でした！`)}&url=${encodeURIComponent(`https://shindan.vercel.app/s/${router.query.id}`)}`)
		if (media === 'line') openNewTab(`https://line.me/R/share?text=${encodeURIComponent(`診断「${data?.name}」の結果は${resultTitle}でした！ https://shindan.vercel.app/s/${router.query.id}`)}`)
	}
	const reset = () => {
		setResultTitle('')
		setResultDesc('')
		setSelected([])
		setMode('answer')
	}
	const getIsSelected = (i: number, j: number) => !!selected.find((s) => s.questionIndex === i && s.selectIndex === j)
	const getIsCompleted = () => selected.length === data?.questions.length

	if (!data) return <Spinner />
	return (
		<div>
			<Head>
				<title>{data.name} - shindan</title>
			</Head>
			<Flex flexWrap="wrap">
				<SideMenu isUser={user} />
				<div style={{ padding: 15 }} className={styles.main}>
					<div className={styles.flexStartEnd}>
						<Heading as="h1" size="xl">
							{data.name}
						</Heading>
						{data.status === 'draft' && <Button colorScheme="blue" onClick={() => makePublic()} style={{ marginRight: 10 }}>
							公開する
						</Button>}
					</div>

					<div style={{ height: 15 }} />
					<SlideFade in={mode === 'answer'} offsetY='20px' style={{ display: mode === 'answer' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
						{data.questions.map((q, i) => <div className={styles.question} key={`q--${i}`}>
							<Heading as="h3" size="md">
								{q.text}
							</Heading>
							{q.selections.map((s, j) =>
								<div className={[styles.selectable, getIsSelected(i, j) ? styles.selected : null].join(' ')} key={`q--${i}--${j}`} onClick={() => select(i, j)}>
									{s.name}
								</div>
							)}
						</div>)}
						<Button colorScheme="teal" size="lg" disabled={!getIsCompleted()} onClick={() => calculate()}>
							結果を見る
						</Button>
					</SlideFade>
					<SlideFade in={mode === 'result'} offsetY='20px' style={{ display: mode === 'result' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
						<div className={styles.question}>
							<Heading as="h3" size="2xl">
								{resultTitle}
							</Heading>
							<Divider style={{ marginTop: 10, marginBottom: 10 }} />
							<p>{resultDesc}</p>
							<Divider style={{ marginTop: 10, marginBottom: 10 }} />
							<Button colorScheme="twitter" onClick={() => shareTo('twitter')}>Twitterでシェア</Button>
							<span style={{ marginLeft: 10 }} />
							<Button colorScheme="whatsapp" onClick={() => shareTo('line')}>LINEでシェア</Button>
						</div>
						<Button colorScheme="teal" size="lg" onClick={() => reset()}>
							もう一度診断
						</Button>

					</SlideFade>
				</div>

			</Flex>
		</div>
	)
}

export default Home