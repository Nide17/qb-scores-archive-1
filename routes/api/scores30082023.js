const express = require("express")
const mongoose = require('mongoose')
const router = express.Router()

//Score Model : use capital letters since it's a model
const Score30082023 = require('../../models/Score30082023')
const Quiz = require('../../models/Quiz')
const Category = require('../../models/Category')
const User = require('../../models/User')

// @route GET api/scores
// @route Get All scores
// @route Private: accessed by authorization
router.get('/', async (req, res) => {

  // Pagination
  const totalPages = await Score30082023.countDocuments({})
  var PAGE_SIZE = 20
  var pageNo = parseInt(req.query.pageNo || "0")
  var query = {}

  query.limit = PAGE_SIZE
  query.skip = PAGE_SIZE * (pageNo - 1)

  try {

    const scores = pageNo > 0 ?
      await Score30082023.find({}, {}, query)
        .sort({ test_date: -1 })
        .populate('quiz category taken_by') :

        // AGGREGRATE AND ALLOW DISK USE
        await Score30082023.aggregate([
          {
            // Join with quiz collection
            $lookup:
            {
              from: "quizzes",
              localField: "quiz",
              foreignField: "_id",
              as: "quiz_scores"
            }
          },
          { $unwind: '$quiz_scores' },
          {
            // Join with users collection
            $lookup:
            {
              from: "users",
              localField: "taken_by",
              foreignField: "_id",
              as: "users_scores"
            }
          },
          { $unwind: '$users_scores' },

          {
            // Join with categories collection
            $lookup:
            {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category_scores"
            }
          },
          { $unwind: '$category_scores' },

          {
            // Decide what to return
            $project: {
              marks: 1,
              out_of: 1,
              _id: 1,
              id: 1,
              test_date: 1,
              review: 1,
              quiz_scores_title: '$quiz_scores.title',
              category_scores_title: '$category_scores.title',
              users_scores_name: '$users_scores.name',
            }
          }
        ]).allowDiskUse(true)

    if (!scores) throw Error('No scores exist')

    if (pageNo > 0) {
      return res.status(200).json({
        totalPages: Math.ceil(totalPages / PAGE_SIZE),
        scores
      })
    }
    else {
      return res.status(200).json({ scores })
    }

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

// @route   GET /api/scores/quiz-creator/:id
// @desc    Get all scores by taker
// @access  Private:
router.get('/quiz-creator/:id', async (req, res) => {

  try {
    Score30082023.aggregate([
      {
        // Join with quiz collection
        $lookup:
        {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz_scores"
        }
      },
      { $unwind: '$quiz_scores' },

      // Match only scores of the quiz creators
      { $match: { 'quiz_scores.created_by': new mongoose.Types.ObjectId(req.params.id) } },
      {
        // Join with users collection
        $lookup:
        {
          from: "users",
          localField: "taken_by",
          foreignField: "_id",
          as: "users_scores"
        }
      },
      { $unwind: '$users_scores' },
      {
        // Join with categories collection
        $lookup:
        {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category_scores"
        }
      },
      { $unwind: '$category_scores' },
      {
        // Decide what to return
        $project: {
          marks: 1,
          out_of: 1,
          _id: 0,
          test_date: 1,
          quiz_scores_title: '$quiz_scores.title',
          category_scores_title: '$category_scores.title',
          users_scores_name: '$users_scores.name',
        }
      }
    ]).exec(function (err, scores) {
      if (err) return err
      res.json(scores)
    }
    )

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve: ' + err.message
    })
  }

})

// @route   GET /api/scores/:id
// @desc    Get one score
// @access  Private
router.get('/one-score/:id', async (req, res) => {

  let id = req.params.id
  try {
    //Find the score by id
    const score = await Score30082023.findOne({ id }).populate('category quiz taken_by')

    if (!score) throw Error('No score found')

    res.status(200).json(score)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }
})

// @route   GET /api/scores/ranking/:id
// @desc    Get one score
// @access  Public
router.get('/ranking/:id', async (req, res) => {

  let id = req.params.id
  try {
    //Find the scores by id
    const scores = await Score30082023.find({ quiz: id })
      .sort({ marks: -1 })
      .limit(20)
      .select('quiz taken_by category id marks out_of')
      .populate('quiz taken_by category')

    if (!scores) throw Error('No scores found')

    res.status(200).json(scores)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }
})

// @route   GET /api/scores/popular-quizes
// @desc    Get popular quizes
// @access  Public
router.get('/popular-quizes', async (req, res) => {

  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  try {
    await Score30082023.aggregate([
      {
        // Join with quiz collection
        $lookup:
        {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz_scores"
        }
      },
      // First Stage: today's scores
      {
        $match: { "test_date": { $gte: startOfToday } }
      },
      { $unwind: '$quiz_scores' },
      // Second Stage: group
      {
        $group: {
          _id: { qId: "$quiz_scores._id", qTitle: "$quiz_scores.title", slug: "$quiz_scores.slug" },
          count: { $sum: 1 }
        }
      },
      // Third Stage: sort by count
      {
        $sort: { count: -1 }
      },
      // Fourth Stage: only top 3
      { $limit: 3 }
    ]).exec(function (err, scores) {
      if (err) return err
      res.json(scores)
    })

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route   GET /api/scores/popular
// @desc    Get popular quizes
// @access  Public
router.get('/monthly-user', async (req, res) => {

  var now = new Date();
  var startOfMonth = new Date(now.getFullYear(), now.getMonth())

  try {
    await Score30082023.aggregate([
      {
        // Join with quiz collection
        $lookup:
        {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz_scores"
        }
      },
      {
        // Join with quiz collection
        $lookup:
        {
          from: "users",
          localField: "taken_by",
          foreignField: "_id",
          as: "taken_by_scores"
        }
      },
      // First Stage: today's scores
      {
        $match: { "test_date": { $gte: startOfMonth } }
      },
      // Second Stage: unwinding or populating
      { $unwind: '$quiz_scores' },
      { $unwind: '$taken_by_scores' },
      // Third stage: matching visitors and creators
      {
        $match: {
          "taken_by_scores.role": {
            $in: ['Visitor', 'Creator']
          }
        }
      },
      // Fourth Stage: group
      {
        $group: {
          _id: { uId: "$taken_by_scores._id", uEmail: "$taken_by_scores.email", uName: "$taken_by_scores.name", uPhoto: "$taken_by_scores.image" },
          count: { $sum: 1 }
        }
      },
      // Fifth Stage: sort by count
      {
        $sort: { count: -1 }
      },
      // Six Stage: only top 3
      { $limit: 1 }
    ]).exec(function (err, scores) {
      if (err) return err
      res.json(scores[0])
    })

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route   GET /api/scores/taken-by/:id
// @desc    Get all scores by taker
// @access  Private
router.get('/taken-by/:id', async (req, res) => {

  let id = req.params.id
  try {
    //Find the scores by id
    const scores = await Score30082023.find({ taken_by: id }).populate('category quiz taken_by')

    if (!scores) throw Error('No scores found')

    res.status(200).json(scores)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

module.exports = router