import * as db from '../../utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import { IShindan, IShindanList } from '../../interfaces/db'
import { getSession } from 'next-auth/react'
interface Error {
	error: boolean
	message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IShindan | Error>) {
	try {
		const request = JSON.parse(req.body)
		const { id } = request
		if (!id) return res.status(400).json({ error: true, message: 'no shindan id found in request' })
		const list = await db.get<IShindanList>('shindanList', id)
		if (!list?.userMail) return res.status(400).json({ error: true, message: 'no shindan creator found error' })
		const data = await db.get<IShindan>(list?.userMail, list.shindanId)
		if (data?.status === 'draft') {
			const session = await getSession({ req })
			if (!session) return res.status(500).json({ error: true, message: 'ログインされていません。閲覧権限がありません。' })
			const email = session.user?.email
			if (email !== list.userMail) return res.status(500).json({ error: true, message: '閲覧権限がありません。' })
		}
		if (!data) return res.status(400).json({ error: true, message: 'no shindan found error' })
		res.status(200).json(data)
	} catch (e) {
		console.error(e)
	}
}
