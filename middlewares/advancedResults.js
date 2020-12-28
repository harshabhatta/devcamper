//middleware to implement query params like filtering, select, sort, pagination
const advancedResults = (model, populate) => async (req, res, next) => {
  //copy of request query
  let reqQuery = { ...req.query };

  const removedFields = ['select', 'sort', 'page', 'limit'];

  // loop through removedFields to remove unwanted queries
  removedFields.forEach((field) => delete reqQuery[field]);

  let queryStr = JSON.stringify(reqQuery);
  //query params & advanced search
  queryStr = queryStr.replace(/\bgt|gte|lt|lte|in\b/g, (match) => `$${match}`);

  // build query resource
  let query = model.find(JSON.parse(queryStr));

  //select fields
  if (req.query.select) {
    let selectData = req.query.select.split(',').join(' ');
    query = query.select(selectData);
  }

  //sort fields
  if (req.query.sort) {
    let sortData = req.query.sort.split(',').join(' ');
    query = query.sort(sortData);
  } else {
    //default sorting by createdAt desc
    query = query.sort('-createdAt');
  }

  //populate
  if (populate) {
    query = query.populate(populate);
  }

  //pagination
  let pagination = {};

  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 25;
  let startIndex = (page - 1) * limit;
  let endIndex = page * limit;
  let totalDocuments = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //execute query
  const results = await query;

  if (endIndex < totalDocuments) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
