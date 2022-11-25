import { Dispatch, SetStateAction, useState } from 'react'
import {
    Button,
    Divider,
    Flex,
    Heading,
    Input,
    Select,
} from '@chakra-ui/react'
import styles from '../styles/Home.module.scss'
import { IQuestion, IResult, ISelection } from '../interfaces/db'
import { v4 as uuid } from 'uuid'
type IState<T> = Dispatch<SetStateAction<T>>
interface IParam {
    setMode: IState<'result' | 'question'>
    results: IResult[]
    questions: IQuestion[]
    setQuestions: IState<IQuestion[]>
    post: () => Promise<any>
}

const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec))
const Home = (props: IParam) => {
    const { setMode, results, questions, setQuestions, post } = props
    const [editingQuestion, setEditingQuestion] = useState<null | string>(null)
    const [newText, setNewText] = useState('')
    const [loading, setLoading] = useState(false)
    const [newSelectionName, setNewSelectionName] = useState('')
    const [newSelections, setNewSelections] = useState<ISelection[]>([])
    const updateWeight = (qi: number, si: number, ri: number, resultId: string, val: number) => {
        const target = qi === -1 ? newSelections : questions[qi]['selections']
        const cloned = structuredClone(target)
        const weights = cloned[si]['weight']
        const newWeight: ISelection['weight'] = []
        let find = false
        for (const w of weights) {
            if (w.for === resultId) {
                find = true
                w.weight = val
            }
            newWeight.push(w)
        }
        if (!find) {
            newWeight.push({
                for: resultId,
                weight: val
            })
        }
        if (qi === -1) {
            cloned[si]['weight'] = newWeight
            setNewSelections(cloned)
        } else {
            questions[qi]['selections'][si]['weight'] = newWeight
            setQuestions(questions)
        }
    }
    const getWeightValue = (qi: number, si: number, resultId: string) => (qi === -1 ? newSelections : questions[qi]['selections'])[si]['weight'].find((r) => r.for === resultId)?.weight || 0

    const addNewQuestion = () => {
        const newQuestion = structuredClone(questions)
        if (editingQuestion === null) {
            newQuestion.push({
                id: uuid(),
                text: newText,
                selections: newSelections
            })
        } else {
            console.log(newQuestion, editingQuestion)
            const target = newQuestion.findIndex((i) => i.id === editingQuestion)
            console.log(target)
            if (target === -1) return alert('質問が見つかりませんでした')
            newQuestion[target] = {
                id: editingQuestion,
                text: newText,
                selections: newSelections
            }
        }
        setQuestions(newQuestion)
        setNewSelectionName('')
        setNewText('')
        setNewSelections([])
        setEditingQuestion(null)
    }
    const addNewSelection = () => {
        const newNewSelections = structuredClone(newSelections)
        setNewSelectionName('')
        newNewSelections.push({ id: uuid(), name: newSelectionName, image: '', weight: [] })
        setNewSelections(newNewSelections)
    }
    const deleteQuestion = (q: IQuestion) => setQuestions(questions.filter((r, i) => r.id !== q.id))
    const sortQuestion = (cmd: 'up' | 'down', target: IQuestion, i: number) => {
        if (editingQuestion) return alert('問いの編集中は使えません')
        const newI = cmd === 'up' ? i - 1 : i + 1
        if (newI < 0 || newI >= questions.length) return alert('この操作はできません')
        const newQuestions = questions.filter((n, j) => j !== i)
        newQuestions.splice(newI, 0, target)
        setQuestions(newQuestions)
    }
    const deleteSelection = (parent: number, children: number) => {
        let i = 0
        const newQ = []
        if (parent === -1) {
            const newNewSelections = structuredClone(newSelections)
            const newNewSelectionsFiltered = newNewSelections.filter((item, index) => index !== children)
            setNewSelections(newNewSelectionsFiltered)
        } else {
            for (const q of questions) {
                if (i !== parent) {
                    newQ.push(q)
                    continue
                }
                q.selections = q.selections.filter((r, i) => i !== children)
                newQ.push(q)
                i++
            }
            setQuestions(newQ)
        }

    }
    const editSelection = (parent: number, children: number) => {
        if (parent === -1) {
            const newNewSelections = structuredClone(newSelections)
            const currentName = newNewSelections[children].name
            const newName = prompt('選択肢名の変更', currentName)
            if (!newName) return alert('空白にはできません')
            newNewSelections[children].name = newName
            setNewSelections(newNewSelections)
        } else {
            return alert('編集中のみ利用可能です')
        }
    }
    const sortSelection = (cmd: 'up' | 'down', target: ISelection, i: number) => {
        if (!editingQuestion) return alert('Error')
        const newI = cmd === 'up' ? i - 1 : i + 1
        if (newI < 0 || newI >= newSelections.length) return alert('この操作はできません')
        const newNewSelections = newSelections.filter((n, j) => j !== i)
        newNewSelections.splice(newI, 0, target)
        setNewSelections(newNewSelections)
    }
    const editQuestion = (target: IQuestion) => {
        if (newText && !confirm(`現在入力中の問いは削除されます。`)) return false
        setNewText(target.text)
        setNewSelectionName('')
        setNewSelections(target.selections)
        setEditingQuestion(target.id)
    }
    const finishQuestionEdit = () => {
        if (newText && !confirm(`現在入力中の問いは削除されます。`)) return false
        setNewText('')
        setNewSelections([])
        setEditingQuestion(null)
    }
    const complete = async () => {
        try {
            setLoading(true)
            if (newText) return alert('「新しい問い」に記述が残っています。「問いの追加」ボタンを押して確定させてから「入力を終了」してください。')
            if (confirm('診断を作成します')) {
                await post()
            }
        } catch (e) {
            alert('Error')
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Heading as="h3" size="md">
                問いの作成
            </Heading>
            <p>次に問いと選択肢を入力します</p>
            {questions.map((question, i) => (
                <div key={`${i} ${question.text}`} className={styles.box1}>
                    <div className={styles.flexStartEnd}>
                        <p>問{i + 1}.</p>
                        <div className={styles.flexStartEnd}>
                            <Button colorScheme="green" onClick={async () => editQuestion(question)} ml={3}>
                                編集
                            </Button>
                            <Button colorScheme="red" onClick={async () => deleteQuestion(question)} ml={3}>
                                問いの削除
                            </Button>
                            <div className={styles.sortWrap}>
                                <div className={styles.sort} onClick={() => sortQuestion('up', question, i)}>↑</div>
                                <div className={styles.sort} onClick={() => sortQuestion('down', question, i)}>↓</div>
                            </div>
                        </div>
                    </div>
                    <p>{question.text}</p>
                    {
                        question.selections.map((selection, j) => (
                            <div key={`${i}-${j}`} className={styles.box2}>
                                <div className={styles.flexStartEnd}>
                                    <div className={styles.flexStartEnd}>
                                        <p>選択肢{j + 1}.</p>
                                        <p>{selection.name}</p>
                                    </div>
                                </div>
                                <div style={{ height: 5 }} />
                                <Flex flexWrap="wrap">
                                    {results.map((result, k) => (
                                        <div className={styles.readOnlyText} key={`${selection.name}-result${k}`}>
                                            <div>{result.title}</div>
                                            <div>{getWeightValue(i, j, result.id)}</div>
                                        </div>
                                    ))}
                                </Flex>
                            </div>
                        ))
                    }
                </div>
            ))
            }
            <div style={{ height: 15 }} />
            <div className={styles.box1}>
                <div className={styles.flexStartEnd}>
                    <p>{editingQuestion ? '問いを編集中' : '新しい問い'}</p>
                </div>
                <Input className={styles.whiteBg} type="text" placeholder="質問内容" value={newText} onChange={(e) => setNewText(e.target.value)} />
                <div style={{ height: 5 }} />
                {newSelections.map((selection, j) => (
                    <div key={`new-${j}`} className={styles.box2}>
                        <div className={styles.flexStartEnd}>
                            <div className={styles.flexStartEnd}>
                                <p>選択肢{j + 1}.</p>
                                <p>{selection.name}</p>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <Button colorScheme="teal" onClick={async () => editSelection(-1, j)} ml={3}>
                                    文章変更
                                </Button>
                                <Button colorScheme="orange" onClick={async () => deleteSelection(-1, j)} ml={3}>
                                    選択肢の削除
                                </Button>
                                <div className={styles.sortWrap}>
                                    <div className={styles.sort} onClick={() => sortSelection('up', selection, j)}>↑</div>
                                    <div className={styles.sort} onClick={() => sortSelection('down', selection, j)}>↓</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 5 }} />
                        <Flex flexWrap="wrap">
                            {results.map((result, k) => (
                                <div key={`${selection.name}-result${k}`} style={{ marginLeft: 10 }}>
                                    <span>{result.title}</span>
                                    <Select className={styles.weightSelectBox} value={getWeightValue(-1, j, result.id)} onChange={(e) => updateWeight(-1, j, k, result.id, parseInt(e.target.value, 10))}>
                                        <option value={0}>(選択してください)</option>
                                        <option value={1}>1(関連が低い)</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5(関連が高い)</option>
                                    </Select>
                                </div>
                            ))}
                        </Flex>

                    </div>
                ))}
                <div className={styles.flexStartEnd}>
                    <Input className={styles.whiteBg} type="text" placeholder="選択肢" value={newSelectionName} onChange={(e) => setNewSelectionName(e.target.value)} />
                    <Button colorScheme="purple" onClick={async () => addNewSelection()} ml={3}>
                        選択肢の追加
                    </Button>
                </div>

            </div>
            <div style={{ height: 5 }} />
            <Button colorScheme="blue" onClick={async () => addNewQuestion()} ml={3}>
                {editingQuestion ? '編集完了' : '問いの追加'}
            </Button>
            {
                editingQuestion !== null && <Button colorScheme="orange" onClick={async () => finishQuestionEdit()} ml={3}>
                    編集を破棄
                </Button>
            }

            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            <Button colorScheme="green" onClick={async () => complete()} ml={3} isLoading={loading}>
                入力を終了
            </Button>
        </>
    )
}

export default Home