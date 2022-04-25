const { ObjectId } = require('mongodb')
const SearchHistory = require('../models/searchHistory.model')
const paginate = require('../utils/aggregatePaginate.util')

const addSearchHistory = async (req, res) => {
	const { text, user, type, searchId } = req.body

	try {
		const searchHistory = new SearchHistory({ text, user, type, searchId })

		await searchHistory.save()

		res.status(201).json({
			status: 1,
			message: 'Search history added successfully',
			searchHistory,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllSearchHistory = async (req, res) => {
	try {
		const searchHistories = await paginate(req, SearchHistory, [
			{ $sort: { createdAt: -1 } },
		])

		if (!searchHistories.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No search histories found',
				searchHistories_count: searchHistories.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all search history.',
			searchHistories_count: searchHistories.totalDocs,
			searchHistories,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSearchHistory = async (req, res) => {
	try {
		const searchHistory = await SearchHistory.findOne({
			_id: req.params.searchHistoryId,
		})

		if (!searchHistory) {
			return res
				.status(404)
				.json({ status: 0, message: 'No search history found with this id' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'Search history data.', searchHistory })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateSearchHistory = async (req, res) => {
	const { text, user, type, searchId } = req.body

	try {
		const searchHistory = await SearchHistory.findByIdAndUpdate(
			req.params.searchHistoryId,
			{ text, user, type, searchId },
			{ new: true },
		)

		if (!searchHistory) {
			return res.status(404).json({
				status: 0,
				message: 'No search history with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search history updated successfully',
			searchHistory,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteSearchHistory = async (req, res) => {
	try {
		const searchHistory = await SearchHistory.findByIdAndDelete(
			req.params.searchHistoryId,
		)

		if (!searchHistory) {
			return res.status(404).json({
				status: 0,
				message: 'No search history with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search history removed successfully',
			searchHistory,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSearchHistoryByUser = async (req, res) => {
	try {
		const searchHistories = await paginate(req, SearchHistory, [
			{ $match: { user: ObjectId(req.params.userId) } },
		])

		if (!searchHistories.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No search history found',
				searchHistories_count: searchHistories.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'User search history',
			searchHistories_count: searchHistories.totalDocs,
			searchHistories,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addSearchHistory,
	getAllSearchHistory,
	getSearchHistory,
	updateSearchHistory,
	deleteSearchHistory,
	getSearchHistoryByUser,
}
