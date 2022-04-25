const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubscriptionSchema = new Schema({
  restaurantOwner: {
    type: Schema.Types.ObjectId,
    ref: 'RestaurantOwner',
    required: true,
  },
  restaurant:{
    type:Schema.Types.ObjectId,
    ref:'Restaurant'
  },
  package: {
    type: Schema.Types.ObjectId,
    ref: 'Package',
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Subscription', SubscriptionSchema)
