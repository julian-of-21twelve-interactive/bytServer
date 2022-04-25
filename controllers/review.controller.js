const { ObjectId } = require('mongodb')
const Review = require('../models/review.model')
const ReviewVote = require('../models/reviewVote.model')
const Restaurant = require('../models/restaurant.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const getAllReviews = async (req, res) => {
	try {
		const reviews = await paginate(req, Review, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'reviewvotes',
					let: { reviewId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$review', '$$reviewId'] },
										{ $eq: ['$reviewerId', { $toObjectId: req.user?.id }] },
									],
								},
							},
						},
					],
					as: 'reviewVote',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'reviewerId',
					foreignField: '_id',
					as: 'reviewerId',
				},
			},
			{
				$lookup: {
					from: 'menuitems',
					localField: 'item',
					foreignField: '_id',
					as: 'item',
				},
			},
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{
				$set: {
					item: { $cond: [{ $size: '$item' }, '$item', '$$REMOVE'] },
					isUpVoted: {
						$cond: [
							{ $eq: [{ $arrayElemAt: ['$reviewVote.voteType', 0] }, true] },
							true,
							false,
						],
					},
					isDownVoted: {
						$cond: [
							{ $eq: [{ $arrayElemAt: ['$reviewVote.voteType', 0] }, false] },
							true,
							false,
						],
					},
				},
			},
			{ $unset: ['reviewerId.salt', 'reviewerId.hash', 'reviewVote'] },
		])

		if (!reviews.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No reviews found',
				reviews_count: reviews.totalDocs,
			})
		} else {
			return res.status(200).json({
				status: 1,
				message: 'List of all reviews.',
				reviews_count: reviews.totalDocs,
				reviews,
			})
		}
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getReview = async (req, res) => {
	const review = await Review.aggregate([
		{ $match: { _id: ObjectId(req.params.reviewId) } },
		{
			$lookup: {
				from: 'users',
				localField: 'reviewerId',
				foreignField: '_id',
				as: 'reviewerId',
			},
		},
		{
			$lookup: {
				from: 'menuitems',
				localField: 'item',
				foreignField: '_id',
				as: 'item',
			},
		},
		{
			$set: {
				item: { $cond: [{ $size: '$item' }, '$item', '$$REMOVE'] },
			},
		},
		{
			$lookup: {
				from: 'restaurants',
				localField: 'restaurant',
				foreignField: '_id',
				as: 'restaurant',
			},
		},
		{ $unset: ['reviewerId.salt', 'reviewerId.hash'] },
	])

	if (!review.length) {
		return res.status(404).json({ status: 0, message: 'No reviews found' })
	} else {
		return res
			.status(200)
			.json({ status: 1, message: 'Review data.', review_details: review })
	}
}

const getReviewByReviewerId = async (req, res) => {
	const review = await Review.find({
		reviewerId: req.params.reviewerId,
	}).populate('reviewerId')
	if (!review) {
		console.log('running 2')
		return res.status(404).json({ status: 0, message: 'No Reviews Found' })
	} else if (review.length < 1) {
		return res
			.status(200)
			.json({ status: 1, message: 'No reviews have been made by this user' })
	} else {
		return res.status(200).json({
			status: 1,
			message: 'Review data.',
			reviews_count: review.length,
			review_details: review,
		})
	}
}

