const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AddressSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addressType: {
    type: String,
    required: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Address', AddressSchema)
