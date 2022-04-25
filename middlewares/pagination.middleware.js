const paginatedResult = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const totalPages = Math.ceil((await model.countDocuments().exec()) / limit)

    const results = {}

    if (totalPages > 0) {
      results.pages_count = totalPages
    }

    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit,
      }
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      }
    }
    try {
      results.result = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResult = results
      next()
    } catch (err) {
      console.log(err)
      res.status(500).json({status: 0, message: err.message })
    }
  }
}

module.exports = paginatedResult
