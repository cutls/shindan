import * as db from './db'
export default async (token: string | undefined) => {
    if(!token) return false
    try {
        const data = await db.get('credential', token)
        return !!data
    } catch {
        return false
    }
}