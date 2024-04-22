import mongoose from 'mongoose'

const Schema = mongoose.Schema

const articleSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: String, required: true },
    authorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    state: { type: String, enum: ['draft', 'published'], default: 'draft' },
    read_count: { type: Number, default: 0 },
    reading_time: { type: Number },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

const Article = mongoose.model('Article', articleSchema)

export default Article
