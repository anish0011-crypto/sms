const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Marksheet = require('../models/Marksheet');
const Setting = require('../models/Setting');

// ===== DASHBOARD STATS =====
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalExams = await Exam.countDocuments();
    const publishedMarksheets = await Marksheet.countDocuments({ isPublished: true });
    const recentStudents = await Student.find().populate('userId', 'name email').sort('-createdAt').limit(5);
    res.json({ totalStudents, totalTeachers, totalClasses, totalExams, publishedMarksheets, recentStudents });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== STUDENTS =====
const getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    const students = await Student.find(filter).populate('userId', 'name email phone profileImage').sort('rollNumber');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, rollNumber, class: cls, section, fatherName, motherName, dob, address, gender } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: 'student', phone });
    const student = await Student.create({ userId: user._id, rollNumber, class: cls, section, fatherName, motherName, dob, address, gender });
    res.status(201).json({ user, student });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, rollNumber, class: cls, section, fatherName, motherName, dob, address, gender } = req.body;
    const student = await Student.findByIdAndUpdate(req.params.id, { rollNumber, class: cls, section, fatherName, motherName, dob, address, gender }, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndUpdate(student.userId, { name, email, phone });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(student.userId);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== TEACHERS =====
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('userId', 'name email phone').sort('-createdAt');
    res.json(teachers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, employeeId, qualification, assignedClasses } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: 'teacher', phone });
    const teacher = await Teacher.create({ userId: user._id, employeeId, qualification, assignedClasses: assignedClasses || [] });
    res.status(201).json({ user, teacher });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateTeacher = async (req, res) => {
  try {
    const { name, email, phone, employeeId, qualification, assignedClasses } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { employeeId, qualification, assignedClasses }, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await User.findByIdAndUpdate(teacher.userId, { name, email, phone });
    res.json(teacher);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await User.findByIdAndDelete(teacher.userId);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== CLASSES =====
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('classTeacher');
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json(cls);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cls);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== SUBJECTS =====
const getSubjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    const subjects = await Subject.find(filter).populate('teacher');
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== EXAMS =====
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort('-createdAt');
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== MARKS =====
const getMarks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.exam) filter.exam = req.query.exam;
    if (req.query.student) filter.student = req.query.student;
    const marks = await Mark.find(filter).populate('student').populate('exam');
    res.json(marks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const saveMark = async (req, res) => {
  try {
    const { student, exam, subjectName, obtainedMarks, totalMarks } = req.body;
    const obt = Number(obtainedMarks);
    const tot = Number(totalMarks) || 100;
    const pct = tot > 0 ? (obt / tot) * 100 : 0;
    let grade = 'F';
    if (pct >= 80) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 45) grade = 'C';
    else if (pct >= 33) grade = 'D';

    let mark = await Mark.findOne({ student, exam, subjectName });
    if (mark) {
      mark.obtainedMarks = obt;
      mark.totalMarks = tot;
      mark.grade = grade;
      mark.enteredBy = req.user._id;
      await mark.save();
    } else {
      mark = await Mark.create({ student, exam, subjectName, obtainedMarks: obt, totalMarks: tot, grade, enteredBy: req.user._id });
    }
    res.json(mark);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const saveBulkMarks = async (req, res) => {
  try {
    const { exam, marks } = req.body;
    if (!exam || !Array.isArray(marks)) return res.status(400).json({ message: 'Exam and marks array required' });
    const results = [];
    for (const m of marks) {
      const { student, subjectName, obtainedMarks, totalMarks } = m;
      const obt = Number(obtainedMarks);
      const tot = Number(totalMarks) || 100;
      const pct = tot > 0 ? (obt / tot) * 100 : 0;
      let grade = 'F';
      if (pct >= 80) grade = 'A';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 45) grade = 'C';
      else if (pct >= 33) grade = 'D';

      let mark = await Mark.findOne({ student, exam, subjectName });
      if (mark) {
        mark.obtainedMarks = obt;
        mark.totalMarks = tot;
        mark.grade = grade;
        mark.enteredBy = req.user._id;
        await mark.save();
      } else {
        mark = await Mark.create({ student, exam, subjectName, obtainedMarks: obt, totalMarks: tot, grade, enteredBy: req.user._id });
      }
      results.push(mark);
    }
    res.json({ message: `${results.length} marks saved successfully`, count: results.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== ATTENDANCE =====
const getAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.date) filter.date = { $gte: new Date(req.query.date), $lte: new Date(req.query.date + 'T23:59:59') };
    const attendance = await Attendance.find(filter).populate({ path: 'student', populate: { path: 'userId', select: 'name' } });
    res.json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const saveAttendance = async (req, res) => {
  try {
    const { records } = req.body; // [{student, class, section, date, status}]
    const results = [];
    for (const record of records) {
      const att = await Attendance.findOneAndUpdate(
        { student: record.student, date: new Date(record.date) },
        { ...record, markedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(att);
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== MARKSHEETS =====
const getMarksheets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.exam) filter.exam = req.query.exam;
    const marksheets = await Marksheet.find(filter)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profileImage' } })
      .populate('exam')
      .sort('-createdAt');
    res.json(marksheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const generateMarksheets = async (req, res) => {
  try {
    const { examId, class: cls, section } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const students = await Student.find({ class: cls, section });
    const results = [];
    for (const student of students) {
      const marks = await Mark.find({ student: student._id, exam: examId });
      const totalMarks = marks.reduce((s, m) => s + m.totalMarks, 0);
      const obtainedMarks = marks.reduce((s, m) => s + m.obtainedMarks, 0);
      const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0;
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
      const ms = await Marksheet.findOneAndUpdate(
        { student: student._id, exam: examId },
        {
          student: student._id, exam: examId, class: cls, section,
          session: exam.session, month: exam.month, year: exam.year,
          marks: marks.map(m => ({ subjectName: m.subjectName, obtainedMarks: m.obtainedMarks, totalMarks: m.totalMarks, grade: m.grade })),
          totalMarks, obtainedMarks, percentage, overallGrade, remarks,
          generatedBy: req.user._id,
        },
        { upsert: true, new: true }
      );
      results.push(ms);
    }
    // Calculate ranks
    const sorted = results.sort((a, b) => b.obtainedMarks - a.obtainedMarks);
    for (let i = 0; i < sorted.length; i++) {
      await Marksheet.findByIdAndUpdate(sorted[i]._id, { rank: i + 1 });
    }
    res.json({ message: `${results.length} marksheets generated`, count: results.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const publishMarksheets = async (req, res) => {
  try {
    const { examId, class: cls, section } = req.body;
    await Marksheet.updateMany({ exam: examId, class: cls, section }, { isPublished: true });
    res.json({ message: 'Marksheets published successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMarksheetById = async (req, res) => {
  try {
    const ms = await Marksheet.findById(req.params.id)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profileImage' } })
      .populate('exam');
    if (!ms) return res.status(404).json({ message: 'Marksheet not found' });
    res.json(ms);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== SETTINGS =====
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSettings = async (req, res) => {
  try {
    const { schoolName, tagline, establishedYear, address, phone, email, website, currentSession, principalTitle } = req.body;
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }
    if (schoolName !== undefined) settings.schoolName = schoolName;
    if (tagline !== undefined) settings.tagline = tagline;
    if (establishedYear !== undefined) settings.establishedYear = establishedYear;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;
    if (website !== undefined) settings.website = website;
    if (currentSession !== undefined) settings.currentSession = currentSession;
    if (principalTitle !== undefined) settings.principalTitle = principalTitle;

    await settings.save();
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== REPORTS =====
const getReports = async (req, res) => {
  try {
    const classes = await Class.find();
    const reports = [];
    for (const cls of classes) {
      const students = await Student.countDocuments({ class: cls.name, section: cls.section });
      const marksheets = await Marksheet.find({ class: cls.name, section: cls.section, isPublished: true });
      const passed = marksheets.filter(m => m.percentage >= 33).length;
      reports.push({ class: cls.name, section: cls.section, totalStudents: students, passCount: passed, failCount: marksheets.length - passed });
    }
    res.json(reports);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getDashboardStats, getStudents, createStudent, updateStudent, deleteStudent,
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getClasses, createClass, updateClass, deleteClass,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getExams, createExam, updateExam, deleteExam,
  getMarks, saveMark, saveBulkMarks,
  getAttendance, saveAttendance,
  getMarksheets, generateMarksheets, publishMarksheets, getMarksheetById,
  getSettings, updateSettings,
  getReports,
};
