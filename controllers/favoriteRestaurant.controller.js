const { ObjectId } = require('mongodb')
const moment = require('moment')
const FavoriteRestaurant = require('../models/favoriteRestaurant.model')
const paginate = require('../utils/aggregatePaginate.util')

// not properly tested.
const addFavoriteRestaurant = async (req, res) => {
	const { customer, restaurant } = req.body

	try {
		const checkFavorite = await FavoriteRestaurant.findOne({
			customer,
			restaurant,
		}).countDocuments()

		if (checkFavorite > 0) {
			return res.status(400).json({
				status: 0,
				message: 'You already saved this as a favorite restaurant',
			})
		}

		const favoriteRestaurant = new FavoriteRestaurant({ customer, restaurant })

		await favoriteRestaurant.save()

		res.status(201).json({
			status: 1,
			message: 'Favorite restaurant added successfully',
			favoriteRestaurant,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllFavoriteRestaurant = async (req, res) => {
	try {
		const favoriteRestaurants = await paginate(req, FavoriteRestaurant, [
			{ $sort: { createdAt: -1 } },
			...favoriteRestaurantPipe,
		])

		if (!favoriteRestaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite restaurants found',
				favoriteRestaurants_count: favoriteRestaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all favorite',
			favoriteRestaurants_count: favoriteRestaurants.totalDocs,
			favoriteRestaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavoriteRestaurantByUser = async (req, res) => {
	try {
		const favoriteRestaurants = await paginate(req, FavoriteRestaurant, [
			{ $match: { customer: ObjectId(req.params.userId) } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'tables',
					let: { restaurantId: '$restaurant' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
					],
					as: 'restaurantTables',
				},
			},
			{
				$lookup: {
					from: 'orders',
					let: {
						restaurantId: '$restaurant',
						tablesId: '$restaurantTables._id',
					},
					pipeline: [
						{
							$match: {
								$and: [
									{ $expr: { $eq: ['$restaurant', '$$restaurantId'] } },
									{
										$expr: {
											$gte: [
												{
													$size: {
														$ifNull: [
															{
																$setIntersection: ['$table', '$$tablesId'],
															},
															[],
														],
													},
												},
												1,
											],
										},
									},
									{
										$expr: {
											$eq: ['$deliveryTime', new Date(roundedTime())],
										},
									},
								],
							},
						},
						{ $project: { table: 1, deliveryTime: 1 } },
					],
					as: 'occupiedTables',
				},
			},
			...favoriteRestaurantPipe,
			{
				$set: {
					availableTable: {
						$subtract: [
							{ $size: '$restaurantTables' },
							{ $size: '$occupiedTables' },
						],
					},
				},
			},
			{ $unset: ['restaurantTables', 'occupiedTables'] },
		])

		if (!favoriteRestaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite restaurants found',
				favoriteRestaurants_count: favoriteRestaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'User favorites restaurant list.',
			favoriteRestaurants_count: favoriteRestaurants.totalDocs,
			favoriteRestaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavoriteRestaurant = async (req, res) => {
	try {
		const favoriteRestaurant = await FavoriteRestaurant.aggregate([
			{ $match: { _id: ObjectId(req.params.favoriteRestaurantId) } },
			...favoriteRestaurantPipe,
		])

		if (!favoriteRestaurant.length) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite restaurant found with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of favorite restaurants.',
			favoriteRestaurant,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateFavoriteRestaurant = async (req, res) => {
	const { customer, restaurant } = req.body

	try {
		const favoriteRestaurant = await FavoriteRestaurant.findByIdAndUpdate(
			req.params.favoriteRestaurantId,
			{ customer, restaurant },
			{ new: true },
		)

		if (!favoriteRestaurant) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite restaurant with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Favorite restaurant updated successfully',
			favoriteRestaurant,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteFavoriteRestaurant = async (req, res) => {
	try {
		const favoriteRestaurant = await FavoriteRestaurant.findByIdAndDelete(
			req.params.favoriteRestaurantId,
		)

		if (!favoriteRestaurant) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite restaurant with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Favorite restaurant removed successfully',
			favoriteRestaurant,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addFavoriteRestaurant,
	getAllFavoriteRestaurant,
	getFavoriteRestaurantByUser,
	getFavoriteRestaurant,
	updateFavoriteRestaurant,
	deleteFavoriteRestaurant,
}

const favoriteRestaurantPipe = [
	{
		$lookup: {
			from: 'users',
			localField: 'customer',
			foreignField: '_id',
			as: 'customer',
		},
	},
	{
		$lookup: {
			from: 'reviews',
			localField: 'restaurant',
			foreignField: 'restaurant',
			as: 'reviewCount',
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
	{ $set: { reviewCount: { $size: '$reviewCount' } } },
	{
		$unset: [
			'customer.salt',
			'customer.hash',
			'customer.__v',
			'restaurant.__v',
		],
	},
]

const roundedTime = () => {
	const time = moment()
	const minRemainder = time.minute() % 30

	return moment(time)
		.subtract(minRemainder, 'minutes')
		.format('YYYY-MM-DD HH:mm')
}
