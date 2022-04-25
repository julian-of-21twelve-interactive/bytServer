const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
  eventName: {
    type: String,
    
  },
  eventType: {
    type: String,
    
  },
  startDate:{
      type:Date
  },
  endDate:{
      type:Date
  },
  duration:{
      type:Number
  },
  status:{
      type:Boolean,
      default:false
  },
  discount:{ 
    type:[Schema.Types.ObjectId]
  },
restaurant:{
  type: Schema.Types.ObjectId,
  ref:'Restaurant'
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Event',EventSchema)
