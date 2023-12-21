// Bring in Mongo
const mongoose = require('mongoose');

//initialize Mongo schema
const Schema = mongoose.Schema;

// create a schema object
const ScoreSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    marks: {
        type: Number,
        required: true
    },
    out_of: {
        type: Number,
        required: true
    },
    test_date: {
        type: Date,
        default: Date.now
    },
    review: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        questions: [
            {
                questionText: {
                    type: String,
                    required: true
                },
                question_image: String,
                answerOptions: {
                    type: [
                        {
                            answerText: {
                                type: String,
                                required: true
                            },
                            explanations: {
                                type: String,
                                required: false,
                                default: null
                            },
                            isCorrect: {
                                type: Boolean,
                                required: true,
                                default: false
                            },
                            choosen: {
                                type: Boolean,
                                required: true,
                                default: false
                            }
                        }
                    ]
                }
            }
        ]

    }, 
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'quiz'
    },
    taken_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

// Compound index example
ScoreSchema.index({ test_date: -1, quiz: 1 }); // Compound index on test_date and quiz

// Create indexes
ScoreSchema.index({ test_date: -1 }); // Index for sorting by test_date

// Indexes for population
ScoreSchema.index({ quiz: 1 }); // Index for populating quiz
ScoreSchema.index({ category: 1 }); // Index for populating category
ScoreSchema.index({ taken_by: 1 }); // Index for populating taken_by

// export the schema
module.exports = ScoreSchema