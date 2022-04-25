const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FavoriteRestaurantSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('FavoriteRestaurant', FavoriteRestaurantSchema)
