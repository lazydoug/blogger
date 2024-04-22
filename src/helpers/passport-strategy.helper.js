import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import dotenv from 'dotenv'

import User from '../models/user.model.js'

dotenv.config()

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
}

passport.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      const { _id, first_name, last_name } = await User.findOne({
        email: jwt_payload.email,
      })

      const user = { _id, first_name, last_name }

      if (!user) return done(null, false)

      return done(null, user)
    } catch (error) {
      return done(error, false)
    }
  })
)

export default passport
