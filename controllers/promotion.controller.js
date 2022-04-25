const Promotion = require('../models/promotion.model')
const paginate = require('../utils/aggregatePaginate.util')
const { ObjectId } = require('mongodb')

const addPromotion = async (req, res) => {
	let { addedBy, name, startDate, endDate, discount, restaurant } = req.body
	startDate = new Date(startDate)
	endDate = new Date(endDate)
	let diffMs = endDate - startDate
	let duration = Math.floor(diffMs / 1000 / 60)

	const promotion = new Promotion({
		addedBy,
		name,
		startDate,
		endDate,
		discount,
		duration,
		restaurant,
	})

	try {
		await promotion.save()

		return res
			.status(201)
			.json({ status: 1, message: 'Promotion added successfully ', promotion })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

//update discount
const updatePromotion = async (req, res) => {
	try {
		const { addedBy, name, startDate, endDate, restaurant, discount } = req.body

		const updatePromotion = await Promotion.findOne({
			_id: req.params.promotionId,
		})
		if (discount) {
			updatePromotion.discount.push(discount)
			await updatePromotion.save()
		}
		if (!updatePromotion) {
			return res.status(404).json({ status: 0, message: 'Promotion not found' })
		}
		let duration, diffMs
		if (startDate & endDate) {
			diffMs = new Date(endDate) - new Date(startDate)
			//converting in minutes
			duration = Math.floor(diffMs / 1000 / 60)
		} else if (startDate) {
			diffMs = new Date(endDate) - updatePromotion.startDate
			//converting in minutes
			duration = Math.floor(diffMs / 1000 / 60)
		} else if (endDate) {
			diffMs = new Date(endDate) - updatePromotion.startDate
			//converting in minutes
			duration = Math.floor(diffMs / 1000 / 60)
		}

		let promotion = await Promotion.findByIdAndUpdate(req.params.promotionId, {
			addedBy,
			name,
			startDate,
			endDate,
			discount,

			duration,
			restaurant,
		})

		return res.status(200).json({ status: 1, message: 'Promotion updated.', promotion })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}
//get promotion by date
const getPromotionByDate = async (req, res) => {
	try {
		const date1 = new Date(req.body.startDate.toString())
		const date2 = new Date(req.body.endDate.toString())
		const promotion = await Promotion.aggregate([
			{
				$match: {
					createdAt: { $gt: date1, $lt: date2 },
				},
			},
			{
				$lookup: {
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discount',
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
		])

		return res
			.status(200)
			.json({ status: 1, message: 'List of date wise promotion data.', promotion_count: promotion.length, promotion })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getAllPromotion = async (req, res) => {
	try {
		const promotion = await paginate(req, Promotion, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discount',
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
		])

		if (!promotion.totalDocs) {
			return res.status(404).json({ status: 0, message: 'Promotion not found' })
		}

		return res
			.status(200)
			.json({ status: 1, message: 'List of all promotion data.', promotion_count: promotion.totalDocs, promotion })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//get promotion by added by field
const getPromotionByAddedBy = async (req, res) => {
	try {
		const promotion = await Promotion.aggregate([
			{
				$match: { addedBy: ObjectId(req.params.addedBy) },
			},
			{
				$lookup: {
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discount',
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
		])

		if (!promotion) {
			return res.status(404).json({ status: 0, message: 'Promotion not found' })
		}

		return res.json({ status: 1, message: 'Promotion data.',  promotion })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getPromotionById = async (req, res) => {
	try {
		const promotion = await Promotion.aggregate([
			{
				$match: { _id: ObjectId(req.params.promotionId) },
			},
			{
				$lookup: {
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discount',
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
		])

		if (!promotion) {
			return res.status(404).json({ status: 0, message: 'Promotion not found' })
		}

		return res.json({ status: 1, message: 'Promotion data.', promotion })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//delete promotion
const deletePromotion = async (req, res) => {
	try {
		const promotion = await Promotion.findByIdAndDelete(req.params.promotionId)

		if (!promotion) {
			return res.status(404).json({
				status: 0,
				message: 'This promotion no more exists.'
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Promotion is successfully deleted', promotion })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//add discount to promotion
const addDiscountToPromotion = async (req, res) => {
	try {
		const promotion = await Promotion.findOneAndUpdate(
			{ _id: req.body.promotionId },
			{ $push: { discount: req.body.discount } },
			{ new: true },
		)

		if (!promotion) {
			return res.status(404).json({
				status: 0,
				message: 'This promotion no more exists.'
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'Discount for the promotion added is successfully',
			promotion
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//add discount to promotion
const removeDiscountToPromotion = async (req, res) => {
	try {
		const promotion = await Promotion.findOneAndUpdate(
			{ _id: req.body.promotionId },
			{ $pull: { discount: req.body.discount } },
			{ new: true },
		)

		if (!promotion) {
			return res.status(404).json({
				status: 0,
				message: 'This promotion no more exists.'
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'Discount from the promotion deleted is successfully',
			promotion
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addPromotion,
	getPromotionByDate,
	getAllPromotion,
	getPromotionById,
	updatePromotion,
	deletePromotion,
	deletePromotion,
	addDiscountToPromotion,
	removeDiscountToPromotion,
	getPromotionByAddedBy,
}
