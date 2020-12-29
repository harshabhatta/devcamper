const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// env variables
dotenv.config({ path: './config/config.env' });

//mongoose bootcamp model
const Bootcamp = require('./models/Bootcamp');

//mongoose course model
const Course = require('./models/Course');

//mongoose user model
const User = require('./models/User');

//connect to mongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//Read JSON files - bootcamps
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

//Read JSON files - courses
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

//Read JSON files - users
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

//import files to mongoDB
const importData = async () => {
  try {
    // create bootcamps
    await Bootcamp.create(bootcamps);
    // create courses
    await Course.create(courses);
    //create users
    await User.create(users);
    console.log('data loaded to DB...');
    process.exit();
  } catch (error) {
    console.log('data loading failed :', error);
  }
};

//delete files from mongoDB
const deleteData = async () => {
  try {
    // delete all bootcamps
    await Bootcamp.deleteMany();
    // delete all courses
    await Course.deleteMany();
    // delete all users
    await User.deleteMany();

    console.log('data deleted from DB...');
    process.exit();
  } catch (error) {
    console.log('data deletion failed :', error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
