const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

// implement advanced Results middleware
const Course = require('../models/Course');
const advancedResults = require('../middlewares/advancedResults');

// protect middleware
const { protect, authorize } = require('../middlewares/auth');

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('admin', 'publisher'), createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'publisher'), updateCourse)
  .delete(protect, authorize('admin', 'publisher'), deleteCourse);

module.exports = router;
