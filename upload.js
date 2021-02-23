const AWS = require('aws-sdk')

const Busboy = require('busboy')
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

const S3 = new AWS.S3()

exports.uploadHandler = async event => {
  try {
    const { files } = await parseMultipartFormData(event)
  
    if (fileIsEmpty(files)) {
      return {
        statusCode: 400,
      }
    }
  
    const uploadImages = files.map(async file => await uploadImage(file.content))
  
    await Promise.all(uploadImages)
  
    return {
      statusCode: 200,
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
    }
  }
}

const parseMultipartFormData = (event) =>
  new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    })
    const result = {
      files: []
    }

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const uploadFile = {}
    
      file.on('data', data => {
        uploadFile.content = data
      })

      file.on('end', () => {
        if (uploadFile.content) {
          uploadFile.filename = filename
          uploadFile.contentType = mimetype
          uploadFile.encoding = encoding
          uploadFile.fieldname = fieldname
          result.files.push(uploadFile)
        }
      })
    })

    busboy.on('field', (fieldname, value) => {
      result[fieldname] = value
    })

    busboy.on('error', error => {
      reject(error)
    })

    busboy.on('finish', () => {
      resolve(result)
    })

    const encoding = event.encoding || (event.isBase64Encoded ? 'base64' : 'binary')

    busboy.write(event.body, encoding)
    busboy.end()
})

const fileIsEmpty = file => !file || file.length === 0

const optmizedImage = async file => {
  const optmized = await sharp(file)
    .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
    .toFormat('jpeg', { progressive: true, quality: 50 })
    .toBuffer()
  
  return optmized
}

const uploadImage = async file => {
  const image = await optmizedImage(file)

  const fileParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${uuidv4()}.jpeg`,
    Body: image,
  }

  await S3.upload(fileParams).promise()
}
