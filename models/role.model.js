const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RolesSchema = new Schema(
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
		color: {
			type: String,
			default: '#001529',
		},
		refModel: String,
		creator: {
			type: Schema.Types.ObjectId,
			refPath: 'refModel',
		},
		permissionList: {
			type: Schema.Types.ObjectId,
			ref: 'Permission',
		},
		roleAccessTags: {
			type: [String],
			enum: ['SUB-ADMIN', 'SUPER'],
		},
		hasAccessTags: {
			type: [String],
			enum: ['SUB-ADMIN'],
			// subAdmin for access management
		},
		isSuper: {
			type: Boolean,
			default: false,
		},
		isRestaurantOwner: {
			type: Boolean,
			default: false,
		},
		isUser: {
			type: Boolean,
			default: false,
		},
		isSupplier: {
			type: Boolean,
			default: false,
		},
		isStaff: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Roles', RolesSchema)
