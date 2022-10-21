// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '../../../utils/db'
import { getSession } from 'next-auth/react'
import { IQuestion, IResult, IShindan, IShindanList } from '../../../interfaces/db'
import { v4 as uuid } from 'uuid'

type Data = {
    success: boolean
}
type Error = {
    error: boolean
    message: string
}
interface IParam {
    name: string
    results: IResult[]
    questions: IQuestion[]
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
    try {
        const session = await getSession({ req })
        if (!session) return res.status(500).json({ error: true, message: 'ログインされていません' })
        const email = session.user?.email
        if (!email) return res.status(500).json({ error: true, message: 'ログインされていません' })
        const request = JSON.parse(req.body)
        const { id } = request

        const data = await db.get<IShindan>(email, id)
        if (!data) return res.status(400).json({ error: true, message: 'no shindan id found in request' })
        const { results, questions, name } = data
        const shindanId = uuid()
        const set = {
            id: shindanId, name: `[複製] ${name}`, results, questions
        }
        await db.put(email, id, set)
        const listId = uuid()
        const listData = {
            id: listId,
            userMail: email,
            shindanId: shindanId
        }
        await db.put(`shindanList`, listId, listData)
        res.status(200).json({ success: true })
    } catch (e: any) {
        res.status(200).json({ error: true, message: e.toString() })
    }

}
