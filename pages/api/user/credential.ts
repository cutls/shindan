import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '../../../utils/db'
import { getSession } from 'next-auth/react'

export interface Data {
	skipable: boolean
}
export interface LoginError {
	error: boolean
	message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | LoginError>) {
	const session = await getSession({ req })
	if (!session) return res.status(500).json({ error: true, message: 'ログインされていません' })
	const email = session.user?.email
	if (!email) return res.status(500).json({ error: true, message: 'ログインされていません' })
	try {
		const user = await db.get('user', email)
		res.status(200).json({ skipable: !!user })
	} catch (e) {
		console.log(e)
		res.status(200).json({ skipable: false })
	}
}
