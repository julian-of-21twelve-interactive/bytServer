const paginate = async (req, Model, aggregate = []) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit),
    pagination: req.query.limit || false,
  }

  const myAggregate = Model.aggregate(aggregate)

  const data = await myAggregate.paginateExec(options)

  const results = {}

  results.page = data.page
  results.limit = data.limit
  results.totalDocs = data.totalDocs
  results.totalPages = data.totalPages
  results.pagingCounter = data.pagingCounter
  if (data.hasPrevPage) results.previousPage = data.prevPage
  if (data.hasNextPage) results.nextPage = data.nextPage

  results.result = data.docs

  return results
}

module.exports = paginate
