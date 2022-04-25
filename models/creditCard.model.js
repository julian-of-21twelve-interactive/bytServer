const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CreditCardSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('CreditCard', CreditCardSchema)
