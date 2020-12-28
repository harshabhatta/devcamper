const express = require('express');
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampByDistance,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

// advanced query middleware
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middlewares/advancedResults');

// protect & authorise middleware
const { protect, authorize } = require('../middlewares/auth');

//Include other resources router
const courseRouter = require('./courses');

//re-routing into other resources router
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampByDistance);

router
  .route('/:id/photo')
  .put(protect, authorize('admin', 'publisher'), bootcampPhotoUpload);
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('admin', 'publisher'), createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('admin', 'publisher'), updateBootcamp)
  .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);

module.exports = router;
