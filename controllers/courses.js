const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

const asyncHandler = require('../middlewares/async');

//@desc      get all courses
//routes     GET /api/v1/courses -> get all the courses
//routes     GET /api/v1/bootcamps/:bootcampId/courses -> get all courses specific to bootcampId
//@access    public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  // build query
  if (req.params.bootcampId) {
    query = Course.find({
      bootcamp: req.params.bootcampId,
    });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    });
  }

  //execute query
  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

//@desc      get single course
//routes     GET /api/v1/courses/:id
//@access    public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found for the id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc      create a course
//routes     POST /api/v1/bootcamps/:bootcampId/courses
//@access    private
exports.createCourse = asyncHandler(async (req, res, next) => {
  // populate bootcampId params to body
  req.body.bootcamp = req.params.bootcampId;

  // check whether bootcamp is pesent for the Id
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found for the id: ${req.params.bootcampId}`,
        404
      )
    );
  }
  // insert course if the bootcamp is present
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

//@desc      update a course
//routes     PUT /api/v1/courses/:id
//@access    private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found for the id: ${req.params.id}`, 404)
    );
  }
  // update course if it is present
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc      delete a course
//routes     DELETE /api/v1/courses/:id
//@access    private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found for the id: ${req.params.id}`, 404)
    );
  }
  course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
