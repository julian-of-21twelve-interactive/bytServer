const mongoose = require('mongoose')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const { db } = require('../config/config')

mongoose
  .connect(`${db.dbUri}/${db.dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error.message)
    throw new Error(error)
  })

mongoose.plugin(aggregatePaginate)

module.exports = mongoose.connection
