import express from 'express'

import userRoute from './user.routes.js'
import articlesRoute from './articles.routes.js'

const router = express.Router()

router.use('/user', userRoute)
router.use('/articles', articlesRoute)

export default router
