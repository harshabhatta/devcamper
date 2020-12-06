const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middlewares/async');

//@desc      get all bootcamps
//url        GET /api/v1/bootcamps
//@access    public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamp.length, data: bootcamp });
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
