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

//Include other resources router
const courseRouter = require('./courses');

//re-routing into other resources router
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampByDistance);

router.route('/:id/photo').put(bootcampPhotoUpload);
router.route('/').get(getBootcamps).post(createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
