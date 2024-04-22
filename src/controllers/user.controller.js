import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import User from '../models/user.model.js'
import Article from '../models/article.model.js'

dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })

    //check if user (with email) exists
    if (!user) {
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

    res.status(200).send({ message: 'Logged in.', token: 'Bearer ' + token })
  } catch (error) {
    return res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body

  //check if email already exists
  const user = await User.findOne({ email: req.body.email })

  if (user) {
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

    res.status(200).send({ message: 'Registered.', token: 'Bearer ', token })
  } catch (error) {
    return res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const getUserArticles = async (req, res) => {
  const id = req.params.id,
    state = req.query.state,
    page = parseInt(req.query.page) - 1 || 0,
    limit = 20

  if (mongoose.Types.ObjectId.isValid(id)) {
    const query = { authorID: id }

    if (state === 'draft' || state === 'published') {
      query.state = state
    }

    try {
      const articles = await Article.find(query)
        .skip(page * limit)
        .limit(limit)

      res.status(200).send(articles)
    } catch (error) {
      return res.status(500).send({ message: 'Something went wrong.', error })
    }
  } else {
    return res.status(404).send({ message: 'Author does not exist.' })
  }
}

export default { login, register, getUserArticles }