const getReviewByRestaurantId = async (req, res) => {
	try {
		const review = await paginate(req, Review, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'reviewvotes',
					let: { reviewId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$review', '$$reviewId'] },
										{ $eq: ['$reviewerId', { $toObjectId: req.user?.id }] },
									],
								},
							},
						},
					],
					as: 'reviewVote',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'reviewerId',
					foreignField: '_id',
					as: 'reviewerId',
				},
			},
			{
				$set: {
					isUpVoted: {
						$cond: [
							{ $eq: [{ $arrayElemAt: ['$reviewVote.voteType', 0] }, true] },
							true,
							false,
						],
					},
					isDownVoted: {
						$cond: [
							{ $eq: [{ $arrayElemAt: ['$reviewVote.voteType', 0] }, false] },
							true,
							false,
						],
					},
				},
			},
			{ $unset: ['reviewerId.hash', 'reviewerId.salt', 'reviewVote'] },
		])

		if (!review.totalDocs) {
			return res
				.status(404)
				.json({ status: 0, message: 'This restaurant has no reviews yet' })
		} else {
			return res.status(200).json({
				status: 1,
				message: 'List of all reviews by restaurant',
				reviews_count: review.totalDocs,
				review_details: review,
			})
		}
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const addReview = async (req, res) => {
	const { reviewerId, item, restaurant, description, rating, date } = req.body

	let checkReview = await Review.findOne({
		reviewerId,
		item,
	}).countDocuments()

	if (restaurant) {
		checkReview = await Review.findOne({
			reviewerId,
			restaurant,
		}).countDocuments()
	}

	if (checkReview > 0) {
		return res
			.status(400)
			.json({ status: 0, message: 'You already added a review for this' })
	}

	const image = req.files?.map((file) => file.path)

	const review = new Review({
		reviewerId,
		item,
		restaurant,
		image,
		description,
		rating,
		date,
	})

	try {
		await review.save()

		if (restaurant) {
			const ratings = await Review.aggregate([
				{ $match: { restaurant: ObjectId(restaurant) } },
				{
					$group: {
						_id: null,
						sumRating: { $sum: '$rating' },
						count: { $sum: 1 },
					},
				},
				{
					$project: {
						avgRating: { $divide: ['$sumRating', '$count'] },
					},
				},
				{ $unset: '_id' },
			])

			await Restaurant.findByIdAndUpdate(restaurant, {
				ratings: ratings[0].avgRating.toFixed(1),
			})
		}

		return res.status(201).json({
			status: 1,
			message: 'Review added successfully',
			review_details: review,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// return res.status(500).json({ status: 0, error: err.message })
	}
}

const updateReview = async (req, res) => {
	const { reviewerId, item, restaurant, description, rating, date } = req.body

	try {
		let image = req.files?.map((file) => file.path)

		if (!image.length) {
			const reviewData = await Review.findOne(
				{ _id: req.params.reviewId },
				'-_id image',
			)

			image = reviewData.image
		}

		const review = await Review.findByIdAndUpdate(
			req.params.reviewId,
			{
				reviewerId,
				item,
				restaurant,
				description,
				rating,
				date,
				image,
			},
			{ new: true },
		)

		if (!review) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reviews found with this id' })
		} else {
			return res
				.status(200)
				.json({ status: 1, message: 'review updated', review_details: review })
		}
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// return res.status(500).json({ status: 0, error: err.message })
	}
}

const deleteReview = async (req, res) => {
	try {
		const review = await Review.findByIdAndDelete(req.params.reviewId)

		if (!review) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reviews found with this Id' })
		} else if (review.deleteCount === 0) {
			return res
				.status(404)
				.json({ status: 0, message: 'Error deleting this review' })
		} else {
			return res
				.status(200)
				.json({ status: 1, message: 'review deleted successfully' })
		}
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// return res.status(500).json({ status: 0, error: err.message })
	}
}

const upVoteReview = async (req, res) => {
	const { reviewId } = req.params

	try {
		const checkVote = await ReviewVote.findOne({
			review: ObjectId(reviewId),
			reviewerId: req.user.id,
		})

		if (checkVote) {
			if (checkVote.voteType === true) {
				await ReviewVote.findByIdAndDelete(checkVote._id)
				await Review.findByIdAndUpdate(reviewId, {
					$inc: { upVote: -1 },
				})
				return res.status(200).json({
					status: 1,
					message: 'Review up vote removed',
				})
			}

			await ReviewVote.findByIdAndDelete(checkVote._id)
			await Review.findByIdAndUpdate(reviewId, {
				$inc: { downVote: -1 },
			})
		}

		const review = await Review.findByIdAndUpdate(
			reviewId,
			{
				$inc: { upVote: 1 },
			},
			{ new: true },
		)

		if (!review) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reviews found with this id' })
		}

		await ReviewVote.create({
			review: reviewId,
			reviewerId: req.user.id,
			voteType: true,
		})

		res
			.status(200)
			.json({ status: 1, message: 'Review up voted successfully!', review })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const downVoteReview = async (req, res) => {
	const { reviewId } = req.params

	try {
		const checkVote = await ReviewVote.findOne({
			review: ObjectId(reviewId),
			reviewerId: req.user.id,
		})

		if (checkVote) {
			if (checkVote.voteType === false) {
				await ReviewVote.findByIdAndDelete(checkVote._doc._id)
				await Review.findByIdAndUpdate(reviewId, {
					$inc: { downVote: -1 },
				})

				return res.status(200).json({
					status: 1,
					message: 'Review down vote removed',
				})
			}

			await ReviewVote.findByIdAndDelete(checkVote._doc._id)
			await Review.findByIdAndUpdate(reviewId, {
				$inc: { upVote: -1 },
			})
		}

		const review = await Review.findByIdAndUpdate(
			req.params.reviewId,
			{
				$inc: { downVote: 1 },
			},
			{ new: true },
		)

		if (!review) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reviews found with this id' })
		}

		await ReviewVote.create({
			review: reviewId,
			reviewerId: req.user.id,
			voteType: false,
		})

		res
			.status(200)
			.json({ status: 1, message: 'Review down voted successfully!', review })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchReview = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const reviews = await paginate(req, Review, [
			await searchMatchPipeline(Review, field, search, where),
		])

		if (!reviews.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No review found',
				reviews_count: reviews.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search reviews.',
			reviews_count: reviews.totalDocs,
			reviews,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
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
}
