const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// env variables
dotenv.config({ path: './config/config.env' });

//mongoose bootcamp model
const Bootcamp = require('./models/Bootcamp');

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

//import files to mongoDB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log('data loaded to DB...');
    process.exit();
  } catch (error) {
    console.log('data loading failed :', error);
  }
};

//delete files from mongoDB
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
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
