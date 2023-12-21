const express = require("express")
const router = express.Router()
const scoreController = require('../../controllers/scoreController')

// Connection to access the models from the archive databases
const archive_db_1 = require('../../conn/conn_models').archive_db_1
const Score30082023 = archive_db_1.model('scores30082023')

// @route GET api/scores30082023
// @route Get All scores
// @route Public
router.get('/', scoreController.getAllScores(Score30082023))

// @route   GET /api/scores30082023/quiz-creator/:id
// @desc    Get all scores by creator
// @access  Public:
router.get('/quiz-creator/:id', scoreController.getQuizCreator(Score30082023))

// @route   GET /api/scores30082023/:id
// @desc    Get one score
// @access  Private
router.get('/one-score/:id', scoreController.getOneScore(Score30082023))

// @route   GET /api/scores30082023/ranking/:id
// @desc    Get one score
// @access  Public
router.get('/ranking/:id', scoreController.getRanking(Score30082023))

// @route   GET /api/scores30082023/popular-quizes
// @desc    Get popular quizes
// @access  Public
router.get('/popular-quizes', scoreController.getPopularQuizes(Score30082023))

// @route   GET /api/scores30082023/popular
// @desc    Get popular quizes
// @access  Public
router.get('/monthly-user', scoreController.getMonthlyUser(Score30082023))

// @route   GET /api/scores30082023/taken-by/:id
// @desc    Get all scores by taker
// @access  Private
router.get('/taken-by/:id', scoreController.getScoresTakenBy(Score30082023))

module.exports = router