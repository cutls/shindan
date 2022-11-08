import type { GetServerSideProps } from 'next'
import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import SideMenu from '../components/Menu'
import CreateResults from '../components/CreateResults'
import CreateQuestions from '../components/CreateQuestions'
import {
    Container,
    Divider,
    Flex,
    Heading,
    Input,
    Portal,
    SlideFade,
    Spinner,
    Textarea,
    useDisclosure,
} from '@chakra-ui/react'
import styles from '../styles/Home.module.scss'
import { Credential } from '../interfaces/credential'
import { IQuestion, IResult, IShindan } from '../interfaces/db'
import * as api from '../utils/api'
import { PageLoadingContext } from '../utils/context'
interface IQuery {
    shindanId: string | null
    listId: string | null
}
const Home = (props: IQuery) => {
    const router = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { loading: pageLoading } = useContext(PageLoadingContext)
    const cancelRef = useRef<any>()
    const [mode, setMode] = useState<'result' | 'question'>('result')
    const [name, setName] = useState('')
    const [resultText, setResultText] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<IResult[]>([])
    const [questions, setQuestions] = useState<IQuestion[]>([])

    useEffect(() => {
        const cks = parseCookies()
        if (cks.google || cks.accessToken) return
        if (!cks.google && !cks.accessToken) router.push('/auth/login')
    }, [router])
    const obj = props
    const init = useCallback(async () => {
        const object = { a: 'b' }
        const cObj = structuredClone(object)
        let unSupported = false
        if (!cObj) unSupported = true
        if (cObj.a !== object.a) unSupported = true
        if (unSupported) alert(`診断作成非対応ブラウザです。`)
        if (obj.listId) {
            setLoading(true)
            try {
                const { data: dataRaw, error } = await api.post<IShindan>(`/api/get`, { id: obj.listId })
                if (!dataRaw || error) return alert(`Error`)
                const data = dataRaw
                setResults(data.results)
                setQuestions(data.questions)
                setName(data.name)
                setResultText(data.resultText.replace(/\\n/g, '\n'))
            } catch {
                alert(`Error undetected error`)
            } finally {
                setLoading(false)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const post = async () => {
        try {
            const id = obj.shindanId || null
            const resultTextBred = resultText.replace(/\n/g, '\\n')
            const set = id ? { results, questions, name, resultText: resultTextBred, id } : { results, questions, resultText: resultTextBred, name }
            const url = id ? `/api/user/update` : `/api/user/post`
            const data = await api.post<any>(url, set)
            if (!data.data.success) throw 'Request Error'
            router.push(`/s/${data.data.id}`)
        } catch (e: any) {
            alert(`Request Error ${e.toString()}`)
        }
    }


    return (
        <div>
            <Head>
                <title>新規作成 - shindan</title>
            </Head>
            <Flex flexWrap="wrap" flexGrow={2}>
                <SideMenu isUser={true} />
                {loading || pageLoading ?
                    <Container centerContent className={styles.fullCenter}>
                        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
                    </Container>
                    :
                    <>
                        <SlideFade in={mode === 'result'} offsetY='20px' style={{ display: mode === 'result' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
                            <Heading as="h3" size="md">
                                診断のタイトル
                            </Heading>
                            <Input className={styles.whiteBg} type="text" placeholder="タイトル" value={name} onChange={(e) => setName(e.target.value)} />
                            <div style={{ height: 10 }} />
                            <p>結果が出たときに(結果によらず)表示するテキスト</p>
                            <Textarea className={styles.whiteBg} placeholder="結果が出たときに表示" value={resultText} onChange={(e) => setResultText(e.target.value)} />
                            <div style={{ height: 10 }} />
                            <CreateResults results={results} setResults={setResults} setMode={setMode} />
                        </SlideFade>
                        <SlideFade in={mode === 'question'} offsetY='20px' style={{ display: mode === 'question' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
                            <CreateQuestions results={results} questions={questions} setQuestions={setQuestions} setMode={setMode} post={post} />
                        </SlideFade>
                    </>}
            </Flex >
            <div style={{ height: 15 }} />
            <Divider />
            <Portal>
                <p style={{ fontSize: 10, fontStyle: 'italic' }}>cutls 2022 [Next.js, TypeScript, Vercel]</p>
            </Portal>
        </div >
    )
}

export default Home
export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const cookie = parseCookies(ctx)
    const query = ctx.query || { shindanId: null, listId: null }
    const props = {
        shindanId: query.shindanId || null,
        listId: query.listId || null
    }
    if (!cookie.google) return { redirect: { destination: '/auth/login', permanent: false } }
    return {
        props,
    }
}