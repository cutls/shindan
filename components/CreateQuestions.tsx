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
    const [isEditQuestion, setIsEditQuestion] = useState(-1)
    const [newText, setNewText] = useState('')
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
        if (isEditQuestion === -1) {
            newQuestion.push({
                text: newText,
                selections: newSelections
            })
        } else {
            newQuestion[isEditQuestion] = {
                text: newText,
                selections: newSelections
            }
        }
        setQuestions(newQuestion)
        setNewSelectionName('')
        setNewText('')
        setNewSelections([])
    }
    const addNewSelection = () => {
        const newNewSelections = structuredClone(newSelections)
        setNewSelectionName('')
        newNewSelections.push({ name: newSelectionName, image: '', weight: [] })
        setNewSelections(newNewSelections)
    }
    const deleteQuestion = (index: number) => setQuestions(questions.filter((r, i) => i !== index))
    const deleteSelection = (parent: number, children: number) => {
        let i = 0
        const newQ = []
        if (parent === -1) {
            const newNewSelections = structuredClone(newSelections)
            delete newNewSelections[children]
            setNewSelections(newNewSelections)
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
    const editQuestion = (i: number) => {
        if (newText && !confirm(`現在入力中の問いは削除されます。`)) return false
        console.log(i)
        const target = questions[i]
        setNewText(target.text)
        setNewSelectionName('')
        setNewSelections(target.selections)
        setIsEditQuestion(i)
    }
    const finishQuestionEdit = () => {
        if (newText && !confirm(`現在入力中の問いは削除されます。`)) return false
        setNewText('')
        setNewSelections([])
        setIsEditQuestion(-1)
    }
    const complete = async () => {
        const nowLength = questions.length
        if (newText) return alert('「新しい問い」に記述が残っています。「問いの追加」ボタンを押して確定させてから「入力を終了」してください。')
        if (confirm('診断を作成します')) {
            post()
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
                            <Button colorScheme="green" onClick={async () => editQuestion(i)} ml={3}>
                                編集
                            </Button>
                            <Button colorScheme="red" onClick={async () => deleteQuestion(i)} ml={3}>
                                問いの削除
                            </Button>
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
                                    <Button colorScheme="orange" onClick={async () => deleteSelection(i, j)} ml={3}>
                                        選択肢の削除
                                    </Button>
                                </div>
                                <p>{selection.name}</p>
                                <div style={{ height: 5 }} />
                                <Flex flexWrap="wrap">
                                    {results.map((result, k) => (
                                        <div key={`${selection.name}-result${k}`}>
                                            <span>{result.title}</span>
                                            <Select className={styles.weightSelectBox} value={getWeightValue(i, j, result.id)} onChange={(e) => updateWeight(i, j, k, result.id, parseInt(e.target.value, 10))}>
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
                        ))
                    }
                </div>
            ))
            }
            <div style={{ height: 15 }} />
            <div className={styles.box1}>
                <div className={styles.flexStartEnd}>
                    <p>新しい問い</p>
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
                            <Button colorScheme="orange" onClick={async () => deleteSelection(-1, j)} ml={3}>
                                選択肢の削除
                            </Button>
                        </div>
                        <div style={{ height: 5 }} />
                        <Flex flexWrap="wrap">
                            {results.map((result, k) => (
                                <div key={`${selection.name}-result${k}`} style={{ marginLeft: 10 }}>
                                    <span>{result.title}</span>
                                    <Select className={styles.weightSelectBox} value={getWeightValue(-1, j, result.id)} onChange={(e) => updateWeight(-1, j, k, result.id, parseInt(e.target.value, 10))}>
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
                問いの追加
            </Button>
            {
                isEditQuestion !== -1 && <Button colorScheme="orange" onClick={async () => finishQuestionEdit()} ml={3}>
                    編集を破棄
                </Button>
            }

            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            <Button colorScheme="green" onClick={async () => complete()} ml={3}>
                入力を終了
            </Button>
        </>
    )
}

export default Home