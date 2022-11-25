import * as db from '../../utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'
import { ISelected } from '../../interfaces/common'
import { v4 as uuid } from 'uuid'

interface IParam {
    id: string
    selection: ISelected[]
}
interface ILog {
    createdAt: number
    selection: ISelected[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<{} | Error>) {
    try {
        const request: IParam = JSON.parse(req.body)
        const { id, selection } = request
        const createdAt = dayjs().unix()
        const got = await db.get<ILog[]>('logs', id)
        const uid = uuid()
        if (got) {
            const newGot = JSON.parse(JSON.stringify(got))
            newGot[uid] = { selection, createdAt }
            await db.update('logs', id, got)
        } else {
            await db.put('logs', id, { [uid]: { selection, createdAt } })
        }
        return res.status(200).json({} || { error: true, message: 'unknown error' })
    } catch (e: any) {
        if (e.length > 1) return res.status(e[0]).json(e[1])
        console.error(e)
    }
}