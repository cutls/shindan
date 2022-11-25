import * as db from '../../utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'

interface IParam {
    id: string
    selection: number[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<{} | Error>) {
    try {
        const request: IParam = JSON.parse(req.body)
        const { id, selection } = request
        const createdAt = dayjs().unix()
        await db.put('logs', id, { selection, createdAt })
        return res.status(200).json({} || { error: true, message: 'unknown error' })
    } catch (e: any) {
        if (e.length > 1) return res.status(e[0]).json(e[1])
        console.error(e)
    }
}