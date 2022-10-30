import type { GetServerSideProps } from 'next'
import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import SideMenu from '../components/Menu'
import NextLink from 'next/link'
import {
    Button,
    Flex,
    Heading,
    Link,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Spinner,
    Container
} from '@chakra-ui/react'
import styles from '../styles/Home.module.scss'
import { Credential } from '../interfaces/credential'
import { IShindan } from '../interfaces/db'
import * as api from '../utils/api'
import { PageLoadingContext } from '../utils/context'

const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec))
const Home = (props: Credential) => {
    const router = useRouter()
	const { loading: pageLoading } = useContext(PageLoadingContext)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef<any>()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<IShindan[]>([])

    useEffect(() => {
        const cks = parseCookies()
        if (cks.google || cks.accessToken) return
        if (!cks.google && !cks.accessToken) router.push('/auth/login')
    }, [router])
    const init = useCallback(async () => {
        try {
            const data = await api.get<IShindan[]>(`/api/user/list`)
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
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const copy = async (i: number) => {
        try {
            onOpen()
            const d = await api.post<any>(`/api/user/copy`, { id: data[i].id })
            if (!d.data.success) throw 'Request Error'
            init()
        } catch (e: any) {
            alert(`Request Error ${e.toString()}`)
        } finally {
            onClose()
        }
    }
    const deleteItem = async (i: number) => {
        if (!confirm(`この操作は取り消せません。続行しますか？`)) return false
        try {
            onOpen()
            const d = await api.post<any>(`/api/user/delete`, { id: data[i].id, listId: data[i].listId })
            if (!d.data.success) throw 'Request Error'
            init()
        } catch (e: any) {
            alert(`Request Error ${e.toString()}`)
        } finally {
            onClose()
        }
    }
    const edit = (i: number) => {
        router.push(`/create?shindanId=${data[i].id}&listId=${data[i].listId}`)
    }
    return (
        <div>
            <Head>
                <title>マイページ - shindan</title>
            </Head>
            <Flex flexWrap="wrap">
                <SideMenu isUser={true} />
                {loading || pageLoading ? 
                <Container centerContent className={styles.fullCenter}>
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
                </Container> 
                : <div style={{ padding: 15 }} className={styles.main}>
                    {data.map((my, i) => <div className={styles.qs} key={my.id}>
                        <div className={styles.flexStartEnd}>
                            <NextLink href={`/s/${my.listId}`} passHref>
                                <Link>
                                    <Heading as="h3" size="md">
                                        {my.name}
                                    </Heading>
                                </Link></NextLink>
                            <div className={styles.flexStartEnd}>
                                <Button onClick={() => edit(i)} style={{ marginRight: 10 }}>
                                    編集
                                </Button>
                                <Button onClick={() => copy(i)} style={{ marginRight: 10 }}>
                                    複製
                                </Button>
                                <Button colorScheme="red" onClick={() => deleteItem(i)} style={{ marginRight: 10 }}>
                                    削除
                                </Button>
                            </div>
                        </div>

                    </div>)}
                </div>}

            </Flex>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                closeOnEsc={false}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            処理中
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Spinner />
                        </AlertDialogBody>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
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