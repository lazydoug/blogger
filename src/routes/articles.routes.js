import { Router } from 'express'
import { body } from 'express-validator'
import passport from 'passport'

import '../helpers/passport-strategy.helper.js'
import Article from '../models/article.model.js'
import requestHandler from '../handlers/request.handler.js'
import articleController from '../controllers/article.controller.js'
import { CustomValidation } from 'express-validator/src/context-items/custom-validation.js'

const router = Router()

//returns all published blog articles
router.get('/', articleController.getAllArticles)

//returns a published blog article
router.get('/:id', articleController.getOneArticle)

//create a new blog article
router.post(
  '/create',
  passport.authenticate('jwt', { session: false }),

  body('title').exists().withMessage('Title is required.'),
  body('description').exists().withMessage('Description is required.'),
  body('body').exists().withMessage('Body content is required.'),
  body('tags').exists().withMessage('Tags are required.'),

  requestHandler.validate,
  articleController.createArticle
)

//update an article
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  body('state')
    .optional()
    .trim()
    .isIn(['draft', 'published'])
    .withMessage(
      "Invalid state. Please ensure the article state is either 'draft' or 'published'."
    ),

  requestHandler.validate,
  articleController.updateArticle
)

//delete an article
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  articleController.deleteArticle
)

export default router
