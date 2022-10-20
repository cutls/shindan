import * as db from '../../../utils/db'
import sign from '../../../utils/getSigned'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import authCheck from '../../../utils/authCheck'
import { IShindan } from '../../../interfaces/db'

interface LoginError {
	error: boolean
	message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IShindan[] | LoginError>) {
	try {
		const { authorization } = req.headers
		console.log(authorization)
		const session = await getSession({ req })
		const email = session?.user?.email
		if (!email || !(await authCheck(authorization))) return res.status(400).json({ error: true, message: 'auth error' })
		const list = await db.list<IShindan>(email)
		res.status(200).json(list)
	} catch (e) {
		console.error(e)
	}
}
