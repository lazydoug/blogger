import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import passport from 'passport'

import routes from './src/routes/index.js'
import logger from './src/helpers/logger.helper.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.use(passport.initialize())

app.use('/api/v1', routes)

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() =>
    app.listen(PORT, () => {
      //winston logger
      logger.info(`DB Connected. Server listening on ${PORT}`)

      console.log(`DB Connected. Server listening on ${PORT}`)
    })
  )
  .catch(err => {
    //winston logger
    logger.error(err)

    console.log(err)
  })
