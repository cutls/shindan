import { parseCookies } from 'nookies'
interface IError {
	error: true
	message?: string
}
export const get = async <T>(url: string) => {
	try {
		const options: any = {}
		const cks = parseCookies()
		if (cks.accessToken) options.headers = { Authorization: cks.accessToken }
		const data = await (await fetch(url, options)).json()
		if (data.error) return { data: undefined, error: data as IError }
		const typed = data as T
		return { data: typed, error: undefined }
	} catch {
		const error: IError = { error: true, message: 'Internal System Error of Frontend' }
		return { data: undefined, error }
	}
}
export const post = async <T>(url: string, send: any) => {
	try {
		const options: any = { method: 'post', body: JSON.stringify(send) }
		const cks = parseCookies()
		if (cks.accessToken) options.headers = { Authorization: cks.accessToken }
		const data = await (await fetch(url, options)).json()
		if (data.error) return { data: undefined, error: data as IError }
		const typed = data as T
		return { data: typed, error: undefined }
	} catch {
		const error: IError = { error: true, message: 'Internal System Error of Frontend' }
		return { data: undefined, error }
	}
}
