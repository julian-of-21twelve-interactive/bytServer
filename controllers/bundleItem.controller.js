const { ObjectId } = require('mongodb')
const BundleItem = require('../models/bundleItem.model')
const MenuTag = require('../models/menuTag.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { convertAmount } = require('../utils/currencyConverter.util')

const addBundleItem = async (req, res) => {
	const { currency: queryCurrency } = req.query

	let {
		name,
		description,
		category,
		restaurant,
		items,
		price,
		currency,
		status,
		discount,
		menuTag,
		addon,
		estimatedTime,
	} = req.body

	if (queryCurrency) price = await getAmount(queryCurrency, 'usd', price)

	const image = req.files?.map((file) => file.path)

	try {
		const bundleItem = new BundleItem({
			name,
			description,
			category,
			image,
			restaurant,
			items: JSON.parse(items),
			price,
			currency,
			status,
			discount,
			menuTag,
			addon,
			estimatedTime,
		})

		await bundleItem.save()

		res.status(201).json({
			status: 1,
			message: 'Bundle item added successfully.',
			bundleItem,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllBundleItem = async (req, res) => {
	const { currency } = req.query
	try {
		const bundleItems = await paginate(req, BundleItem, [
			{ $sort: { createdAt: -1 } },
			...bundleItemPopulationPipe,
		])

		if (!bundleItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle items found.',
				bundleItems_count: bundleItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of bundle items.',
			bundleItems_count: bundleItems.totalDocs,
			bundleItems: currency
				? await convertAmount(bundleItems, 'price', 'usd', currency)
				: bundleItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getBundleItem = async (req, res) => {
	const { currency } = req.query
	try {
		const bundleItem = await BundleItem.aggregate([
			{ $match: { _id: ObjectId(req.params.bundleItemId) } },
			...bundleItemPopulationPipe,
		])

		if (!bundleItem.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No bundle item found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Bundle item data.',
			bundleItem: currency
				? await convertAmount(bundleItem[0], 'price', 'usd', currency)
				: bundleItem[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateBundleItem = async (req, res) => {
	const { currency } = req.query
	let {
		name,
		description,
		category,
		restaurant,
		items,
		price,
		menuTag,
		discount,
	} = req.body

	if (currency) price = await getAmount(currency, 'usd', price)

	try {
		let image = req.files?.map((file) => file.path)

		if (!image.length) {
			const bundleItemData = await BundleItem.findOne(
				{ _id: req.params.bundleItemId },
				'-_id image',
			)

			image = bundleItemData.image
		}

		const bundleItem = await BundleItem.findByIdAndUpdate(
			req.params.bundleItemId,
			{
				name,
				description,
				category,
				restaurant,
				items: JSON.parse(items),
				price,
				menuTag,
				image,
				discount,
			},
			{ new: true },
		)

		if (!bundleItem) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle item with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Bundle item updated successfully',
			bundleItem,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteBundleItem = async (req, res) => {
	try {
		const bundleItem = await BundleItem.findByIdAndDelete(
			req.params.bundleItemId,
		)

		if (!bundleItem) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle item with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Bundle item removed successfully',
			bundleItem,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchBundleItem = async (req, res) => {
	const { currency } = req.query
	const { field, search, where } = req.body

	try {
		const bundleItems = await paginate(req, BundleItem, [
			await searchMatchPipeline(BundleItem, field, search, where),
			...bundleItemPopulationPipe,
		])

		if (!bundleItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle item found',
				bundleItems_count: bundleItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Bundle Items.',
			bundleItems_count: bundleItems.totalDocs,
			bundleItems: currency
				? await convertAmount(bundleItems, 'price', 'usd', currency)
				: bundleItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getBundleItemByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const bundleItems = await paginate(req, BundleItem, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'menuitems',
					let: { menuItemId: '$items.item' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$menuItemId'] } } },
						{ $unset: '__v' },
					],
					as: 'menuItems',
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
				$set: {
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
												{ $indexOfArray: ['$menuItems._id', '$$this.item'] },
											],
										},
									},
								],
							},
						},
					},
				},
			},
			{ $unset: ['menuItems', 'menuTag.__v', 'addon.__v'] },
		])

		if (!bundleItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle item found',
				bundleItems_count: bundleItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of bundle items of restaurant',
			bundleItems_count: bundleItems.totalDocs,
			bundleItems: currency
				? await convertAmount(bundleItems, 'price', 'usd', currency)
				: bundleItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getBundleItemsByTag = async (req, res) => {
	const { currency } = req.query
	const aggregate = [
		{
			$match: {
				$expr: { $in: [ObjectId(req.params.menuTagId), '$menuTag'] },
			},
		},
		{
			$lookup: {
				from: 'menuitems',
				let: { menuItemId: '$items.item' },
				pipeline: [
					{ $match: { $expr: { $in: ['$_id', '$$menuItemId'] } } },
					{ $unset: '__v' },
				],
				as: 'menuItems',
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
			$lookup: {
				from: 'addons',
				localField: 'addon',
				foreignField: '_id',
				as: 'addon',
			},
		},
		{
			$set: {
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
											{ $indexOfArray: ['$menuItems._id', '$$this.item'] },
										],
									},
								},
							],
						},
					},
				},
			},
		},
		{ $unset: ['menuItems', 'restaurant.__v', 'addon.__v'] },
	]

	try {
		const bundleItems = await paginate(req, BundleItem, aggregate)

		if (!bundleItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle item found for this menu tag',
				bundleItems_count: bundleItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of bundle items according to tags.',
			bundleItems_count: bundleItems.totalDocs,
			bundleItems: currency
				? await convertAmount(bundleItems, 'price', 'usd', currency)
				: bundleItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getBundleItemsByTagAndCategory = async (req, res) => {
	const { currency } = req.query
	const aggregate = [
		{
			$match: {
				$expr: {
					$and: [
						{ $in: [ObjectId(req.params.menuTagId), '$menuTag'] },
						{
							$eq: [
								{ $toLower: '$category' },
								req.params.category.toLowerCase(),
							],
						},
					],
				},
			},
		},
		{
			$lookup: {
				from: 'menuitems',
				let: { menuItemId: '$items.item' },
				pipeline: [
					{ $match: { $expr: { $in: ['$_id', '$$menuItemId'] } } },
					{ $unset: '__v' },
				],
				as: 'menuItems',
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
			$lookup: {
				from: 'addons',
				localField: 'addon',
				foreignField: '_id',
				as: 'addon',
			},
		},
		{
			$set: {
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
											{ $indexOfArray: ['$menuItems._id', '$$this.item'] },
										],
									},
								},
							],
						},
					},
				},
			},
		},
		{ $unset: ['menuItems', 'restaurant.__v', 'addon.__v'] },
	]

	try {
		const bundleItems = await paginate(req, BundleItem, aggregate)

		if (!bundleItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No bundle item found for this menu tag',
				bundleItems_count: bundleItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Bundle items list according to tag and category.',
			bundleItems_count: bundleItems.totalDocs,
			bundleItems: currency
				? await convertAmount(bundleItems, 'price', 'usd', currency)
				: bundleItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addBundleItem,
	getAllBundleItem,
	getBundleItem,
	updateBundleItem,
	deleteBundleItem,
	searchBundleItem,
	getBundleItemByRestaurant,
	getBundleItemsByTag,
	getBundleItemsByTagAndCategory,
}

const bundleItemPopulationPipe = [
	{
		$lookup: {
			from: 'menuitems',
			let: {
				menuItemId: '$items.item',
			},
			pipeline: [
				{ $match: { $expr: { $in: ['$_id', '$$menuItemId'] } } },
				{ $unset: '__v' },
			],
			as: 'menuItems',
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
		$set: {
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
										{ $indexOfArray: ['$menuItems._id', '$$this.item'] },
									],
								},
							},
						],
					},
				},
			},
			restaurant: {
				$ifNull: [{ $arrayElemAt: ['$restaurant', 0] }, {}],
			},
		},
	},
	{ $unset: ['menuItems', 'restaurant.__v', 'menuTag.__v', 'addon.__v'] },
]
