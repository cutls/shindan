import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { FIREBASE_PRIVATE } from '../secret'

const serviceAccount = {
	projectId: process.env.FIREBASE_PROJECTID,
	privateKey: FIREBASE_PRIVATE.replace(/\\n/g, '\n'),
	clientEmail: process.env.FIREBASE_CLIENTEMAIL,
}
if (!getApps().length) {
	initializeApp({
		credential: cert(serviceAccount),
	})
}
const db = getFirestore()
export const deleteItem = async (collection: string, doc: string) => {
	const docRef = db.collection(collection).doc(doc)
	await docRef.delete()
}
export const put = async (collection: string, doc: string, data: any) => {
	const docRef = db.collection(collection).doc(doc)
	await docRef.set(data)
}
export const update = async (collection: string, doc: string, data: any) => {
	const docRef = db.collection(collection).doc(doc)
	await docRef.update(data)
}
export const get = async<T>(collection: string, doc: string) => {
	const docRef = db.collection(collection).doc(doc)
	const d = await docRef.get()
	if (!d.exists) {
		return null
	} else {
		return d.data() as T
	}
}
export const list = async<T>(collection: string) => {
	const docRef = db.collection(collection)
	const d = await docRef.get()
	const list: T[] = []
	d.docs.map((item) => {
		const itemTyped = item.data() as T
		list.push(itemTyped)
	})
	return list
}