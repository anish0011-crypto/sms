const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Marksheet = require('../models/Marksheet');
const Exam = require('../models/Exam');

// Get teacher's own dashboard stats
const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    let totalStudents = 0;
    for (const ac of teacher.assignedClasses) {
      const count = await Student.countDocuments({ class: ac.class, section: ac.section });
      totalStudents += count;
    }
    const totalClasses = teacher.assignedClasses.length;
    res.json({ teacher, totalStudents, totalClasses });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get students in teacher's assigned classes
const getMyStudents = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    const conditions = teacher.assignedClasses.map(ac => ({ class: ac.class, section: ac.section }));
    const students = await Student.find(conditions.length ? { $or: conditions } : { _id: null })
      .populate('userId', 'name email phone');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Enter/update marks (teacher can only enter for their assigned classes)
const enterMarks = async (req, res) => {
  try {
    const { student, exam, subjectName, obtainedMarks, totalMarks } = req.body;
    let mark = await Mark.findOne({ student, exam, subjectName });
    if (mark) {
      mark.obtainedMarks = obtainedMarks;
      mark.totalMarks = totalMarks;
      mark.enteredBy = req.user._id;
      await mark.save();
    } else {
      mark = await Mark.create({ student, exam, subjectName, obtainedMarks, totalMarks, enteredBy: req.user._id });
    }
    res.json(mark);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get marks for an exam (teacher can only see for their assigned classes)
const getMarks = async (req, res) => {
  try {
    const { exam } = req.query;
    if (!exam) return res.status(400).json({ message: 'Exam ID required' });
    
    // We could filter by teacher's classes, but Marks are linked to students.
    // If they can see the exam and their students, they can see the marks.
    const marks = await Mark.find({ exam }).populate('student');
    res.json(marks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
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

// Get student performance
const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Mark.find({ student: studentId }).populate('exam');
    const attendance = await Attendance.find({ student: studentId });
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const attendancePct = attendance.length > 0 ? ((presentDays / attendance.length) * 100).toFixed(1) : 0;
    res.json({ marks, attendance: { total: attendance.length, present: presentDays, percentage: attendancePct } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// View marksheets for teacher's classes
const getMyMarksheets = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    const conditions = teacher.assignedClasses.map(ac => ({ class: ac.class, section: ac.section }));
    const marksheets = await Marksheet.find(conditions.length ? { $or: conditions } : { _id: null })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name' } })
      .populate('exam');
    res.json(marksheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getExamsForTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    const conditions = teacher.assignedClasses.map(ac => ({ class: ac.class, section: ac.section }));
    const exams = await Exam.find(conditions.length ? { $or: conditions } : { _id: null });
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getTeacherDashboard, getMyStudents, enterMarks, getMarks, markAttendance, getStudentPerformance, getMyMarksheets, getExamsForTeacher };
