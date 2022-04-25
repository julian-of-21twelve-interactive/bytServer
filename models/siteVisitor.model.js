const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SiteVisitorSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  ip: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('SiteVisitor', SiteVisitorSchema)
