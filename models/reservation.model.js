const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReservationSchema = new Schema({
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  guests: {
    type: [{ guest: Schema.Types.ObjectId }],
    _id: false,
    ref: 'User',
    default: [],
  },
  reservationDetails: {
    type: [
      {
        date: String,
        time: String,
        totalGuests: Number,
        shift: String,
        cancellationTime: Date,
        origin: String,
        guestType: String,
        notes: String,
      },
    ],
    default: [],
  },
  tableDetails: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Reservation', ReservationSchema)
