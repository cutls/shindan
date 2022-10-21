export default () => true
/*
import AWS from 'aws-sdk'
export default async () => {
    AWS.config.update({
        credentials: new AWS.Credentials(props.s3id, props.s3secret),
        region: props.s3region,
    })

    setLoading(true)
    const e: any = document.getElementById('file')
    if (!e) return showError('FileElementNotFound')
    const [file] = e.files
    const { name } = file
    const id = uuid()
    const b64 = (await readAsDataURL(file)) as string
    let b64Raw
    if (b64) b64Raw = b64.replace(/data:[^,]+,/, '')
    const buff = Buffer.from(b64, 'base64')
    // Use S3 ManagedUpload class as it supports multipart uploads
    const upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: 'cutls-shindan',
            Key: `${id}/${name}.jpg`,
            Body: file,
            Metadata: {
                'Content-Type': 'image/jpeg'
            }
        },
    })
    upload.on('httpUploadProgress', function (evt) {
        setProgress(Math.floor((evt.loaded / evt.total) * 100))
    })

    const promise = upload.promise()

    promise.then(
        async function (data) {
            await registFileStore(`${id}/${name}.jpg`, name)
            alert('アップロードできました。')
            setLoading(false)
        },
        function (err: any) {
            return alert('アップロードに失敗しました: ' + err.message)
        }
    )
}

function readAsDataURL(blob: Blob) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result)
		}
		reader.onerror = () => {
			reject(reader.error)
		}
		reader.readAsDataURL(blob)
	})
}
*/