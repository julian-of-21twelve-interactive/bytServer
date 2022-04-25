const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PackageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  validity: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  restaurantCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Package', PackageSchema)
