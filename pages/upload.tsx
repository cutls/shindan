import {
	Input,
	Container,
	Heading,
	Button,
	Divider,
	Box,
	Image,
	Flex,
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	CloseButton,
	Select,
	CircularProgress,
	CircularProgressLabel,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback, Dispatch, SetStateAction } from 'react'
import SideMenu from '../components/Menu'
import { setCookie, destroyCookie, parseCookies } from 'nookies'
import * as api from '../utils/api'
import styles from '../styles/Home.module.scss'
import router from 'next/router'
import { FaUpload } from 'react-icons/fa'
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
type IState<T> = Dispatch<SetStateAction<T>>
interface IMediaComponent {
	url: string
	setUrl: IState<string>
}

const Home = (props: IMediaComponent) => {
	const [error, setError] = useState('')
	const [progress, setProgress] = useState(0)
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		const cks = parseCookies()
		if (cks.google || cks.accessToken) return
		if (!cks.google && !cks.accessToken) router.push('/auth/login')
	}, [])
	const showError = (e: string) => {
		setError(e)
		setLoading(false)
	}
	const registFileStore = async (path: string, filename: string, b64: string) => {
		const q = {
			path,
			filename,
			b64
		}
		const { data: token, error } = await api.post<any>(`/api/user/upload`, q)
		if (!token && error) return showError('アップロードに失敗しました')
	}
	

	return (
		<>
			<Flex flexWrap="wrap">
				<SideMenu isUser={true} />
				<div style={{ padding: 15 }} className={styles.main}>
					{error !== '' ? (
						<Alert status="error">
							<AlertIcon />
							<AlertTitle>ログイン失敗</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
							<CloseButton alignSelf="flex-start" position="absolute" right={-1} top={-1} onClick={() => setError('')} />
						</Alert>
					) : null}
					<Heading>アップロード</Heading>
					<div style={{ height: 10 }} />
					<Divider />
					画像ファイルのみ選択可能です
					<br />
					<input type="file" id="file" accept="image/*" />
					<div style={{ height: 10 }} />
					<Button colorScheme="teal" isLoading={loading} leftIcon={<FaUpload />} onClick={() => upload()}>
						アップロード
					</Button>
					{progress > 0 && (
						<CircularProgress value={progress} color="green.400">
							<CircularProgressLabel>{progress}%</CircularProgressLabel>
						</CircularProgress>
					)}
				</div>
			</Flex>
		</>
	)
}

export default Home
