const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async');

//@desc      get all bootcamps
//url        /api/v1/bootcamps
//@access    public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamp.length, data: bootcamp });
});

//@desc      get a bootcamp
//url        /api/v1/bootcamps/:id
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
//url        /api/v1/bootcamps
//@access    private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

//@desc      update a bootcamp
//url        /api/v1/bootcamps/:id
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
//url        /api/v1/bootcamps/:id
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
