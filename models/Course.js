const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please enter a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please enter a course description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

CourseSchema.statics.averageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: {
        bootcamp: bootcampId,
      },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

// calculate averageCost of the courses for a bootcamp after a course is removed
CourseSchema.post('remove', async function () {
  this.constructor.averageCost(this.bootcamp);
});

// calculate averageCost of the courses for a bootcamp after a course is added
CourseSchema.post('save', async function () {
  this.constructor.averageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
