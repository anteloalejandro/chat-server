import { Router } from 'express'
import  fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

export const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const upload = multer({dest: '/tmp'})

router.post('/image', upload.single("image"), async function (req, res) {
  try {
    if (!req.token)
      throw new Error('You must sign-in first')

    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const tmpPath = req.file.path
    const target = path.join(__dirname, '../public/img/uploads', req.file.originalname)

    const ext = path.extname(target).toLowerCase()
    const validExts = /\.(png|jpe?g|gif|bmp|webp)$/
    if (!validExts.test(ext))
      throw new Error('File is not an image')

    fs.rename(tmpPath, target, err => {
      if (err) throw err

      res.send({error: false, filename: req.file.originalname})
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})
