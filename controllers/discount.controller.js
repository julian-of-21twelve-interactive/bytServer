const { ObjectId } = require('mongodb')
const Discount = require('../models/discount.model')
const paginate = require('../utils/aggregatePaginate.util')

// Add a Discount
const addDiscount = async (req, res) => {

	try {
		let {
			addedBy,
			discountType,
			startDate,
			endDate,
			minDiscountPrice,
			maxDiscountPrice,
			restaurant,
			discount,
			status,
			menuItem
		} = req.body

		startDate = new Date(startDate)
		endDate = new Date(endDate)
		let diffMs = (endDate - startDate);
		//converting in minutes
		let duration = Math.floor((diffMs / 1000) / 60);



		const discountObj = new Discount({
			addedBy,
			discountType,
			startDate,
			endDate,
			duration,
			status,
			restaurant,
			minDiscountPrice,
			maxDiscountPrice,
			discount,
			menuItem
		})
		await discountObj.save()


		return res.send({
			status: 1,
			message: 'Discount added successfully.',
			discount: discountObj
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

// Fetch all Discounts
const getAllDiscount = async (req, res) => {
	try {
		const discount = await paginate(req, Discount, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'menuitems',
					localField: 'menuItem',
					foreignField: '_id',
					as: 'menuItem',
				}
			},
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant'
				}
			}
		])

		if (!discount.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'There are no discounts available.',
				discount_count: discount.totalDocs
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'List of all discounts.', discount_count: discount.totalDocs, discount })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

// Update a Discount by Id
const updateDiscount = async (req, res) => {

	try {
		const {
			addedBy,
			discountType,
			startDate,
			endDate,
			minDiscountPrice,
			maxDiscountPrice,
			restaurant,
			discount,
			status,

		} = req.body

		const updateDiscount = await Discount.findOne({
			_id: req.params.discountId,
		})
		if (!updateDiscount) {
			return res.status(404).json({ status: 0, message: 'Discount not found' })
		}
		let duration, diffMs;
		if (startDate & endDate) {
			diffMs = (new Date(endDate) - new Date(startDate));
			//converting in minutes
			duration = Math.floor((diffMs / 1000) / 60);
		} else if (startDate) {
			diffMs = (new Date(endDate) - updateDiscount.startDate);
			//converting in minutes
			duration = Math.floor((diffMs / 1000) / 60);

		} else if (endDate) {
			diffMs = (new Date(endDate) - updateDiscount.startDate);
			//converting in minutes
			duration = Math.floor((diffMs / 1000) / 60);

		}

		let discounts = await Discount.findByIdAndUpdate(req.params.discountId, {
			addedBy,
			discountType,
			startDate,
			endDate,
			duration,
			status,
			restaurant,

			minDiscountPrice,
			maxDiscountPrice,
			discount,
		})

		return res.status(200).json({ status: 1, message: 'Discounts are updated.', discounts })
	} catch (err) {
		console.log(error)
		throw new Error(error.message)
	}
}

// Delete a Discount by Id
const deleteDiscount = async (req, res) => {
	try {
		const discount = await Discount.findByIdAndDelete(req.params.discountId)

		if (!discount) {
			return res.status(404).json({
				status: 0,
				message: 'This discount no more exists.'
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Discount is successfully deleted', discount })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

// Fetch a Discount by Id
const getDiscountById = async (req, res) => {
	try {
		const discount = await Discount.aggregate([
			{ $match: { _id: ObjectId(req.params.discountId) } },
			{
				$lookup: {
					from: 'menuitems',
					localField: 'menuItem',
					foreignField: '_id',
					as: 'menuItem',
				}
			},
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant'
				}
			}
		])

		if (!discount) {
			return res.status(404).json({ status: 0, message: 'This discount no more exists.' })
		}

		return res.status(200).json({ status: 1, message: 'Successfully received discount.', discount })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//Fetch a Discount by Restaurant Id
const getDiscountByRestaurant = async (req, res) => {

	try {
		const discount = await Discount.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'menuitems',

					localField: 'menuItem',

					foreignField: '_id',

					as: 'menuItem',
				},

			}, {
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant'
				}
			}


		])

		if (!discount) {
			return res.status(404).json({
				status: 0,
				message: 'Discount not found with that restaurant'
			})
		}

		return res.status(200).json({ status: 1, message: 'Discounts by restaurants.', discount })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addDiscount,
	getAllDiscount,
	updateDiscount,
	deleteDiscount,
	getDiscountById,
	getDiscountByRestaurant,
}
