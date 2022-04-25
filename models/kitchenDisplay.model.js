const mongoose = require('mongoose')
const Schema = mongoose.Schema

const KitchenDisplaySchema = new Schema({
  orderType: {
    type: String,
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  tableNo: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
  },
  items: {
    type: [
      {
        item: String,
        quantity: Number,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('KitchenDisplay', KitchenDisplaySchema)
