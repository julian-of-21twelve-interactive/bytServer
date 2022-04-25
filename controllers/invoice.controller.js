const { ObjectId } = require('mongodb')
const Invoice = require('../models/invoice.model')
const paginate = require('../utils/aggregatePaginate.util')
const { convertAmount } = require('../utils/currencyConverter.util')

// rework require - only 1 filed added.

const addInvoice = async (req, res) => {
	const { customer, restaurant, order } = req.body

	try {
		const invoice = new Invoice({ customer, restaurant, order })

		await invoice.save()

		res
			.status(201)
			.json({ status: 1, message: 'Invoice added successfully', invoice })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllInvoice = async (req, res) => {
	const { currency } = req.query
	try {
		const invoices = await paginate(req, Invoice, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'users',
					let: { userId: '$customer' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
						{ $unset: ['salt', 'hash'] },
					],
					as: 'customer',
				},
			},
			{
				$lookup: {
					from: 'orders',
					localField: 'order',
					foreignField: '_id',
					as: 'order',
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
		])

		if (!invoices.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No invoices found',
				invoices_count: invoices.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all invoice data',
			invoices_count: invoices.totalDocs,
			invoices: currency
				? await convertAmount(invoices, 'price', 'usd', currency)
				: invoices,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInvoice = async (req, res) => {
	const { currency } = req.query
	try {
		const invoice = await Invoice.aggregate([
			{ $match: { _id: ObjectId(req.params.invoiceId) } },
			{
				$lookup: {
					from: 'users',
					let: { userId: '$customer' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
						{ $unset: ['salt', 'hash'] },
					],
					as: 'customer',
				},
			},
			{
				$lookup: {
					from: 'orders',
					localField: 'order',
					foreignField: '_id',
					as: 'order',
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
				$set: {
					customer: { $arrayElemAt: ['$customer', 0] },
					order: { $arrayElemAt: ['$order', 0] },
				},
			},
		])

		if (!invoice.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No invoice found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Invoice data',
			invoice: currency
				? await convertAmount(invoice, 'salary', 'usd', currency)
				: invoice,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateInvoice = async (req, res) => {
	const { customer, order } = req.body

	try {
		const invoice = await Invoice.findByIdAndUpdate(req.params.invoiceId, {
			customer,
			order,
		})

		if (!invoice) {
			return res.status(404).json({
				status: 0,
				message: 'No invoice with this id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Invoice updated successfully', invoice })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteInvoice = async (req, res) => {
	try {
		const invoice = await Invoice.findByIdAndDelete(req.params.invoiceId)

		if (!invoice) {
			return res.status(404).json({
				status: 0,
				message: 'No invoice with this group id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Invoice removed successfully', invoice })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInvoicesByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const invoices = await paginate(req, Invoice, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'users',
					let: { userId: '$customer' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
						{ $unset: ['salt', 'hash'] },
					],
					as: 'customer',
				},
			},
			{
				$lookup: {
					from: 'orders',
					localField: 'order',
					foreignField: '_id',
					as: 'order',
				},
			},
		])

		if (!invoices.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No invoices found',
				invoices_count: invoices.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all restaurant Invoice.',
			invoices_count: invoices.totalDocs,
			invoices: currency
				? await convertAmount(invoices, 'salary', 'usd', currency)
				: invoices,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInvoicesByUser = async (req, res) => {
	const { currency } = req.query
	try {
		const invoices = await paginate(req, Invoice, [
			{ $match: { customer: ObjectId(req.params.userId) } },
			{ $sort: { createdAt: -1 } },
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
					from: 'orders',
					localField: 'order',
					foreignField: '_id',
					as: 'order',
				},
			},
		])

		if (!invoices.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No invoices found',
				invoices_count: invoices.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all invoices by user',
			invoices_count: invoices.totalDocs,
			invoices: currency
				? await convertAmount(invoices, 'salary', 'usd', currency)
				: invoices,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addInvoice,
	getAllInvoice,
	getInvoice,
	updateInvoice,
	deleteInvoice,
	getInvoicesByRestaurant,
	getInvoicesByUser,
}
