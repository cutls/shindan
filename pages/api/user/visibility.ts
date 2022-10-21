// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '../../../utils/db'
import { getSession } from 'next-auth/react'
import { IShindanList } from '../../../interfaces/db'

type Data = {
	success: boolean
}
type Error = {
	error: boolean
	message: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
	try {
		const session = await getSession({ req })
		if (!session) return res.status(500).json({ error: true, message: 'ログインされていません' })
		const email = session.user?.email
		if (!email) return res.status(500).json({ error: true, message: 'ログインされていません' })
		const request = JSON.parse(req.body)
		const data = await db.get<IShindanList>('shindanList', request.id)
		if (data?.userMail !== email) return res.status(400).json({ error: true, message: 'この操作は不可能です' })
		await db.update(email, request.id, { status: 'private' })
		res.status(200).json({ success: true })
	} catch (e: any) {
		res.status(200).json({ error: true, message: e.toString() })
	}
	
}
