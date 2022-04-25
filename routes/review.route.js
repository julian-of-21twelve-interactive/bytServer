const express = require('express')
const router = express.Router()
const validate = require('../validations/validator')
const {
	addReviewRules,
	updateReviewRules,
} = require('../validations/review.validation')

const {
	getAllReviews,
	getReview,
	getReviewByReviewerId,
	getReviewByRestaurantId,
	addReview,
	updateReview,
	deleteReview,
	upVoteReview,
	downVoteReview,
	searchReview,
} = require('../controllers/review.controller')

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')

const Review = require('../models/review.model')
const { searchByFieldRules } = require('../validations/common.validation')
const upload = require('../utils/fileUpload')
const { permit } = require('../middlewares/permission.middleware')

router.param('reviewId', validateObjectId('reviewId'))

router.get('/', isAuthenticated(true), getAllReviews)
router.post(
	'/',
	isAuthenticated(),
	permit,
	upload.array('image', 3),
	addReviewRules,
	validate,
	addReview,
)

router.post('/search', searchByFieldRules(Review), validate, searchReview)

router.get('/up_vote/:reviewId', isAuthenticated(), permit, upVoteReview)
router.get('/down_vote/:reviewId', isAuthenticated(), permit, downVoteReview)
router.get('/:reviewId', getReview)
router.get(
	'/user/:reviewerId',
	validateObjectId('reviewerId'),
	getReviewByReviewerId,
)
router.get(
	'/restaurant/:restaurantId',
	isAuthenticated(true),
	validateObjectId('restaurantId'),
	getReviewByRestaurantId,
)
router.put(
	'/:reviewId',
	isAuthenticated(),
	permit,
	upload.array('image', 3),
	updateReviewRules,
	validate,
	updateReview,
)
router.delete('/:reviewId', isAuthenticated(), permit, deleteReview)

module.exports = router
