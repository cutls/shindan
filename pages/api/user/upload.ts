export default () => true // for avoid error of whole comment-outed TS file
/*import type { NextApiRequest, NextApiResponse } from 'next'
import * as db from '../../../utils/db'
import { getSession } from 'next-auth/react'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'

export interface Data {
	success: boolean
}
export interface LoginError {
	error: boolean
	message?: string
}
interface IRequest {
	subject: string
	path: string
	name: string
	newSubject?: string
	size: number
	year: number
	title: string
    category: string
}

export const bodyGuard = (item: any): item is IRequest => item.grade && item.subject && item.path

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | LoginError>) {
	const session = await getSession({ req })
	if (!session) return res.status(500).json({ error: true, message: 'ログインされていません' })
	const email = session.user?.email
	if (!email) return res.status(500).json({ error: true, message: 'ログインされていません' })
	const body = JSON.parse(req.body)
	if (!bodyGuard(body)) return res.status(500).json({ error: true, message: 'リクエストエラー' })
	const { subject, name, newSubject, grade, year, category } = body
	try {
		let useSubject = subject
		if (subject === 'others' && newSubject) {
			const id = uuid()
			await db.put('subject', id, { grade, name: newSubject })
			useSubject = newSubject
			delete body.newSubject
			body.subject = newSubject
		}
		const q = {
			grade,
			subject: useSubject,
			size: body.size,
			name,
			path: body.path,
			createdAtUnix: dayjs().unix(),
			creator: email,
			year,
            downloads: 0,
            category
		}
		await db.put(useSubject, name, q)
		res.status(200).json({ success: true })
	} catch (e) {
		console.log(e)
		res.status(200).json({ error: true })
	}
}
*/
