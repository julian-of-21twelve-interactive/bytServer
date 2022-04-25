const Restaurant = require('../models/restaurant.model')
const paginate = require('../utils/aggregatePaginate.util')

const searchRestaurantAndItems = async (req, res) => {
	const { name } = req.body

	try {
		const searchData = await paginate(req, Restaurant, [
			{ $match: { name: { $regex: name, $options: 'i' } } },
			{ $set: { type: 'restaurant' } },
			{
				$unionWith: {
					coll: 'bundleitems',
					pipeline: [
						{ $match: { name: { $regex: name, $options: 'i' } } },
						{
							$lookup: {
								from: 'restaurants',
								localField: 'restaurant',
								foreignField: '_id',
								as: 'restaurant',
							},
						},
						{
							$lookup: {
								from: 'menutags',
								localField: 'menuTag',
								foreignField: '_id',
								as: 'menuTag',
							},
						},
						{
							$lookup: {
								from: 'addons',
								localField: 'addon',
								foreignField: '_id',
								as: 'addon',
							},
						},
						{
							$lookup: {
								from: 'menuitems',
								localField: 'items.item',
								foreignField: '_id',
								as: 'menuItems',
							},
						},
						{
							$set: {
								type: 'combo',
								items: {
									$map: {
										input: '$items',
										in: {
											$mergeObjects: [
												'$$this',
												{
													item: {
														$arrayElemAt: [
															'$menuItems',
															{
																$indexOfArray: [
																	'$menuItems._id',
																	'$$this.item',
																],
															},
														],
													},
												},
											],
										},
									},
								},
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: 'menuitems',
					pipeline: [
						{ $match: { name: { $regex: name, $options: 'i' } } },
						{
							$lookup: {
								from: 'restaurants',
								localField: 'restaurant',
								foreignField: '_id',
								as: 'restaurant',
							},
						},
						{
							$lookup: {
								from: 'menutags',
								localField: 'menuTag',
								foreignField: '_id',
								as: 'menuTag',
							},
						},
						{
							$lookup: {
								from: 'addons',
								localField: 'addon',
								foreignField: '_id',
								as: 'addon',
							},
						},
						{ $set: { type: 'menu' } },
					],
				},
			},
			{ $sort: { type: -1 } },
		])

		if (!searchData.totalDocs) {
			return res.status(404).json({
				status: 0,
				searchData_count: searchData.totalDocs,
				message: 'No restaurant or items found with this name',
			})
		}

		res.status(200).json({
			status: 1,
			searchData_count: searchData.totalDocs,
			searchData,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = { searchRestaurantAndItems }
