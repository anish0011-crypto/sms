require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Exam = require('./models/Exam');
const Mark = require('./models/Mark');
const Attendance = require('./models/Attendance');
const Marksheet = require('./models/Marksheet');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear all
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

  const teacher1 = await Teacher.create({
    userId: t1User._id, employeeId: 'EMP001', qualification: 'M.Sc Mathematics',
    assignedClasses: [{ class: 'Six', section: 'A', subjects: ['Math', 'Science'] }],
  });
  const teacher2 = await Teacher.create({
    userId: t2User._id, employeeId: 'EMP002', qualification: 'M.A English',
    assignedClasses: [{ class: 'Six', section: 'A', subjects: ['English', 'Urdu'] }],
  });

  // Classes
  await Class.create({ name: 'Six', section: 'A', classTeacher: teacher1._id, subjects: ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Drawing'], session: '2024-2025' });
  await Class.create({ name: 'Seven', section: 'A', subjects: ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Islamiat'], session: '2024-2025' });
  await Class.create({ name: 'Eight', section: 'B', subjects: ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Computer'], session: '2024-2025' });

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
    { name: 'Aina Asif', email: 'aina@rkdschool.com', rollNumber: '1405', fatherName: 'Asif', gender: 'Female', marks: [89, 66, 60, 58, 77, 60] },
    { name: 'Ali Hassan', email: 'ali@rkdschool.com', rollNumber: '1406', fatherName: 'Hassan', gender: 'Male', marks: [78, 72, 85, 70, 65, 55] },
    { name: 'Fatima Noor', email: 'fatima@rkdschool.com', rollNumber: '1407', fatherName: 'Noor', gender: 'Female', marks: [92, 88, 90, 85, 80, 78] },
    { name: 'Usman Tariq', email: 'usman@rkdschool.com', rollNumber: '1408', fatherName: 'Tariq', gender: 'Male', marks: [55, 60, 48, 52, 58, 50] },
    { name: 'Zara Malik', email: 'zara@rkdschool.com', rollNumber: '1409', fatherName: 'Malik', gender: 'Female', marks: [70, 75, 68, 72, 74, 66] },
  ];

  const subjects = ['English', 'Urdu', 'Math', 'Science', 'Pak Studies', 'Drawing'];
  const students = [];
  const studentUsers = [];

  for (const sd of studentData) {
    const u = await User.create({ name: sd.name, email: sd.email, password: 'student123', role: 'student', phone: '0300000000' });
    const s = await Student.create({ userId: u._id, rollNumber: sd.rollNumber, class: 'Six', section: 'A', fatherName: sd.fatherName, gender: sd.gender, dob: new Date('2012-03-15'), address: 'Lahore, Pakistan' });
    students.push({ student: s, marksData: sd.marks });
    studentUsers.push(u);
  }

  // Exam
  const exam = await Exam.create({
    name: 'Monthly Test - July 2025', class: 'Six', section: 'A', type: 'Monthly',
    session: '2024-2025', month: 'July', year: '2025',
    subjects: subjects.map(s => ({ name: s, totalMarks: 100 })),
    date: new Date('2025-07-15'),
  });

  // Marks
  for (const { student, marksData } of students) {
    for (let i = 0; i < subjects.length; i++) {
      const pct = (marksData[i] / 100) * 100;
      let grade = 'F';
      if (pct >= 80) grade = 'A';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 45) grade = 'C';
      else if (pct >= 33) grade = 'D';
      await Mark.create({ student: student._id, exam: exam._id, subjectName: subjects[i], obtainedMarks: marksData[i], totalMarks: 100, grade, enteredBy: adminUser._id });
    }
  }

  // Attendance (last 30 days)
  for (const { student } of students) {
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
      const rand = Math.random();
      const status = rand > 0.85 ? 'Absent' : rand > 0.75 ? 'Late' : 'Present';
      try {
        await Attendance.create({ student: student._id, class: 'Six', section: 'A', date, status, markedBy: adminUser._id });
      } catch (e) {}
    }
  }

  // Marksheets
  const marksheetDocs = [];
  for (const { student, marksData } of students) {
    const totalMarks = subjects.length * 100;
    const obtainedMarks = marksData.reduce((s, m) => s + m, 0);
    const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(1);
    let overallGrade = 'F';
    if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 45) overallGrade = 'C';
    else if (percentage >= 33) overallGrade = 'D';
    let remarks = 'Fail';
    if (percentage >= 80) remarks = 'Excellent';
    else if (percentage >= 60) remarks = 'Very Good';
    else if (percentage >= 45) remarks = 'Good';
    else if (percentage >= 33) remarks = 'Average';
    const pctNum = parseFloat(percentage);
    const ms = await Marksheet.create({
      student: student._id, exam: exam._id, class: 'Six', section: 'A',
      session: '2024-2025', month: 'July', year: '2025',
      marks: subjects.map((s, i) => {
        const pct2 = (marksData[i] / 100) * 100;
        let g = 'F';
        if (pct2 >= 80) g = 'A'; else if (pct2 >= 60) g = 'B'; else if (pct2 >= 45) g = 'C'; else if (pct2 >= 33) g = 'D';
        return { subjectName: s, obtainedMarks: marksData[i], totalMarks: 100, grade: g };
      }),
      totalMarks, obtainedMarks, percentage: pctNum, overallGrade, remarks, isPublished: true,
      generatedBy: adminUser._id,
    });
    marksheetDocs.push({ ms, obtainedMarks });
  }

  // Assign ranks
  marksheetDocs.sort((a, b) => b.obtainedMarks - a.obtainedMarks);
  for (let i = 0; i < marksheetDocs.length; i++) {
    await Marksheet.findByIdAndUpdate(marksheetDocs[i].ms._id, { rank: i + 1 });
  }

  console.log('\n✅ Database seeded successfully!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('👑 Admin:   admin@rkdschool.com   / admin123');
  console.log('👨‍🏫 Teacher: ahmed@rkdschool.com   / teacher123');
  console.log('👨‍🏫 Teacher: sara@rkdschool.com    / teacher123');
  console.log('🎓 Student: aina@rkdschool.com    / student123');
  console.log('🎓 Student: ali@rkdschool.com     / student123');
  console.log('🎓 Student: fatima@rkdschool.com  / student123');
  console.log('========================\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
