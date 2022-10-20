import AWS from 'aws-sdk'
import moment from 'dayjs'
import fs from 'fs'
import { S3_PRIVATE } from '../secret'

export default async function main(path: string) {
	const config = process.env
	const target = `https://${config.CLOUDFRONT}/${path}`
	const expires = moment().add(1, 'days').unix()
	const privKey = S3_PRIVATE.replace(/\\n/g, '\n') || ''
	console.log('use this key')
	console.log(privKey)
	const url = await getSignedUrlAsync(config.CLOUDFRONT_KEYPAIR || '', privKey, {
		url: target,
		expires,
	})
	return url as string
}
function getSignedUrlAsync(keypairId: string, privateKey: string, options: AWS.CloudFront.Signer.SignerOptionsWithPolicy | AWS.CloudFront.Signer.SignerOptionsWithoutPolicy) {
	return new Promise((resolve, reject) => {
		// Signerインスタンスを生成
		const signer = new AWS.CloudFront.Signer(keypairId, privateKey)
		// URL生成
		signer.getSignedUrl(options, (err, url) => {
			if (err) {
				reject(err)
			}
			resolve(url)
		})
	})
}
