const moment = require('moment')
const Package = require('../models/package.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { convertAmount } = require('../utils/currencyConverter.util')

const getAllPackages = async (req, res) => {
	const { currency } = req.query
	try {
		const package = await paginate(req, Package, [
			{
				$sort: { createdAt: -1 },
			},
		])

		if (!package) {
			return res.status(404).json({
				status: 0,
				message: 'No packages found',
				package_count: package.length,
			})
		}
		return res.status(200).json({
			status: 1,
			message: 'List of all packages.',
			package_count: package.totalDocs,
			packages: currency
				? await convertAmount(package, 'price', 'usd', currency)
				: package,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getPackage = async (req, res) => {
	const { currency } = req.query
	try {
		const packages = await Package.findById(req.params.packageId)

		if (!packages) {
			return res.status(404).json({ status: 0, message: 'No packages found' })
		}

		return res.status(200).json({
			status: 1,
			message: 'Package data',
			packages: currency
				? await convertAmount(packages, 'price', 'usd', currency)
				: packages,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const addPackage = async (req, res) => {
	const { currency } = req.query
	let { name, price, expiry, status, restaurantCount } = req.body

	if (currency) price = getAmount(currency, 'usd', price)

	const packages = new Package({
		name,
		price,
		validity: moment(expiry).diff(moment(), 'days'),
		expiry,
		status,
		restaurantCount,
	})

	try {
		await packages.save()

		res
			.status(201)
			.json({ status: 1, message: 'Package successfully created', packages })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const updatePackage = async (req, res) => {
	let { currency } = req.query
	let { name, price, validity, expiry, status, restaurantCount } = req.body

	if (currency) price = getAmount(currency, 'usd', price)

	try {
		const package = await Package.findByIdAndUpdate(req.params.packageId, {
			name,
			price,
			validity: String(validity.toString().replace('days', '')),
			expiry,
			status,
			restaurantCount,
		})

		if (!package) {
			return res.status(404).json({ status: 0, message: 'No packages found' })
		}
		return res
			.status(200)
			.json({ status: 1, message: ' Package updated successfully', package })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const deletePackage = async (req, res) => {
	try {
		const package = await Package.findByIdAndDelete(req.params.packageId)

		if (!package) {
			return res.status(404).json({ status: 0, message: 'No packages found' })
		}
		return res
			.status(200)
			.json({ status: 1, message: 'Package deleted successfully' })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const searchPackage = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const packages = await paginate(req, Package, [
			await searchMatchPipeline(Package, field, search, where),
		])

		if (!packages.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No package found',
				packages_count: packages.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search package data.',
			packages_count: packages.totalDocs,
			packages,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	getAllPackages,
	getPackage,
	addPackage,
	updatePackage,
	deletePackage,
	searchPackage,
}
