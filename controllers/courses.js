const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async');

//@desc      get all courses
//routes     GET /api/v1/courses -> get all the courses
//routes     GET /api/v1/bootcamps/:bootcampId/courses -> get all courses specific to bootcampId
//@access    public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId,
    });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
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
  // populate bootcampId params and user id to body
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

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
  // if the user is not the owner of the bootcamp, then don't allow to create a course
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id: ${req.user.id} is not authorised to create a course of bootcamp id: ${req.params.bootcampId}`,
        401
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
  // if the user is not the owner of the bootcamp, then don't allow to update a course
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id: ${req.user.id} is not authorised to update a course of id: ${req.params.id}`,
        401
      )
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
  // if the user is not the owner of the bootcamp, then don't allow to delete a course
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id: ${req.user.id} is not authorised to delete a course of id: ${req.params.id}`,
        401
      )
    );
  }
  course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
