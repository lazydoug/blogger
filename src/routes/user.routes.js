import express from 'express'
import { body } from 'express-validator'

import requestHandler from '../handlers/request.handler.js'
import userController from '../controllers/user.controller.js'

const router = express.Router()

//login
router.post(
  '/login',
  body('email')
    .exists()
    .withMessage('Email cannot be empty.')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
    .withMessage('Enter a valid email address.'),

  body('password')
    .exists()
    .withMessage('Password cannot be empty.')
    .isLength({ min: 8 })
    .withMessage('Password must be a minimum of 8 characters.'),

  requestHandler.validate,
  userController.login
)

//signup
router.post(
  '/signup',
  body('firstName').exists().withMessage('First name is required.'),
  body('lastName').exists().withMessage('Last name is required.'),
  body('email')
    .exists()
    .withMessage('Email is required.')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
    .withMessage('Email address is not valid.'),
  body('password')
    .exists()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be a minimum of 8 characters.'),
  body('confirmPassword')
    .exists()
    .withMessage(
      "Please confirm your password by re-entering it in the 'Confirm Password' field."
    )
    .custom((confirmPassword, { req }) => {
      const { password } = req.body

      if (password !== confirmPassword) {
        throw new Error('Password and confirm password fields do not match.')
      }

      return true
    }),

  requestHandler.validate,
  userController.register
)

//get user articles
router.get('/:id/articles', userController.getUserArticles)

export default router
