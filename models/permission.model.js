const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PermissionSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		permissions: {
			type: [
				{
					module: {
						type: String,
						required: true,
					},
					create: {
						type: Boolean,
						default: false,
					},
					read: {
						type: Boolean,
						default: false,
					},
					update: {
						type: Boolean,
						default: false,
					},
					delete: {
						type: Boolean,
						default: false,
					},
				},
			],
			required: true,
			_id: false,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Permission', PermissionSchema)
