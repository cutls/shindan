// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '../../../utils/db'
import { getSession } from 'next-auth/react'
import { IQuestion, IResult, IShindan } from '../../../interfaces/db'

type Data = {
    id: string
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
    id: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
    try {
        const session = await getSession({ req })
        if (!session) return res.status(500).json({ error: true, message: 'ログインされていません' })
        const email = session.user?.email
        if (!email) return res.status(500).json({ error: true, message: 'ログインされていません' })
        const request: IParam = JSON.parse(req.body)
        const { name, results, questions, id } = request
        if (!name || !results.length || !questions.length) return res.status(500).json({ success: false, id: '' })
        const data = await db.get<IShindan>(email, id)
        const set = {
            id, name, results, questions, status: 'draft'
        }
        await db.update(email, id, set)
        res.status(200).json({ success: true,  id: data?.listId || ''})
    } catch (e: any) {
        res.status(200).json({ error: true, message: e.toString() })
    }

}
