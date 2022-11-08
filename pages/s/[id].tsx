import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import NextLink from 'next/link'
import { Anchorme } from 'react-anchorme'
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
import { IResult, IShindan } from '../../interfaces/db'
import { GetServerSideProps } from 'next'
import { core as apiGetCore } from '../api/get'
interface ISelected {
	questionIndex: number
	selectIndex: number
}
interface IExtendedResult extends IResult {
	point: number
}
const openNewTab = (link: string) => (!window.open(link) ? (location.href = link) : window.open(link))

const Home = (data: IShindan) => {
	const router = useRouter()
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [mode, setMode] = useState<'answer' | 'result'>('answer')
	const [resultTitle, setResultTitle] = useState<string[]>([])
	const [resultDesc, setResultDesc] = useState<string[]>([])

	const cancelRef = useRef<any>()
	const [loading, setLoading] = useState(false)
	const init = useCallback(async (id: string) => {
		if (!data.id) {
			alert('質問が見つかりませんでした')
			router.push('/')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const makePublic = async () => {
		try {
			const id = router.query.id
			if (!id) return alert('Error')
			setLoading(true)
			const { data, error } = await api.post<any>(`/api/user/visibility`, { id, status: 'public' })
			if (error) throw 'Error'
			router.reload()
		} catch {
			alert(`Error`)
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		if (router.isReady) {
			const routeId = router.query.id
			if (typeof routeId !== 'string') return
			init(routeId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		setResultTitle(sortedPoints.map((i) => i.title))
		setResultDesc(sortedPoints.map((i) => i.description))
		setMode('result')
	}
	const shareTo = (media: 'twitter' | 'line') => {
		if (media === 'twitter') openNewTab(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`診断「${data?.name}」の結果は${resultTitle[0]}でした！`)}&url=${encodeURIComponent(`https://shindanapp.vercel.app/s/${router.query.id}`)}`)
		if (media === 'line') openNewTab(`https://line.me/R/share?text=${encodeURIComponent(`診断「${data?.name}」の結果は${resultTitle[0]}でした！ https://shindanapp.vercel.app/s/${router.query.id}`)}`)
	}
	const reset = () => {
		setResultTitle([])
		setResultDesc([])
		setSelected([])
		setMode('answer')
	}
	const getIsSelected = (i: number, j: number) => !!selected.find((s) => s.questionIndex === i && s.selectIndex === j)
	const getIsCompleted = () => data?.questions ? selected.length === data?.questions.length : false
	return (
		<div>
			<Head>
				<title>{data.name} - shindan</title>
				<meta property="og:title" content={data.name} />
				<meta property="og:url" content={`https://shindanapp.vercel.app/s/${data.listId}`} />
				<meta property="og:description" content={`${data.name}をshindanappでかんたん診断`} />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="shindanapp" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta property="og:image" content={`https://shindanapp.vercel.app/api/og?title=${data.name}`} />
			</Head>
			<Flex flexWrap="wrap" justify="center">
				<div style={{ padding: 15 }} className={styles.main}>
					<div className={styles.flexStartEnd}>
						<Heading as="h1" size="xl" textAlign="center">
							{data.name}
						</Heading>
						{data.status === 'draft' && <Button colorScheme="blue" onClick={() => makePublic()} style={{ marginRight: 10 }} isLoading={loading}>
							公開する
						</Button>}
					</div>

					<div style={{ height: 15 }} />
					<SlideFade in={mode === 'answer'} offsetY='20px' style={{ display: mode === 'answer' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
						{data.questions && data.questions.map((q, i) => <div className={styles.question} key={`q--${i}`}>
							<Heading as="h3" size="md">
								{q.text}
							</Heading>
							{q.selections.map((s, j) =>
								<div className={[styles.selectable, getIsSelected(i, j) ? styles.selected : null].join(' ')} key={`q--${i}--${j}`} onClick={() => select(i, j)}>
									{s.name}
								</div>
							)}
						</div>)}
						<Flex flexWrap="wrap" justify="center">
							<Button colorScheme="teal" size="lg" disabled={!getIsCompleted()} onClick={() => calculate()}>
								結果を見る
							</Button>
						</Flex>
					</SlideFade>
					<SlideFade in={mode === 'result'} offsetY='20px' style={{ display: mode === 'result' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
						<p className={styles.addBr}>{(data.resultText || '').replace(/\\n/g, '\n') || ''}</p>
						<div className={styles.question}>
							<Heading as="h3" size="xl">
								{resultTitle[0]}
							</Heading>
							<Divider style={{ marginTop: 10, marginBottom: 10 }} />
							<p className={styles.addBr}>
								<Anchorme target="_blank" rel="noreferrer noopener">
									{`${(resultDesc[0] || '').replace(/\\n/g, '\n')}`}
								</Anchorme>
							</p>
						</div>
						<p style={{ textAlign: 'center' }}>2位以下はこちら</p>
						<Flex flexWrap="wrap" justify="space-between">
							<div className={`${styles.question} ${styles.second}`}>
								<Heading as="h4" size="lg">
									2位: {resultTitle[1] || ''}
								</Heading>
								<Divider style={{ marginTop: 10, marginBottom: 10 }} />
								<p className={styles.addBr}>
									<Anchorme target="_blank" rel="noreferrer noopener">
										{`${(resultDesc[1] || '').replace(/\\n/g, '\n')}`}
									</Anchorme>
								</p>
							</div>
							{resultTitle[2] && <div className={`${styles.question} ${styles.second}`}>
								<Heading as="h4" size="lg">
									3位: {resultTitle[2]}
								</Heading>
								<Divider style={{ marginTop: 10, marginBottom: 10 }} />
								<p className={styles.addBr}>
									<Anchorme target="_blank" rel="noreferrer noopener">
										{`${(resultDesc[2] || '').replace(/\\n/g, '\n')}`}
									</Anchorme>
								</p>
							</div>}
						</Flex>
						<Flex flexWrap="wrap" justify="space-around" align="center">
							<Button colorScheme="teal" size="lg" onClick={() => reset()}>
								もう一度診断
							</Button>
							<Button colorScheme="twitter" onClick={() => shareTo('twitter')}>Twitterでシェア</Button>
							<Button colorScheme="whatsapp" onClick={() => shareTo('line')}>LINEでシェア</Button>
						</Flex>
						<div style={{ marginBottom: 10 }} />
						<Flex flexWrap="wrap" justify="center">

						</Flex>
					</SlideFade>
					<div className={styles.footer}>
						<NextLink href="/" passHref>
							shindanapp.vercel.app
						</NextLink>
					</div>
				</div>

			</Flex>
		</div>
	)
}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const id = ctx.query.id
	try {
		const data: any = await apiGetCore({ id })
		if (!data) return { props: {} }
		return { props: data }
	} catch (e) {
		console.error(e)
		return { props: {} }
	}
}
export default Home