const Filter = require('../models/filter.model')
const paginate = require('../utils/aggregatePaginate.util')

// - TODO: Input / Output currency data conversation pending.

const addFilter = async (req, res) => {
	const { filterTitle, filters, multipleSelection, slider, min, max } = req.body

	try {
		const filter = new Filter({
			filterTitle,
			filters,
			multipleSelection,
			slider,
			min,
			max,
		})

		await filter.save()

		res
			.status(201)
			.json({ status: 1, message: 'Filter added successfully', filter })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllFilter = async (req, res) => {
	try {
		const filters = await paginate(req, Filter, [{ $sort: { createdAt: 1 } }])

		if (!filters.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No filters found',
				filters_count: filters.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all favorites',
			filters_count: filters.totalDocs,
			filters,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFilter = async (req, res) => {
	try {
		const filter = await Filter.findOne({
			_id: req.params.filterId,
		})

		if (!filter) {
			return res
				.status(404)
				.json({ status: 0, message: 'No filter found with this id' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'Filter data is received', filter })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateFilter = async (req, res) => {
	const { filterTitle, filters, multipleSelection, slider, min, max } = req.body

	try {
		const filter = await Filter.findByIdAndUpdate(req.params.filterId, {
			filterTitle,
			filters,
			multipleSelection,
			slider,
			min,
			max,
		})

		if (!filter) {
			return res.status(404).json({
				status: 0,
				message: 'No filter with this id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Filter updated successfully', filter })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteFilter = async (req, res) => {
	try {
		const filter = await Filter.findByIdAndDelete(req.params.filterId)

		if (!filter) {
			return res.status(404).json({
				status: 0,
				message: 'No filter with this group id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Filter removed successfully', filter })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addFilter,
	getAllFilter,
	getFilter,
	updateFilter,
	deleteFilter,
}
