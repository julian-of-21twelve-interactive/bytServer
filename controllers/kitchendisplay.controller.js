const KitchenDisplay = require('../models/kitchenDisplay.model')

// - TODO: Input / Output currency data conversation pending.

const getAllKitchenDisplays = async (req, res) => {
	try {
		const kitchenDisplay = await KitchenDisplay.aggregate([
			{ $sort: { createdAt: -1 } },
		])

		if (!kitchenDisplay) {
			return res.status(404).json({
				status: 0,
				message: 'No Kitchen Items to display',
				KitchenDisplay_count: kitchenDisplay.length,
			})
		}
		res.status(200).json({
			status: 1,
			message: 'List of all kitchen display.',
			kitchenDisplay_count: kitchenDisplay.length,
			display_details: res.paginatedResult,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getKitchenDisplay = async (req, res) => {
	try {
		const kitchenDisplay = await KitchenDisplay.findById(
			req.params.kitchenDisplayId,
		)

		if (!kitchenDisplay) {
			return res
				.status(404)
				.json({ status: 0, message: 'No kitchenDisplays found' })
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Kitchen display received', kitchenDisplay })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const addKitchenDisplay = async (req, res) => {
	const { orderType, orderId, tableNo, paymentType, items } = req.body
	const displayList = new KitchenDisplay({
		orderType,
		orderId,
		tableNo,
		paymentType,
		items,
	})

	try {
		await displayList.save()
		res
			.status(201)
			.json({
				status: 1,
				message: 'Kitchen Display successfully added',
				displayList,
			})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const updateKitchenDisplay = async (req, res) => {
	const { orderType, orderId, tableNo, paymentType, items } = req.body

	try {
		const kitchenDisplay = await KitchenDisplay.findByIdAndUpdate(
			req.params.kitchenDisplayId,
			{
				orderType,
				orderId,
				tableNo,
				paymentType,
				items,
			},
		)
		if (!kitchenDisplay) {
			return res
				.status(404)
				.json({ status: 0, message: 'No kitchenDisplays found' })
		}
		return res.status(200).json({
			status: 1,
			message: 'Kitchen Display successfully updated',
			kitchenDisplay,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const deleteKitchenDisplay = async (req, res) => {
	try {
		const kitchenDisplay = await KitchenDisplay.findByIdAndDelete(
			req.params.kitchenDisplayId,
		)

		if (!kitchenDisplay) {
			return res
				.status(404)
				.json({ status: 0, message: 'No kitchenDisplays found' })
		}
		return res.status(200).json({
			status: 1,
			message: 'Kitchen display deleted successfully',
			kitchenDisplay,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

module.exports = {
	getAllKitchenDisplays,
	getKitchenDisplay,
	addKitchenDisplay,
	updateKitchenDisplay,
	deleteKitchenDisplay,
}
