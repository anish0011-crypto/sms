const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Marksheet = require('../models/Marksheet');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

// Helper to ensure teacher profile exists
const getOrCreateTeacher = async (userId) => {
  let teacher = await Teacher.findOne({ userId });
  if (!teacher) {
    teacher = await Teacher.create({
      userId,
      employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000),
      assignedClasses: [],
    });
  }
  return teacher;
};

// Get teacher's own dashboard stats
const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await getOrCreateTeacher(req.user._id);
    let totalStudents = 0;
    if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      for (const ac of teacher.assignedClasses) {
        const count = await Student.countDocuments({
          class: { $regex: new RegExp(`^${ac.class.trim()}$`, 'i') },
          section: { $regex: new RegExp(`^${ac.section.trim()}$`, 'i') }
        });
        totalStudents += count;
      }
    } else {
      totalStudents = await Student.countDocuments();
    }
    const totalClasses = teacher.assignedClasses?.length || 0;
    res.json({ teacher, totalStudents, totalClasses });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get students (filter by class/section or teacher's assigned classes or all)
const getMyStudents = async (req, res) => {
  try {
    const teacher = await getOrCreateTeacher(req.user._id);
    const filter = {};
    if (req.query.class) {
      filter.class = { $regex: new RegExp(`^${req.query.class.trim()}$`, 'i') };
    }
    if (req.query.section) {
      filter.section = { $regex: new RegExp(`^${req.query.section.trim()}$`, 'i') };
    }

    let students;
    if (req.query.class) {
      students = await Student.find(filter).populate('userId', 'name email phone').sort('rollNumber');
    } else if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      const conditions = teacher.assignedClasses.map(ac => ({
        class: { $regex: new RegExp(`^${ac.class.trim()}$`, 'i') },
        section: { $regex: new RegExp(`^${ac.section.trim()}$`, 'i') }
      }));
      students = await Student.find({ $or: conditions }).populate('userId', 'name email phone').sort('rollNumber');
    } else {
      students = await Student.find().populate('userId', 'name email phone').sort('rollNumber');
    }
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get exams for teacher (assigned classes, or fallback to all active exams)
const getExamsForTeacher = async (req, res) => {
  try {
    const teacher = await getOrCreateTeacher(req.user._id);
    let exams = [];
    if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      const conditions = teacher.assignedClasses.map(ac => ({
        class: { $regex: new RegExp(`^${ac.class.trim()}$`, 'i') },
        section: { $regex: new RegExp(`^${ac.section.trim()}$`, 'i') }
      }));
      exams = await Exam.find({ $or: conditions }).sort('-createdAt');
    }
    if (!exams || exams.length === 0) {
      exams = await Exam.find().sort('-createdAt');
    }
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get subjects for teacher (can query by class/section)
const getTeacherSubjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = { $regex: new RegExp(`^${req.query.class.trim()}$`, 'i') };
    if (req.query.section) filter.section = { $regex: new RegExp(`^${req.query.section.trim()}$`, 'i') };
    const subjects = await Subject.find(filter);
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Enter/update single mark
const enterMarks = async (req, res) => {
  try {
    const { student, exam, subjectName, obtainedMarks, totalMarks } = req.body;
    let mark = await Mark.findOne({ student, exam, subjectName });
    const obt = Number(obtainedMarks);
    const tot = Number(totalMarks) || 100;
    const pct = tot > 0 ? (obt / tot) * 100 : 0;
    let grade = 'F';
    if (pct >= 80) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 45) grade = 'C';
    else if (pct >= 33) grade = 'D';

    if (mark) {
      mark.obtainedMarks = obt;
      mark.totalMarks = tot;
      mark.grade = grade;
      mark.enteredBy = req.user._id;
      await mark.save();
    } else {
      mark = await Mark.create({
        student, exam, subjectName,
        obtainedMarks: obt,
        totalMarks: tot,
        grade,
        enteredBy: req.user._id
      });
    }
    res.json(mark);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Bulk enter/update marks
const saveBulkMarks = async (req, res) => {
  try {
    const { exam, marks } = req.body;
    if (!exam || !Array.isArray(marks)) {
      return res.status(400).json({ message: 'Exam and marks array required' });
    }
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
        mark = await Mark.create({
          student, exam, subjectName,
          obtainedMarks: obt,
          totalMarks: tot,
          grade,
          enteredBy: req.user._id
        });
      }
      results.push(mark);
    }
    res.json({ message: `${results.length} marks saved successfully`, count: results.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get marks for an exam
const getMarks = async (req, res) => {
  try {
    const { exam, student } = req.query;
    if (!exam) return res.status(400).json({ message: 'Exam ID required' });
    const query = { exam };
    if (student) query.student = student;
    const marks = await Mark.find(query).populate('student');
    res.json(marks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update subjects for an exam (useful if exam was created with no subjects)
const updateExamSubjects = async (req, res) => {
  try {
    const { examId } = req.params;
    const { subjects } = req.body;
    const exam = await Exam.findByIdAndUpdate(examId, { subjects }, { new: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
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

// Generate marksheets for teacher
const generateMarksheets = async (req, res) => {
  try {
    const { examId, class: cls, section } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const studentFilter = {};
    if (cls) studentFilter.class = { $regex: new RegExp(`^${cls.trim()}$`, 'i') };
    if (section) studentFilter.section = { $regex: new RegExp(`^${section.trim()}$`, 'i') };

    const students = await Student.find(studentFilter);
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in this class/section' });
    }

    const results = [];
    for (const student of students) {
      const marks = await Mark.find({ student: student._id, exam: examId });
      const totalMarks = marks.reduce((s, m) => s + (m.totalMarks || 100), 0);
      const obtainedMarks = marks.reduce((s, m) => s + (m.obtainedMarks || 0), 0);
      const percentage = totalMarks > 0 ? parseFloat(((obtainedMarks / totalMarks) * 100).toFixed(1)) : 0;

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
          student: student._id, exam: examId,
          class: student.class || cls || exam.class,
          section: student.section || section || exam.section,
          session: exam.session || '2024-2025',
          month: exam.month || '',
          year: exam.year || '2025',
          marks: marks.map(m => ({
            subjectName: m.subjectName,
            obtainedMarks: m.obtainedMarks,
            totalMarks: m.totalMarks || 100,
            grade: m.grade
          })),
          totalMarks, obtainedMarks, percentage, overallGrade, remarks,
          generatedBy: req.user._id,
        },
        { upsert: true, new: true }
      );
      results.push(ms);
    }

    // Rank calculation
    const sorted = [...results].sort((a, b) => b.obtainedMarks - a.obtainedMarks);
    for (let i = 0; i < sorted.length; i++) {
      await Marksheet.findByIdAndUpdate(sorted[i]._id, { rank: i + 1 });
    }

    res.json({ message: `${results.length} marksheets generated successfully`, count: results.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Publish marksheets for teacher
const publishMarksheets = async (req, res) => {
  try {
    const { examId, class: cls, section } = req.body;
    const filter = { exam: examId };
    if (cls) filter.class = { $regex: new RegExp(`^${cls.trim()}$`, 'i') };
    if (section) filter.section = { $regex: new RegExp(`^${section.trim()}$`, 'i') };
    await Marksheet.updateMany(filter, { isPublished: true });
    res.json({ message: 'Marksheets published successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// View marksheets for teacher's classes or exam
const getMyMarksheets = async (req, res) => {
  try {
    const teacher = await getOrCreateTeacher(req.user._id);
    const filter = {};
    if (req.query.exam) filter.exam = req.query.exam;
    if (req.query.class) filter.class = { $regex: new RegExp(`^${req.query.class.trim()}$`, 'i') };
    if (req.query.section) filter.section = { $regex: new RegExp(`^${req.query.section.trim()}$`, 'i') };

    let marksheets;
    if (req.query.exam || req.query.class) {
      marksheets = await Marksheet.find(filter)
        .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profileImage' } })
        .populate('exam')
        .sort('-createdAt');
    } else if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      const conditions = teacher.assignedClasses.map(ac => ({
        class: { $regex: new RegExp(`^${ac.class.trim()}$`, 'i') },
        section: { $regex: new RegExp(`^${ac.section.trim()}$`, 'i') }
      }));
      marksheets = await Marksheet.find({ $or: conditions })
        .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profileImage' } })
        .populate('exam')
        .sort('-createdAt');
    } else {
      marksheets = await Marksheet.find()
        .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profileImage' } })
        .populate('exam')
        .sort('-createdAt');
    }
    res.json(marksheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get single marksheet by ID
const getMarksheetById = async (req, res) => {
  try {
    const ms = await Marksheet.findById(req.params.id)
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email phone profileImage' } })
      .populate('exam');
    if (!ms) return res.status(404).json({ message: 'Marksheet not found' });
    res.json(ms);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getTeacherDashboard,
  getMyStudents,
  getExamsForTeacher,
  getTeacherSubjects,
  enterMarks,
  saveBulkMarks,
  getMarks,
  updateExamSubjects,
  markAttendance,
  getStudentPerformance,
  generateMarksheets,
  publishMarksheets,
  getMyMarksheets,
  getMarksheetById,
};
