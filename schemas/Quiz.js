// Bring in Mongo
const mongoose = require('mongoose')

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const QuizSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  creation_date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'category'
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'question'
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  video_links: {
    type: [
      {
        vtitle: {
          type: String,
          required: true
        },
        vlink: {
          type: String,
          required: true
        }
      }
    ]
  }
})

// Create indexes for the Quiz model
QuizSchema.index({ category: 1 }); // Index for populating category

//Quiz: the name of this schema
module.exports = QuizSchema