const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoiceSchema = new Schema({
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	invoiceId: {
		type: String,
		required: true,
		unique: true,
	},
	restaurant: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant',
		required: true,
	},
	order: {
		type: Schema.Types.ObjectId,
		ref: 'Order',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

InvoiceSchema.pre('validate', function (next) {
	const random = Math.floor(Math.random() * 9e7) + 1e7
	this.invoiceId = random.toString()
	next()
})

module.exports = mongoose.model('Invoice', InvoiceSchema)
