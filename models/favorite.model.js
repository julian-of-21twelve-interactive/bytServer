const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FavoriteSchema = new Schema({
  menu: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  combo:{
    type:Schema.Types.ObjectId,
    ref:'BundleItem'
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
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

module.exports = mongoose.model('Favorite', FavoriteSchema)
