import mongoose from 'mongoose'

import Article from '../models/article.model.js'
import logger from '../helpers/logger.helper.js'

const createArticle = async (req, res) => {
  const { title, description, body, tags } = req.body
  const { _id, first_name, last_name } = req.user

  const wordsPerMinute = 200 //Average reading speed in words per minute
  const totalWords = body.split(/\s+/).length //Count number of words in the article
  const readTime = Math.ceil(totalWords / wordsPerMinute) //Calculate reading time

  try {
    //? As per project requirements, title is unique.
    //check if title exists
    const existingArticle = await Article.findOne({ title: title })

    if (existingArticle) {
      //winston logger
      logger.error({
        trace: 'src > controllers > article.controller.js > createArticle',
        error: 'The title of your article already exists.',
      })

      return res
        .status(400)
        .send({ message: 'The title of your article already exists.' })
    }

    await Article.create({
      title: title,
      description: description,
      body: body,
      author: `${first_name} ${last_name}`,
      authorID: _id,
      reading_time: readTime,
      tags: tags.split(','),
    })

    //winston logger
    logger.info({
      trace: 'src > controllers > article.controller.js > createArticle',
      success: 'Article created successfully.',
    })
    res.status(200).send({ message: 'Created.' })
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > createArticle',
      error: 'error',
    })

    res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const getAllArticles = async (req, res) => {
  const page = parseInt(req.query.page) - 1 || 0,
    limit = 20,
    { search, order } = req.query

  let { sort } = req.query

  const searchQuery = new RegExp(search, 'i')

  //*sort articles by read_count, reading_time, or timestamp
  const sortOptions = {}

  sort === 'timestamp' && (sort = 'createdAt')
  if (
    sort === 'read_count' ||
    sort === 'reading_time' ||
    sort === 'createdAt'
  ) {
    sortOptions[sort] = order === 'asc' ? 1 : order === 'desc' ? -1 : 1 //default to ascending order if (sort) order is not provided
  }

  try {
    const articles = await Article.find({
      //*search the DB collection using the author, title, and tags field for "search query" if any
      $or: [
        { author: searchQuery },
        { title: searchQuery },
        { tags: { $in: [searchQuery] } },
      ],
      state: 'published',
    })
      .sort(sortOptions)
      .skip(page * limit)
      .limit(limit)

    if (articles.length == 0) {
      //winston logger
      logger.info({
        trace: 'src > controllers > article.controller.js > getAllArticles',
        message: 'There are no published articles.',
      })

      return res.status(404).send({
        message:
          "It's empty here, there are no published articles at the moment.",
      })
    }

    //winston logger
    logger.info({
      trace: 'src > controllers > article.controller.js > getAllArticles',
      success: 'Get articles successful.',
    })

    res.status(200).send(articles)
  } catch (error) {
    //winston logger
    logger.info({
      trace: 'src > controllers > article.controller.js > getAllArticles',
      error: error,
    })

    res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const getOneArticle = async (req, res) => {
  const id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(id)) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > getOneArticle',
      error: 'Invalid id for the article.',
    })

    return res
      .status(404)
      .send({ message: 'Oops! That article does not exist.' })
  }

  try {
    const article = await Article.findById(id)

    if (!article) {
      //winston logger
      logger.error({
        trace: 'src > controllers > article.controller.js > getOneArticle',
        error: 'There are no published articles with provided id.',
      })

      return res
        .status(404)
        .send({ message: 'Oops! That article does not exist.' })
    }

    //check if article is published
    if (article.state !== 'published')
      return res
        .status(404)
        .send({ message: 'That article has not been published.' })

    //extract author information
    //? I feel this is redundant, as author information is contained in the article object. But satisfies the requirement of the project.
    const { author, authorID, read_count } = article

    //update read count of article
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        read_count: read_count + 1,
      },
      { new: true }
    )

    //winston logger
    logger.info({
      trace: 'src > controllers > article.controller.js > getOneArticle',
      success: 'Get article successful. Article read count updated.',
    })

    res
      .status(200)
      .send({ article: updatedArticle, author: { author, authorID } })
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > getOneArticle',
      error: error,
    })

    res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const deleteArticle = async (req, res) => {
  const id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(id)) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > deleteArticle',
      error: 'Invalid id for the article.',
    })

    return res.status(404).send({ message: 'Could not find that article.' })
  }

  try {
    //check if the article exists
    const article = await Article.findById(id)

    if (!article) return res.status(404).send({ message: 'Article not found.' })

    //check if the article is authored by the current user
    if (article.authorID.toString() !== req.user._id.toString()) {
      //winston logger
      logger.error({
        trace: 'src > controllers > article.controller.js > deleteArticle',
        error: 'User is not the owner of the article.',
      })

      return res
        .status(403)
        .send({ message: 'You are not authorized to delete this article.' })
    }

    //delete the article
    await article.deleteOne()

    //winston logger
    logger.info({
      trace: 'src > controllers > article.controller.js > deleteArticle',
      success: 'Article deleted.',
    })

    res.status(200).send({ message: 'Article deleted.' })
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > deleteArticle',
      error: error,
    })

    res.status(500).send({ message: 'Something went wrong.', error })
  }
}

const updateArticle = async (req, res) => {
  if (Object.keys(req.body).length === 0)
    return res.status(400).send({ message: "There's nothing to be updated." })

  const id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(id)) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > updateArticle',
      error: 'Article deleted.',
    })

    return res.status(404).send({ message: 'Could not find that article.' })
  }

  try {
    const article = await Article.findByIdAndUpdate(id, req.body, { new: true })

    //check if the article is authored by the current user
    if (article.authorID.toString() !== req.user._id.toString()) {
      //winston logger
      logger.error({
        trace: 'src > controllers > article.controller.js > updateArticle',
        error: 'Invalid id for the article.',
      })

      return res
        .status(403)
        .send({ message: 'You are not authorized to update this article.' })
    }

    //winston logger
    logger.info({
      trace: 'src > controllers > article.controller.js > updateArticle',
      success: 'Article updated.',
    })

    res.status(200).send({ message: 'Article updated.', article })
  } catch (error) {
    //winston logger
    logger.error({
      trace: 'src > controllers > article.controller.js > updateArticle',
      error: error,
    })

    res.status(500).send({ message: 'Something went wrong.', error })
  }
}

export default {
  createArticle,
  getAllArticles,
  getOneArticle,
  deleteArticle,
  updateArticle,
}
