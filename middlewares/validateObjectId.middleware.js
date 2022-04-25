const { ObjectId } = require('mongodb')

const validateObjectId = (idToCheck) => (req, res, next) => {
  if (!ObjectId.isValid(req.params[idToCheck]))
    return res.status(400).json({ status: 0, message: 'Invalid ID' })
  next()
}

module.exports = validateObjectId
