const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewVoteSchema = new Schema({
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  voteType: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('ReviewVote', ReviewVoteSchema)
