const PettyCash = require('../models/pettyCash.model')
const paginate = require('../utils/aggregatePaginate.util')
const { ObjectId } = require('mongodb')

// - TODO: Input / Output currency data conversation pending.

const addPettyCash = async (req, res) => {
	const { addedBy, dayStartAmount } = req.body

	const pettyCash = new PettyCash({
		addedBy,
		dayStartAmount,
		remainingAmount: dayStartAmount,
	})

	try {
		await pettyCash.save()

		return res
			.status(201)
			.json({ status: 1, message: 'Petty Cash added successfully ', pettyCash })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getPettyCashByDate = async (req, res) => {
	try {
		const date1 = new Date(req.body.startDate.toString())
		const date2 = new Date(req.body.endDate.toString())
		const pettyCash = await PettyCash.aggregate([
			{
				$match: {
					createdAt: { $gt: date1, $lt: date2 },
				},
			},
		])

		return res
			.status(200)
			.json({
				status: 1,
				message: 'List of petty cash by date',
				pettyCash_count: pettyCash.length,
				pettyCash,
			})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getAllPettyCash = async (req, res) => {
	try {
		const pettyCash = await paginate(req, PettyCash, [
			{ $sort: { createdAt: -1 } },
		])

		if (!pettyCash.totalDocs) {
			return res
				.status(404)
				.json({ status: 0, message: 'Petty Cash not found' })
		}

		return res
			.status(200)
			.json({
				status: 1,
				message: 'List of all petty cash.',
				pettyCash_count: pettyCash.totalDocs,
				pettyCash,
			})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getPettyCashById = async (req, res) => {
	try {
		const pettyCash = await PettyCash.findOne({ _id: req.params.pettyCashId })

		if (!pettyCash) {
			return res
				.status(404)
				.json({ status: 0, message: 'Petty Cash not found' })
		}

		return res.json({ status: 1, message: 'Petty cash.', pettyCash })
	} catch (error) {
		throw new Error(error.message)
	}
}

module.exports = {
	addPettyCash,
	getPettyCashByDate,
	getAllPettyCash,
	getPettyCashById,
}
