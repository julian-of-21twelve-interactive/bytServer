const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema(
	{
		orderNo: {
			type: String,
			required: true,
			unique: true,
		},
		orderName: {
			type: String,
		},
		customer: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		staff: {
			type: Schema.Types.ObjectId,
			ref: 'StaffMember',
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		category: {
			type: String,
			lowercase: true,
			// vegetarian, non-vegetarian
		},
		orderStatus: {
			type: String,
			default: 'pending',
			// pending, preparing, complete
		},
		orderType: {
			type: String,
			required: true,
			// dine-in, pickup, delivery
		},
		orderFrom: {
			type: String,
			lowercase: true,
			default: 'customer',
		},
		paymentType: {
			type: String,
			required: true,
			// single, split
		},
		paymentMethod: {
			type: String,
			required: true,
			// online, cash
		},
		paymentStatus: {
			type: Boolean,
			default: false,
		},
		table: {
			type: [Schema.Types.ObjectId],
			ref: 'Table',
		},
		guests: {
			type: [Schema.Types.ObjectId],
			ref: 'User',
			required: true,
		},
		items: [
			{
				item: {
					type: Schema.Types.ObjectId,
					ref: 'MenuItem',
				},
				combo: {
					type: Schema.Types.ObjectId,
					ref: 'BundleItem',
				},
				quantity: Number,
				customer: [
					{
						customerId: {
							type: Schema.Types.ObjectId,
							ref: 'User',
						},
						quantity: {
							type: Number,
						},
						totalPrice: Number,
						addon: [
							{
								id: {
									type: Schema.Types.ObjectId,
									ref: 'Addon',
								},
								quantity: Number,
								price: {
									type: Number,
									required: true,
								},
								_id: false,
							},
						],
						note: String,
						_id: false,
					},
				],
				estimatedTime: Number,
				addons: [
					{
						id: {
							type: Schema.Types.ObjectId,
							ref: 'Addon',
						},
						quantity: Number,
						_id: false,
					},
				],
				totalPrice: {
					itemPrice: Number,
					addonPrice: Number,
					total: Number,
				},
				price: {
					type: Number,
					required: true,
				},
				_id: false,
			},
		],
		visitors: {
			adult: Number,
			children: Number,
		},
		status: {
			type: Boolean,
			default: false,
		},
		instructions: String,
		waitingList: { type: Number, default: 0 },
		coupon: {
			type: Schema.Types.ObjectId,
			ref: 'Coupon',
		},
		deliveryTime: {
			type: Date,
		},
		estimatedTime: {
			type: Number,
		},
		preparationTime: {
			start: Date,
			end: Date,
		},
		price: {
			addon: { type: Number, required: true },
			points: { type: Number, default: 0 },
			tip: { type: Number, default: 0 },
			subtotal: { type: Number, required: true },
			tax: { type: Number, default: 0 },
			total: { type: Number, required: true },
		},
		reOrder: {
			orderId: {
				type: Schema.Types.ObjectId,
			},
			count: {
				type: Number,
				default: 0,
			},
		},
	},
	{ timestamps: true },
)

OrderSchema.pre('validate', function (next) {
	const random = (Math.floor(Math.random() * 9e16) + 1e16)
		.toString(36)
		.toUpperCase()
	this.orderNo = random.toString()
	next()
})

OrderSchema.index({ restaurant: 1 }, { background: true })
OrderSchema.index({ customer: 1 }, { background: true })

module.exports = mongoose.model('Order', OrderSchema)
