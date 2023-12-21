/**
 * scoreController.js
 * 
 * This file contains the controller for the scores archives
 * 
 * Parameters:
 *  model: The model to be used for the scores archives
 * 
 * Returns:
 *  The scores archives controller object
 */

// @route GET api/scores
// @route Get All scores
// @route Public
const getAllScores = (model) => async (req, res) => {

    // Pagination
    var PAGE_SIZE = 20
    var pageNo = parseInt(req.query.pageNo || "0")
    var query = {}

    query.limit = PAGE_SIZE
    query.skip = PAGE_SIZE * (pageNo - 1)

    try {
        const scores = pageNo > 0 ?

            await model.find({}, {}, query)
                .sort({ test_date: -1 })
                .populate('quiz category taken_by') :

            await model.find({})
                .lean()
                .sort({ test_date: -1 })
                .select('quiz taken_by category id marks out_of test_date')
                .populate({
                    path: 'quiz',
                    select: 'title category slug',
                    options: { lean: true }
                })
                .populate({
                    path: 'category',
                    select: 'title courseCategory',
                    options: { lean: true }
                })
                .populate({
                    path: 'taken_by',
                    select: 'name email',
                    options: { lean: true }
                });

        if (!scores) throw Error('No scores exist')

        if (pageNo > 0) {
            const totalPages = await model.countDocuments({})

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
}


// @route   GET /api/scores/:id
// @desc    Get one score
// @access  Public
const getOneScore = (model) => async (req, res) => {

    let id = req.params.id

    try {
        //Find the score by id
        const score = await model.findOne({ id }).populate('category quiz taken_by')

        if (!score) throw Error('No score found')

        res.status(200).json(score)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
}

// @route   GET /api/scores/ranking/:id
// @desc    Get ranking
// @access  Public
const getRanking = (model) => async (req, res) => {

    let id = req.params.id

    try {
        //Find the scores by id
        const scores = await model.find({ quiz: id })
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
}

// @route   GET /api/scores/popular-quizes
// @desc    Get popular quizes
// @access  Public
const getPopularQuizes = (model) => async (req, res) => {

    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    try {
        await model.aggregate([
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
}

// @route   GET /api/scores/monthly-user
// @desc    Get monthly user
// @access  Public
const getMonthlyUser = (model) => async (req, res) => {

    var now = new Date();
    var startOfMonth = new Date(now.getFullYear(), now.getMonth())

    try {
        await model.aggregate([
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
}

// @route   GET /api/scores/quiz-creator/:id
// @desc    Get all scores by taker
// @access  Public
const getQuizCreator = (model) => async (req, res) => {

    let id = req.params.id

    try {
        //Find the scores by id
        const scores = await model.find({ quiz: id }).populate('category quiz taken_by')

        if (!scores) throw Error('No scores found')

        res.status(200).json(scores)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
}

// @route   GET /api/scores/taken-by/:id
// @desc    Get all scores by taker
// @access  Public
const getScoresTakenBy = (model) => async (req, res) => {

    let id = req.params.id

    try {
        //Find the scores by id
        const scores = await model.find({ taken_by: id }).populate('category quiz taken_by')

        if (!scores) throw Error('No scores found')

        res.status(200).json(scores)

    } catch (err) {
        res.status(400).json({
            msg: 'Failed to retrieve! ' + err.message
        })
    }
}

module.exports = {
    getAllScores,
    getOneScore,
    getRanking,
    getPopularQuizes,
    getMonthlyUser,
    getScoresTakenBy,
    getQuizCreator
}