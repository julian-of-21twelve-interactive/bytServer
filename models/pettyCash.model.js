const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PettyCashSchema = new Schema({
  addedBy:{
      type:String,

  },
  dayStartAmount:{
      type:Number,
      required:true
  },
  remainingAmount:{
      type:Number,
      

  },
  date:{
      type:Date,
      default:new Date()
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

module.exports = mongoose.model('PettyCash', PettyCashSchema)
