import type { GetServerSideProps } from 'next'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import SideMenu from '../components/Menu'
import CreateResults from '../components/CreateResults'
import CreateQuestions from '../components/CreateQuestions'
import {
    Divider,
    Flex,
    Heading,
    Input,
    Portal,
    SlideFade,
    useDisclosure,
} from '@chakra-ui/react'
import styles from '../styles/Home.module.scss'
import { Credential } from '../interfaces/credential'
import { IQuestion, IResult } from '../interfaces/db'
import * as api from '../utils/api'

const Home = (props: Credential) => {
    const router = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef<any>()
    const [mode, setMode] = useState<'result' | 'question'>('result')
    const [name, setName] = useState('')
    const [results, setResults] = useState<IResult[]>([])
    const [questions, setQuestions] = useState<IQuestion[]>([])

    useEffect(() => {
        const cks = parseCookies()
        if (cks.google || cks.accessToken) return
        if (!cks.google && !cks.accessToken) router.push('/auth/login')
    }, [router])
    const init = useCallback(async () => {
        const object = { a: 'b' }
        const cObj = structuredClone(object)
        let unSupported = false
        if (!cObj) unSupported = true
        if (cObj.a !== object.a) unSupported = true
        if (unSupported) alert(`診断作成非対応ブラウザです。`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const openNewTab = (link: string) => (!window.open(link) ? (location.href = link) : window.open(link))
    const post = async () => {
        try {
            console.log({ results, questions, name })
            const data = await api.post<any>(`/api/user/post`, { results, questions, name })
            if (!data.data.success) throw 'Request Error'
            router.push('/')
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
                <SlideFade in={mode === 'result'} offsetY='20px' style={{ display: mode === 'result' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
                    <Heading as="h3" size="md">
                        診断のタイトル
                    </Heading>
                    <Input className={styles.whiteBg} type="text" placeholder="タイトル" value={name} onChange={(e) => setName(e.target.value)} />
                    <div style={{ height: 10 }} />
                    <CreateResults results={results} setResults={setResults} setMode={setMode} />
                </SlideFade>
                <SlideFade in={mode === 'question'} offsetY='20px' style={{ display: mode === 'question' ? 'block' : 'none', flexGrow: 1, padding: 10 }}>
                    <CreateQuestions results={results} questions={questions} setQuestions={setQuestions} setMode={setMode} post={post} />
                </SlideFade>

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
    const props: Credential = {
        login: !!cookie.google
    }
    if (!props.login) return { redirect: { destination: '/auth/login', permanent: false } }
    return {
        props,
    }
}
