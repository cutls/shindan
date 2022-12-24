import * as db from '../../../utils/db'
import { v4 as uuid } from 'uuid'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import authCheck from '../../../utils/authCheck'
import { IShindan, ILogs, IQuestion, ISelection, IResult } from '../../../interfaces/db'
import { String } from 'aws-sdk/clients/batch'

interface LoginError {
    error: boolean
    message?: string
}
interface IParam {
    id: String
}
interface IExtendedResult extends IResult {
    point: number
}
interface IReturn {
    question: IQuestion
    selection: ISelection
}[]
interface IResponse {
    resultDesc: string[]
    resultTitle: string[]
    selected: IReturn[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IResponse[] | LoginError>) {
    try {
        const session = await getSession({ req })
        const { id }: IParam = JSON.parse(req.body)
        const email = session?.user?.email
        if (!email) return res.status(400).json({ error: true, message: 'auth error' })
        console.log(id)
        const list = await db.get<ILogs>('logs', id)
        if (!list) return res.status(400).json({ error: true, message: 'No listed log' })
        const shindan = await db.get<IShindan>(email, id)
        if (!shindan) return res.status(400).json({ error: true, message: 'No listed shindan' })
        const { questions } = shindan
        const ret = []
        for (const log of Object.values(list)) {
            const { selection, createdAt } = log
            const rets = []
            for (const s of selection) {
                const targetQ = questions[s.questionIndex]
                rets.push({ question: targetQ, selection: targetQ.selections[s.selectIndex] })
            }
            const points: IExtendedResult[] = []
            for (const r of shindan?.results || []) points.push({
                point: 0,
                ...r
            })
            const sortedSelected = selection.sort()
            const qs = questions
            for (const s of sortedSelected) {
                const i = s.selectIndex
                const weights = qs[s.questionIndex].selections[i].weight
                for (const w of weights) {
                    const ri = points.findIndex((r) => r.id === w.for)
                    points[ri].point = points[ri].point + w.weight
                }
            }
            const sortedPoints = points.sort((a, b) => b.point - a.point)
            const resultTitle = sortedPoints.map((i) => i.title)
            const resultDesc = sortedPoints.map((i) => i.description)
            const id = uuid()
            ret.push({ id, createdAt, selected: rets, resultTitle, resultDesc })
        }
        const sortedRet = ret.sort((a, b) => b.createdAt - a.createdAt)
        res.status(200).json(sortedRet)
    } catch (e) {
        console.error(e)
    }
}
