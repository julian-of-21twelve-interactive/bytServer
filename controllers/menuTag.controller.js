const { ObjectId } = require('mongodb')
const MenuTag = require('../models/menuTag.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addMenuTag = async (req, res) => {
	const { name, restaurant } = req.body

	try {
		const checkTag = await MenuTag.findOne({
			name: { $regex: name, $options: 'i' },
			restaurant,
		}).countDocuments()

		if (checkTag) {
			return res.status(400).json({
				status: 0,
				message: 'Menu tag is already added'
			})
		}

		const checkPopularTag = await MenuTag.findOne({
			name: 'popular',
			restaurant,
		}).countDocuments()

		if (checkPopularTag === 0) {
			await MenuTag.create({ name: 'popular', restaurant })
		}

		const menuTag = new MenuTag({ name, restaurant })

		await menuTag.save()

		res.status(201).json({ status: 1, message: 'Menu tag added successfully', menuTag })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllMenuTag = async (req, res) => {
	try {
		const menuTags = await paginate(req, MenuTag, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{ $unset: ['restaurant.__v'] },
		])

		if (!menuTags.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu tags found',
				menuTags_count: menuTags.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'List of all menu tags.', menuTags_count: menuTags.totalDocs, menuTags })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuTag = async (req, res) => {
	try {
		const menuTag = await MenuTag.aggregate([
			{
				$match: { _id: ObjectId(req.params.menuTagId) },
			},
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{ $unset: ['restaurant.__v'] },
		])

		if (!menuTag.length) {
			return res.status(404).json({ status: 0, message: 'No menu tag found with this id' })
		}

		res.status(200).json({ status: 1, message: 'Menu tag data.', menuTag })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateMenuTag = async (req, res) => {
	const { name, restaurant } = req.body

	try {
		const menuTag = await MenuTag.findByIdAndUpdate(req.params.menuTagId, {
			name,
			restaurant,
		})

		if (!menuTag) {
			return res.status(404).json({
				status: 0,
				message: 'No menu tag with this id'
			})
		}

		res.status(200).json({ status: 1, message: 'Menu tag updated successfully', menuTag })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteMenuTag = async (req, res) => {
	try {
		const menuTag = await MenuTag.findByIdAndDelete(req.params.menuTagId)

		if (!menuTag) {
			return res.status(404).json({
				status: 0,
				message: 'No menu tag with this group id'
			})
		}

		res.status(200).json({ status: 1, message: 'Menu tag removed successfully', menuTag })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuTagsByRestaurant = async (req, res) => {
	try {
		const menuTags = await paginate(req, MenuTag, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{ $sort: { createdAt: 1 } },
		])

		if (!menuTags.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu tags found',
				menuTags_count: menuTags.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'List of restaurant menu tag', menuTags_count: menuTags.totalDocs, menuTags })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchMenuTags = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const menuTags = await paginate(req, MenuTag, [
			await searchMatchPipeline(MenuTag, field, search, where),
		])

		if (!menuTags.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu tags found',
				menuTags_count: menuTags.totalDocs
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all search menu tag data.',
			menuTags_count: menuTags.totalDocs,
			menuTags
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addMenuTag,
	getAllMenuTag,
	getMenuTag,
	updateMenuTag,
	deleteMenuTag,
	getMenuTagsByRestaurant,
	searchMenuTags,
}
