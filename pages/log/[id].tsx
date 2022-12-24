import type { GetServerSideProps } from 'next'
import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import SideMenu from '../../components/Menu'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

import {
    Button,
    Flex,
    Heading,
    Link,
    Spinner,
    Container
} from '@chakra-ui/react'
import styles from '../../styles/Home.module.scss'
import { Credential } from '../../interfaces/credential'
import { IShindan, IQuestion, ISelection } from '../../interfaces/db'
import * as api from '../../utils/api'
import { PageLoadingContext } from '../../utils/context'
interface IReturn {
    question: IQuestion
    selection: ISelection
}[]
interface IResponse {
    id: string
    createdAt: number
    resultDesc: string[]
    resultTitle: string[]
    selected: IReturn[]
}

const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec))
const Home = (props: Credential) => {
    const router = useRouter()
    const { loading: pageLoading } = useContext(PageLoadingContext)
    const cancelRef = useRef<any>()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<IResponse[]>([])

    useEffect(() => {
        const cks = parseCookies()
        if (cks.google || cks.accessToken) return
        if (!cks.google && !cks.accessToken) router.push('/auth/login')
    }, [router])
    const init = useCallback(async (id: string) => {
        try {
            const data = await api.post<IResponse[]>(`/api/user/log`, { id })
            if (!data.data) throw 'Request Error'
            setData(data.data)
        } catch (e) {
            alert(`Error`)
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        if (router.isReady) {
            const routeId = router.query.id
            if (typeof routeId !== 'string') return
            init(routeId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])
    return (
        <div>
            <Head>
                <title>ログ - shindan</title>
            </Head>
            <Flex flexWrap="wrap">
                <SideMenu isUser={true} />
                {loading || pageLoading ?
                    <Container centerContent className={styles.fullCenter}>
                        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
                    </Container>
                    : <div style={{ padding: 15 }} className={styles.main}>
                        {data.map((log, i) => <div className={styles.qs} key={log.id}>
                            <div style={{ marginTop: 25 }}>
                                <p><b>Created at:</b>{dayjs(log.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</p>
                                <p><b>Result</b>(1st): {log.resultTitle[0]}</p>
                                <p><b>Result</b>(2nd): {log.resultTitle[1]}</p>
                                <table className={styles.table}>
                                    {log.selected.map((selected, j) =>
                                        <tr key={`${log.id}-${j}`}>
                                            <td className={styles.td}>{selected.question.text}</td>
                                            <td className={styles.td}>{selected.selection.name}</td>
                                        </tr>
                                    )}
                                </table>

                            </div>
                        </div>)}
                    </div>}

            </Flex>
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