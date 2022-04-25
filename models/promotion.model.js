const mongoose = require('mongoose')
const Schema = mongoose.Schema

const promotionSchema = new Schema({
  addedBy:{
      type:Schema.Types.ObjectId
    },
  name:{
    type:String,
    required:true
  },

  startDate:{
    type:Date,
    required:true
  },
  endDate:{
    type:Date,
    required:true
  },
  duration:{
    type:Number,
    required:true
  },
  discount:
      {
        type:[Schema.Types.ObjectId],
        ref:'Discount'
      }
     
  ,
  restaurant:{
      type:Schema.Types.ObjectId,
      ref:'Restaurant'
  }
  
},{timestamps:true})

module.exports = mongoose.model('Promotion', promotionSchema)
