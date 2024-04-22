import { validationResult } from 'express-validator'

const validate = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    const errorMsg = result.array()[0].msg

    return res.status(400).json({ message: errorMsg })
  }

  next()
}

export default { validate }
