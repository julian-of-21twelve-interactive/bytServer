const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PettyCashTransactionSchema = new Schema({
  
  date:{
      type:Date,
      default:new Date()
  },
  transactionAmount:{
      type:Number,

  },
  receivedBy:{
      type:String
  },
  
  pettyCash:{
    type:Schema.Types.ObjectId,
    ref:'PettyCash'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('PettyCashTransaction', PettyCashTransactionSchema)