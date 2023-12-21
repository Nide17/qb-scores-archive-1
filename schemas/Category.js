// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const CategorySchema = new Schema({
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
  quizes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'quiz'
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  courseCategory: {
    type: Schema.Types.ObjectId,
    ref: 'courseCategory'
  }
});

// Create indexes for the Category model
CategorySchema.index({ courseCategory: 1 }); // Index for populating courseCategory

//Category: the name of this schema
module.exports = CategorySchema