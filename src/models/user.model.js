import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 8 },
  },
  { timestamps: true }
)

const User = mongoose.model('Users', userSchema)

export default User
