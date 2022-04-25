const Currency = require('../models/currency.model')
const paginate = require('../utils/aggregatePaginate.util')

const addCurrency = async (req, res) => {
	const { name, code, symbol } = req.body

	try {
		const currency = new Currency({ name, code, symbol })

		await currency.save()

		res
			.status(201)
			.json({ status: 1, message: 'Currency added successfully', currency })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllCurrency = async (req, res) => {
	try {
		const currencies = await paginate(req, Currency, [
			{ $sort: { createdAt: -1 } },
		])

		if (!currencies.totalDocs) {
			return res.status(404).json({
				status: 0,
				currencies_count: currencies.totalDocs,
				message: 'No currencies found',
			})
		}

		res
			.status(200)
			.json({ status: 1, currencies_count: currencies.totalDocs, currencies })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getCurrency = async (req, res) => {
	try {
		const currency = await Currency.findOne({
			_id: req.params.currencyId,
		})

		if (!currency) {
			return res
				.status(404)
				.json({ status: 0, message: 'No currency found with this id' })
		}

		res.status(200).json({ status: 1, currency })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchCurrency = async (req, res) => {
	const { field, search } = req.body

	try {
		const currencies = await paginate(req, Currency, [
			{ $match: { [field]: { $regex: search, $options: 'i' } } },
		])

		if (!currencies.totalDocs) {
			return res.status(404).json({
				status: 0,
				currencies_count: currencies.totalDocs,
				message: 'No currency found',
			})
		}

		res
			.status(200)
			.json({ status: 1, currencies_count: currencies.totalDocs, currencies })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	addCurrency,
	getAllCurrency,
	getCurrency,
	searchCurrency,
}
