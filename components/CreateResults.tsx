import { useState, useRef, Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/router'
import { v4 as uuid } from 'uuid'
import {
    Button,
    Divider,
    Heading,
    Input,
    Textarea,
} from '@chakra-ui/react'
import styles from '../styles/Home.module.scss'
import { IResult } from '../interfaces/db'
type IState<T> = Dispatch<SetStateAction<T>>
interface IParam {
    setMode: IState<'result' | 'question'>
    results: IResult[]
    setResults: IState<IResult[]>
}
const Home = (props: IParam) => {
    const { setMode, results, setResults } = props
    const wiseQuestionChange = () => {
        if (newResultTitle) addNewResult()
        setMode('question')
    }
    const [isEditResult, setIsEditResult] = useState(-1)
    const [newResultTitle, setNewResultTitle] = useState('')
    const [newResultDescription, setNewResultDescription] = useState('')
    const deleteItem = () => true

    const openNewTab = (link: string) => (!window.open(link) ? (location.href = link) : window.open(link))
    const editResult = (index: number) => {
        const targetResult = results[index]
        if ((newResultTitle || newResultDescription) && !confirm(`現在入力中の診断結果は削除されます。`)) return false
        setNewResultTitle(targetResult.title)
        setNewResultDescription(targetResult.description.replace(/\\n/g, '\n'))
        setIsEditResult(index)
    }
    const finishResultEdit = () => {
        if ((newResultTitle || newResultDescription) && !confirm(`現在入力中の診断結果は削除されます。`)) return false
        setNewResultTitle('')
        setNewResultDescription('')
        setIsEditResult(-1)
    }
    const addNewResult = () => {
        if (isEditResult === -1) {
            results.push({
                id: uuid(),
                image: '',
                title: newResultTitle,
                description: newResultDescription.replace(/\n/g, '\\n')
            })
            setResults(results)
        } else {
            const newResults = structuredClone(results)
            newResults[isEditResult] = {
                id: newResults[isEditResult].id,
                image: '',
                title: newResultTitle,
                description: newResultDescription.replace(/\n/g, '\\n')
            }
            setResults(newResults)
        }
        setNewResultTitle('')
        setNewResultDescription('')
    }
    const deleteResult = (index: number) => setResults(results.filter((r, i) => i !== index))

    return (
        <div >
            <Heading as="h3" size="md">
                結果の作成
            </Heading>
            <p>まずは診断結果を入力します</p>
            {results.map((result, i) => (
                <div key={result.id} className={styles.box1}>
                    <p><b>{i + 1}.</b></p>
                    <Divider />
                    <p><b>タイトル: </b>{result.title}</p>
                    <Divider />
                    <p><b>説明</b></p>
                    <p className={styles.addBr}>{`${result.description.replace(/\\n/g, '\n')}`}</p>
                    <div style={{ height: 15 }} />
                    <div className={styles.flexStartEnd}>
                        <Button colorScheme="green" onClick={async () => editResult(i)} ml={3}>
                            編集
                        </Button>
                        <Button colorScheme="red" onClick={async () => deleteResult(i)} ml={3}>
                            削除
                        </Button>
                    </div>
                </div>
            ))}
            <div className={styles.box1}>
                <p>{isEditResult !== -1 ? '結果を編集中' : '新しい結果'}</p>
                <Input className={styles.whiteBg} type="text" placeholder="タイトル" value={newResultTitle} onChange={(e) => setNewResultTitle(e.target.value)} />
                <div style={{ height: 5 }} />
                <Textarea className={styles.whiteBg} placeholder="説明" value={newResultDescription} onChange={(e) => setNewResultDescription(e.target.value)} />
                <div style={{ height: 5 }} />
                {/* uploader */}
                <Button colorScheme="blue" onClick={async () => addNewResult()} ml={3}>
                    {isEditResult !== -1 ? '編集完了' : '追加'}
                </Button>
                {isEditResult !== -1 && <Button colorScheme="orange" onClick={async () => finishResultEdit()} ml={3}>
                    編集を破棄
                </Button>}
            </div>
            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            <Button colorScheme="green" onClick={() => wiseQuestionChange()} ml={3}>
                問いの作成へ
            </Button>
        </div>
    )
}

export default Home