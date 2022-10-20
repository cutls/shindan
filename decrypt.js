const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const main = () => {
    const data = fs.readFileSync('firebase-encrypted.txt').toString()
	const algorithm = 'aes-128-cbc'
	const decipher = crypto.createDecipheriv(algorithm, process.env.SERVICE_ENCRYPTION_KEY, process.env.SERVICE_ENCRYPTION_IV)
	let decrypted = decipher.update(data, 'base64', 'utf8')
	decrypted += decipher.final('utf8')
    const data2 = fs.readFileSync('aws-encrypted.txt').toString()
	const decipher2 = crypto.createDecipheriv(algorithm, process.env.SERVICE_ENCRYPTION_KEY, process.env.SERVICE_ENCRYPTION_IV)
	let decrypted2 = decipher2.update(data2, 'base64', 'utf8')
	decrypted2 += decipher2.final('utf8')

    fs.writeFileSync('secret.ts', `export const FIREBASE_PRIVATE = '${decrypted}'; export const S3_PRIVATE = '${decrypted2}'`)
}
main()