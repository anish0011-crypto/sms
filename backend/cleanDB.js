require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Exam = require('./models/Exam');
const Mark = require('./models/Mark');
const Attendance = require('./models/Attendance');
const Marksheet = require('./models/Marksheet');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rkd_school')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

const cleanDB = async () => {
  try {
    console.log('🧹 Wiping Database...');
    
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Exam.deleteMany({});
    await Mark.deleteMany({});
    await Attendance.deleteMany({});
    await Marksheet.deleteMany({});
    
    console.log('✅ Database wiped completely.');

    console.log('👑 Creating Root Admin User...');
    
    await User.create({
      name: 'Super Admin',
      email: 'admin@rkdschool.com',
      password: 'admin123',
      role: 'admin',
      phone: '+923000000000'
    });

    console.log('✅ Admin User Created: admin@rkdschool.com / admin123');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

cleanDB();
