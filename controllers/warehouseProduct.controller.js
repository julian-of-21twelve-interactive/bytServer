const { ObjectId } = require('mongodb')
const WarehouseProduct = require('../models/warehouseProduct.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addWarehouseProduct = async (req, res) => {
	const {
		name,
		itemGroup,
		restaurant,
		supplier,
		type,
		stock,
		status,
		wastage,
		expiry,
	} = req.body

	const warehouseProduct = new WarehouseProduct({
		name,
		itemGroup,
		restaurant,
		supplier,
		type,
		stock,
		status,
		wastage: Number(wastage.toString().replace('%', '')),
		expiry,
	})

	try {
		await warehouseProduct.save()

		res.status(201).json({
			status: 1,
			message: 'Product added successfully',
			warehouseProduct,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWarehouseProduct = async (req, res) => {
	try {
		const warehouseProduct = await WarehouseProduct.aggregate([
			{
				$match: {
					_id: ObjectId(req.params.warehouseProductId),
				},
			},
			...restaurantSupplierPipe,
			{ $set: { wastage: { $concat: [{ $toString: '$wastage' }, '%'] } } },
		])

		if (!warehouseProduct.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'Warehouse product not found' })
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse product information.',
			warehouseProduct,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllWarehouseProducts = async (req, res) => {
	try {
		const warehouseProducts = await paginate(req, WarehouseProduct, [
			{ $sort: { createdAt: -1 } },
			...restaurantSupplierPipe,
			{ $set: { wastage: { $concat: [{ $toString: '$wastage' }, '%'] } } },
		])

		if (!warehouseProducts.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse products found',
				warehouseProducts_count: warehouseProducts.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all warehouse products information.',
			warehouseProducts_count: warehouseProducts.totalDocs,
			warehouseProducts,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateWarehouseProduct = async (req, res) => {
	try {
		const {
			name,
			itemGroup,
			restaurant,
			supplier,
			type,
			stock,
			status,
			wastage,
			expiry,
		} = req.body

		const warehouseProduct = await WarehouseProduct.findByIdAndUpdate(
			req.params.warehouseProductId,
			{
				name,
				itemGroup,
				restaurant,
				supplier,
				type,
				stock,
				status,
				wastage: Number(wastage.toString().replace('%', '')),
				expiry,
			},
		)

		if (!warehouseProduct) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse product found with product id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse Product updated successfully',
			warehouseProduct,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteWarehouseProduct = async (req, res) => {
	try {
		const warehouseProduct = await WarehouseProduct.findByIdAndDelete(
			req.params.warehouseProductId,
		)

		if (!warehouseProduct) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse product found with product id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse Product removed successfully',
			warehouseProduct,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchWarehouseProduct = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const warehouseProducts = await paginate(req, WarehouseProduct, [
			await searchMatchPipeline(WarehouseProduct, field, search, where),
			...restaurantSupplierPipe,
		])

		if (!warehouseProducts.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse product found',
				warehouseProducts_count: warehouseProducts.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse search product information.',
			warehouseProducts_count: warehouseProducts.totalDocs,
			warehouseProducts,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWarehouseProductByRestaurant = async (req, res) => {
	try {
		const warehouseProducts = await paginate(req, WarehouseProduct, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'suppliers',
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier',
				},
			},
			{
				$unset: ['supplier.hash', 'supplier.salt', 'supplier.__v'],
			},
		])

		if (!warehouseProducts.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse product found',
				warehouseProducts_count: warehouseProducts.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant warehouse product information.',
			warehouseProducts_count: warehouseProducts.totalDocs,
			warehouseProducts,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWarehouseProductBySupplier = async (req, res) => {
	try {
		const warehouseProducts = await paginate(req, WarehouseProduct, [
			{ $match: { supplier: ObjectId(req.params.supplierId) } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{ $unset: 'restaurant.__v' },
		])

		if (!warehouseProducts.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse product found',
				warehouseProducts_count: warehouseProducts.totalDocs,
				dd,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Supplier warehouse product information.',
			warehouseProducts_count: warehouseProducts.totalDocs,
			warehouseProducts,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addWarehouseProduct,
	getWarehouseProduct,
	getAllWarehouseProducts,
	updateWarehouseProduct,
	deleteWarehouseProduct,
	searchWarehouseProduct,
	getWarehouseProductByRestaurant,
	getWarehouseProductBySupplier,
}

const restaurantSupplierPipe = [
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
			from: 'suppliers',
			localField: 'supplier',
			foreignField: '_id',
			as: 'supplier',
		},
	},
	{
		$lookup: {
			from: 'itemgroups',
			let: { itemGroupId: '$itemGroup' },
			pipeline: [
				{ $match: { $expr: { $eq: ['$_id', '$$itemGroupId'] } } },
				{ $project: { name: 1 } },
			],
			as: 'itemGroup',
		},
	},
	{
		$unset: [
			'restaurant.__v',
			'supplier.hash',
			'supplier.salt',
			'supplier.__v',
		],
	},
]
