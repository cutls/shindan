// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '../../../utils/db'
import { getSession } from 'next-auth/react'
import { IQuestion, IResult, IShindanList } from '../../../interfaces/db'
import { v4 as uuid } from 'uuid'

type Data = {
    success: boolean
    id: string
}
type Error = {
    error: boolean
    message: string
}
interface IParam {
    name: string
    resultText: string
    results: IResult[]
    questions: IQuestion[]
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
    try {
        const session = await getSession({ req })
        if (!session) return res.status(500).json({ error: true, message: 'ログインされていません' })
        const email = session.user?.email
        if (!email) return res.status(500).json({ error: true, message: 'ログインされていません' })
        const request: IParam = JSON.parse(req.body)
        const { name, results, questions, resultText } = request
        if (!name || !results.length || !questions.length) return res.status(500).json({ success: false, id: `` })
        const id = uuid()
        const listId = uuid()
        const set = {
            id, name, results, questions, status: 'draft', listId, resultText
        }
        await db.put(email, id, set)
        const listData = {
            id: listId,
            userMail: email,
            shindanId: id
        }
        await db.put(`shindanList`, listId, listData)
        res.status(200).json({ success: true, id: listId })
    } catch (e: any) {
        res.status(200).json({ error: true, message: e.toString() })
    }

}
