import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import User from '../models/user.model.js'
import Article from '../models/article.model.js'
import logger from '../helpers/logger.helper.js'

dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })

    //check if user (with email) exists
    if (!user) {
      //winston logger
      logger.info({
        trace: 'src > controllers > user.controller.js > login',
        message: 'Email does not exist.',
      })

      return res.status(401).send({
        message: 'An account with that email does not exist. Sign up instead.',
      })
    }

    //validate password
    const isValid = await compare(password, user.password)

    if (!isValid) {
      return res.status(401).send({ message: 'Email or password incorrect.' })
    }

    //on success, sign jwt
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' })

    //winston logger
    logger.info({
      trace: 'src > controllers > user.controller.js > login',
      success: 'Login successful. JWT signed.',
    })

    res.status(200).send({ message: 'Logged in.', token: 'Bearer ' + token })
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > user.controller.js > login',
      error: error,
    })

    return res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body

  //check if email already exists
  const user = await User.findOne({ email: req.body.email })

  if (user) {
    //winston logger
    logger.info({
      trace: 'src > controllers > user.controller.js > signup',
      message: 'Email already exists.',
    })

    return res.status(401).send({
      message: 'An account with that email already exists. Login instead.',
    })
  }

  //hash password
  const hashedPassword = await hash(password, 13)

  //create new user
  try {
    await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
    })

    //sign jwt
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' })

    //winston logger
    logger.info({
      trace: 'src > controllers > user.controller.js > signup',
      success: 'Sign up successful. JWT signed.',
    })

    res.status(200).send({ message: 'Signed up.', token: 'Bearer ', token })
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > user.controller.js > signup',
      error: error,
    })

    return res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const getUserArticles = async (req, res) => {
  const id = req.params.id,
    state = req.query.state,
    page = parseInt(req.query.page) - 1 || 0,
    limit = 20

  if (!mongoose.Types.ObjectId.isValid(id)) {
    //winston logger
    logger.info({
      trace: 'src > controllers > user.controller.js > getUserArticles',
      message: 'Invalid id for user',
    })

    return res.status(404).send({ message: 'Author does not exist.' })
  }

  const query = { authorID: id }

  if (state === 'draft' || state === 'published') {
    query.state = state
  }

  try {
    const articles = await Article.find(query)
      .skip(page * limit)
      .limit(limit)

       //winston logger
    logger.info({
      trace: 'src > controllers > user.controller.js > getUserArticles',
      success: 'Get user articles successful.',
    })

    res.status(200).send(articles)
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > user.controller.js > getUserArticles',
      error: error,
    })

    return res.status(500).send({ message: 'Something went wrong.', error })
  }
}

export default { login, signup, getUserArticles }
