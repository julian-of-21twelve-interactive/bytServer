const moment = require('moment')
const PettyCashTransaction = require('../models/pettyCashTransaction.model')
const paginate = require('../utils/aggregatePaginate.util')
const PettyCash = require('../models/pettyCash.model')
// const { ObjectId } = require('mongodb')

// - TODO: Input / Output currency data conversation pending.
const addTransaction = async (req, res) => {
	try {
		const { transactionAmount, receivedBy, pettyCash } = req.body
		let pettyCashvar = await PettyCash.findOne({ _id: pettyCash })
		if (!pettyCashvar) {
			return res
				.status(404)
				.send({ status: 0, message: 'Petty Cash not found' })
		}
		var transaction = new PettyCashTransaction({
			transactionAmount,
			receivedBy,
			pettyCash,
		})
		pettyCashvar.remainingAmount -= transactionAmount
		await pettyCashvar.save()
		await transaction.save()
		return res
			.status(200)
			.send({
				status: 1,
				message: 'Transaction added successfully',
				transaction,
			})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getAllPettyCashTransaction = async (req, res) => {
	try {
		const pettyCashTransaction = await paginate(req, PettyCashTransaction, [
			{ $sort: { createdAt: -1 } },
		])

		if (!pettyCashTransaction.totalDocs) {
			return res
				.status(404)
				.json({ status: 0, message: 'Petty Cash Transaction  not found' })
		}

		return res
			.status(200)
			.json({
				status: 1,
				message: 'List of all petty cash transaction.',
				pettyCashTransaction_count: pettyCashTransaction.totalDocs,
				pettyCashTransaction,
			})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getPettyCashTransactionById = async (req, res) => {
	try {
		const pettyCashTransaction = await PettyCashTransaction.findOne({
			_id: req.params.transactionId,
		})

		if (!pettyCashTransaction) {
			return res
				.status(404)
				.json({ status: 0, message: 'Transaction not found' })
		}

		return res.json({
			status: 1,
			message: 'Petty cash transaction data.',
			pettyCashTransaction,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTransactionByPettyCashId = async (req, res) => {
	try {
		const pettyCashTransaction = await PettyCashTransaction.find({
			pettycash: req.params.pettycashId,
		})

		if (pettycash.length === 0) {
			return res
				.status(404)
				.json({ status: 0, message: 'Transaction not found' })
		}

		return res.json({
			status: 1,
			message: 'Petty cash transaction',
			pettyCashTransaction,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addTransaction,
	getAllPettyCashTransaction,
	getPettyCashTransactionById,
	getTransactionByPettyCashId,
}
