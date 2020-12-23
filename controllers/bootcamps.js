const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middlewares/async');

//@desc      get all bootcamps with query params like filtering, select, sort, pagination
//url        GET /api/v1/bootcamps
//@access    public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  //copy of request query
  let reqQuery = { ...req.query };

  const removedFields = ['select', 'sort', 'page', 'limit'];

  // loop through removedFields to remove unwanted queries
  removedFields.forEach((field) => delete reqQuery[field]);

  let queryStr = JSON.stringify(reqQuery);
  //query params & advanced search
  queryStr = queryStr.replace(/\bgt|gte|lt|lte|in\b/g, (match) => `$${match}`);

  // build query resource
  let query = Bootcamp.find(JSON.parse(queryStr));

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

  //pagination
  let pagination = {};

  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 1;
  let startIndex = (page - 1) * limit;
  let endIndex = page * limit;
  let totalDocuments = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //execute query
  const bootcamp = await query;

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

  res
    .status(200)
    .json({
      success: true,
      count: bootcamp.length,
      pagination,
      data: bootcamp,
    });
});

//@desc      get a bootcamp
//url        GET /api/v1/bootcamps/:id
//@access    public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp is not found for the id: ${req.params.id}`,
        404
      )
    );
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc      create a bootcamp
//url        POST /api/v1/bootcamps
//@access    private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

//@desc      update a bootcamp
//url        PUT /api/v1/bootcamps/:id
//@access    private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp is not found for the id: ${req.params.id}`,
        404
      )
    );
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc      delete a bootcamp
//url        DELETE /api/v1/bootcamps/:id
//@access    private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp is not found for the id: ${req.params.id}`,
        404
      )
    );
  res.status(200).json({ success: true, data: {} });
});

//@desc      get a bootcamp in a particular radius
//url        GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access    private
exports.getBootcampByDistance = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  //find the radius of earth in radians
  let radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(lng, lat);
  if (bootcamps.length === 0)
    return next(
      new ErrorResponse(
        `Bootcamp is not found within a distance of ${req.params.distance} miles for zipcode ${req.params.zipcode}`,
        404
      )
    );
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
