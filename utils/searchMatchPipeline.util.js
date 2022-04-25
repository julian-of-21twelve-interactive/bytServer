const { ObjectId } = require('mongodb')

const searchMatchPipeline = async (Model, field, search, where = '') => {
	const checkDataType = await Model.aggregate([
		{ $limit: 1 },
		{
			$project: {
				type: {
					$type: `$${field}`,
				},
				_id: 0,
			},
		},
	])

	let $where = {}

	if (where) {
		const whereJson = JSON.parse(where)
		const key = Object.keys(whereJson)
		const val = whereJson[key]

		$where = { $expr: { $eq: [{ $toString: `$${key}` }, val] } }
	}

	let searchQuery = search
	if (searchQuery === 'true') searchQuery = true
	if (searchQuery === 'false') searchQuery = false

	let matchPipeline = {
		$match: { [field]: { $regex: searchQuery, $options: 'i' }, ...$where },
	}

	if (['int', 'double'].includes(checkDataType[0].type)) {
		matchPipeline = {
			$match: {
				$and: [{ $expr: { $eq: [`$${field}`, Number(searchQuery)] } }, $where],
			},
		}
	} else if (checkDataType[0].type === 'bool') {
		matchPipeline = {
			$match: {
				$and: [{ $expr: { $eq: [`$${field}`, searchQuery] } }, $where],
			},
		}
	} else if (checkDataType[0].type === 'objectId') {
		matchPipeline = {
			$match: {
				$and: [
					{ $expr: { $eq: [`$${field}`, ObjectId(searchQuery)] } },
					$where,
				],
			},
		}
	} else if (checkDataType[0].type === 'array') {
		matchPipeline = {
			$match: {
				$and: [{ $expr: { $in: [searchQuery, `$${field}`] } }, $where],
			},
		}
	} else if (checkDataType[0].type === 'date') {
		matchPipeline = {
			$match: {
				$and: [
					{ $expr: { $eq: [new Date(searchQuery), `$${field}`] } },
					$where,
				],
			},
		}
	}

	return matchPipeline
}

module.exports = searchMatchPipeline
