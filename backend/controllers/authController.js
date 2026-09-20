const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account is disabled' });

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Register a new student
// @route POST /api/auth/register-student
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create User record
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'student'
    });

    // Create empty Student profile
    const profile = await Student.create({
      userId: user._id,
      rollNumber: `STU${Date.now().toString().slice(-6)}`,
      class: '',
      section: ''
    });

    res.status(201).json({
      message: 'Student registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'student') profile = await Student.findOne({ userId: user._id });
    else if (user.role === 'teacher') profile = await Teacher.findOne({ userId: user._id });
    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update user profile (password)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.currentPassword && req.body.newPassword) {
      if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      user.password = req.body.newPassword;
    }
    
    if (req.body.phone) user.phone = req.body.phone;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setupInitialAccounts = async (req, res) => {
  try {
    // Full reseed — clears all data and creates fresh accounts
    const Class = require('../models/Class');
    const Subject = require('../models/Subject');
    const Exam = require('../models/Exam');
    const Mark = require('../models/Mark');
    const Attendance = require('../models/Attendance');
    const Marksheet = require('../models/Marksheet');

    // Clear everything
    await Promise.all([
      User.deleteMany(), Student.deleteMany(), Teacher.deleteMany(),
      Class.deleteMany(), Subject.deleteMany(), Exam.deleteMany(),
      Mark.deleteMany(), Attendance.deleteMany(), Marksheet.deleteMany(),
    ]);

    // Admin
    const adminUser = await User.create({ name: 'RKD Admin', email: 'admin@rkdschool.com', password: 'admin123', role: 'admin', phone: '03001234567' });

    // Teachers
    const t1User = await User.create({ name: 'Mr. Ahmed Ali', email: 'ahmed@rkdschool.com', password: 'teacher123', role: 'teacher', phone: '03001111111' });
    const t2User = await User.create({ name: 'Ms. Sara Khan', email: 'sara@rkdschool.com', password: 'teacher123', role: 'teacher', phone: '03002222222' });

    const teacher1 = await Teacher.create({ userId: t1User._id, employeeId: 'EMP001', qualification: 'M.Sc Mathematics', assignedClasses: [{ class: 'Six', section: 'A', subjects: ['Math', 'Science'] }] });
    const teacher2 = await Teacher.create({ userId: t2User._id, employeeId: 'EMP002', qualification: 'M.A English', assignedClasses: [{ class: 'Six', section: 'A', subjects: ['English', 'Urdu'] }] });

    // Classes
    await Class.create({ name: 'Six', section: 'A', classTeacher: teacher1._id, subjects: ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Drawing'], session: '2024-2025' });
    await Class.create({ name: 'Seven', section: 'A', subjects: ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Islamiat'], session: '2024-2025' });

    // Subjects
    await Subject.insertMany([
      { name: 'English', code: 'ENG', class: 'Six', section: 'A', teacher: teacher2._id, totalMarks: 100 },
      { name: 'Urdu', code: 'URD', class: 'Six', section: 'A', teacher: teacher2._id, totalMarks: 100 },
      { name: 'Math', code: 'MTH', class: 'Six', section: 'A', teacher: teacher1._id, totalMarks: 100 },
      { name: 'Science', code: 'SCI', class: 'Six', section: 'A', teacher: teacher1._id, totalMarks: 100 },
      { name: 'Pak Studies', code: 'PST', class: 'Six', section: 'A', totalMarks: 100 },
      { name: 'Drawing', code: 'DRW', class: 'Six', section: 'A', totalMarks: 100 },
    ]);

    // Students
    const studentData = [
      { name: 'Aina Asif',    email: 'aina@rkdschool.com',   rollNumber: '1405', fatherName: 'Asif',   gender: 'Female', marks: [89, 66, 60, 58, 77, 60] },
      { name: 'Ali Hassan',   email: 'ali@rkdschool.com',    rollNumber: '1406', fatherName: 'Hassan', gender: 'Male',   marks: [78, 72, 85, 70, 65, 55] },
      { name: 'Fatima Noor',  email: 'fatima@rkdschool.com', rollNumber: '1407', fatherName: 'Noor',   gender: 'Female', marks: [92, 88, 90, 85, 80, 78] },
      { name: 'Usman Tariq',  email: 'usman@rkdschool.com',  rollNumber: '1408', fatherName: 'Tariq',  gender: 'Male',   marks: [55, 60, 48, 52, 58, 50] },
      { name: 'Zara Malik',   email: 'zara@rkdschool.com',   rollNumber: '1409', fatherName: 'Malik',  gender: 'Female', marks: [70, 75, 68, 72, 74, 66] },
    ];
    const subjectNames = ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Drawing'];
    const students = [];
    for (const sd of studentData) {
      const u = await User.create({ name: sd.name, email: sd.email, password: 'student123', role: 'student', phone: '0300000000' });
      const s = await Student.create({ userId: u._id, rollNumber: sd.rollNumber, class: 'Six', section: 'A', fatherName: sd.fatherName, gender: sd.gender, dob: new Date('2012-03-15'), address: 'Lahore, Pakistan' });
      students.push({ student: s, marksData: sd.marks });
    }

    // Exam
    const exam = await Exam.create({ name: 'Monthly Test - July 2025', class: 'Six', section: 'A', type: 'Monthly', session: '2024-2025', month: 'July', year: '2025', subjects: subjectNames.map(s => ({ name: s, totalMarks: 100 })), date: new Date('2025-07-15') });

    // Marks
    for (const { student, marksData } of students) {
      for (let i = 0; i < subjectNames.length; i++) {
        const pct = marksData[i];
        let grade = pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 45 ? 'C' : pct >= 33 ? 'D' : 'F';
        await Mark.create({ student: student._id, exam: exam._id, subjectName: subjectNames[i], obtainedMarks: marksData[i], totalMarks: 100, grade, enteredBy: adminUser._id });
      }
    }

    // Marksheets
    const msDocs = [];
    for (const { student, marksData } of students) {
      const totalMarks = subjectNames.length * 100;
      const obtainedMarks = marksData.reduce((s, m) => s + m, 0);
      const percentage = parseFloat(((obtainedMarks / totalMarks) * 100).toFixed(1));
      const overallGrade = percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 45 ? 'C' : percentage >= 33 ? 'D' : 'F';
      const remarks = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Very Good' : percentage >= 45 ? 'Good' : percentage >= 33 ? 'Average' : 'Fail';
      const ms = await Marksheet.create({
        student: student._id, exam: exam._id, class: 'Six', section: 'A', session: '2024-2025', month: 'July', year: '2025',
        marks: subjectNames.map((s, i) => { const g = marksData[i] >= 80 ? 'A' : marksData[i] >= 60 ? 'B' : marksData[i] >= 45 ? 'C' : marksData[i] >= 33 ? 'D' : 'F'; return { subjectName: s, obtainedMarks: marksData[i], totalMarks: 100, grade: g }; }),
        totalMarks, obtainedMarks, percentage, overallGrade, remarks, isPublished: true, generatedBy: adminUser._id,
      });
      msDocs.push({ ms, obtainedMarks });
    }
    msDocs.sort((a, b) => b.obtainedMarks - a.obtainedMarks);
    for (let i = 0; i < msDocs.length; i++) await Marksheet.findByIdAndUpdate(msDocs[i].ms._id, { rank: i + 1 });

    res.status(201).json({
      message: '✅ Database seeded successfully! All accounts created.',
      credentials: {
        admin:    { email: 'admin@rkdschool.com',   password: 'admin123' },
        teacher1: { email: 'ahmed@rkdschool.com',   password: 'teacher123' },
        teacher2: { email: 'sara@rkdschool.com',    password: 'teacher123' },
        students: [
          { email: 'aina@rkdschool.com',   password: 'student123' },
          { email: 'ali@rkdschool.com',    password: 'student123' },
          { email: 'fatima@rkdschool.com', password: 'student123' },
          { email: 'usman@rkdschool.com',  password: 'student123' },
          { email: 'zara@rkdschool.com',   password: 'student123' },
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, registerStudent, getMe, updateProfile, setupInitialAccounts };
