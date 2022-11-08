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
		return await core(JSON.parse(req.body), req)
	} catch (e: any) {
		if(e.length > 1) return res.status(e[0]).json(e[1])
		console.error(e)
	}
}
export const core = async (request: any, req?: NextApiRequest) => {
	try {
		const { id } = request
		if (!id) throw [400, { error: true, message: 'no shindan id found in request' }]
		const list = await db.get<IShindanList>('shindanList', id)
		if (!list?.userMail) throw [400, { error: true, message: 'no shindan creator found error' }]
		const data = await db.get<IShindan>(list?.userMail, list.shindanId)
		if (data?.status === 'draft' && req) {
			const session = await getSession({ req })
			if (!session) throw [500, { error: true, message: 'ログインされていません。閲覧権限がありません。' }]
			const email = session.user?.email
			if (email !== list.userMail) throw [500, { error: true, message: '閲覧権限がありません。' }]
		}
		if (!data) throw [400, { error: true, message: 'no shindan found error' }]
		return data
	} catch (e) {
		console.error(e)
	}
}