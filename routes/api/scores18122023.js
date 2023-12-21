const express = require("express")
const router = express.Router()
const scoreController = require('../../controllers/scoreController')

// Connection to access the models from the archive databases
const archive_db_2 = require('../../conn/conn_models').archive_db_2
const Score18122023 = archive_db_2.model('scores18122023')

// @route GET api/scores18122023
// @route Get All scores
// @route Public
router.get('/', scoreController.getAllScores(Score18122023))

// @route   GET /api/scores18122023/quiz-creator/:id
// @desc    Get all scores by creator
// @access  Public:
router.get('/quiz-creator/:id', scoreController.getQuizCreator(Score18122023))

// @route   GET /api/scores18122023/:id
// @desc    Get one score
// @access  Private
router.get('/one-score/:id', scoreController.getOneScore(Score18122023))

// @route   GET /api/scores18122023/ranking/:id
// @desc    Get one score
// @access  Public
router.get('/ranking/:id', scoreController.getRanking(Score18122023))

// @route   GET /api/scores18122023/popular-quizes
// @desc    Get popular quizes
// @access  Public
router.get('/popular-quizes', scoreController.getPopularQuizes(Score18122023))

// @route   GET /api/scores18122023/popular
// @desc    Get popular quizes
// @access  Public
router.get('/monthly-user', scoreController.getMonthlyUser(Score18122023))

// @route   GET /api/scores18122023/taken-by/:id
// @desc    Get all scores by taker
// @access  Private
router.get('/taken-by/:id', scoreController.getScoresTakenBy(Score18122023))

module.exports = router