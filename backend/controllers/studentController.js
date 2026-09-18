const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Marksheet = require('../models/Marksheet');

// Get student's own profile
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    // If no profile yet, return empty object (don't 404)
    res.json(student || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update student's own profile (Class, Section, etc)
const updateStudentProfile = async (req, res) => {
  try {
    // Use upsert so we create the profile if somehow it doesn't exist
    const updateFields = {};
    if (req.body.class !== undefined) updateFields.class = req.body.class;
    if (req.body.section !== undefined) updateFields.section = req.body.section;
    if (req.body.fatherName !== undefined) updateFields.fatherName = req.body.fatherName;
    if (req.body.dob !== undefined) updateFields.dob = req.body.dob;
    if (req.body.gender !== undefined) updateFields.gender = req.body.gender;
    if (req.body.address !== undefined) updateFields.address = req.body.address;
    if (req.body.rollNumber !== undefined) updateFields.rollNumber = req.body.rollNumber;

    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If upserted with no rollNumber, generate one
    if (!student.rollNumber) {
      student.rollNumber = `STU${Date.now().toString().slice(-6)}`;
      await student.save();
    }

    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get student's own marks
const getMyMarks = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const marks = await Mark.find({ student: student._id }).populate('exam');
    res.json(marks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get student's own attendance
const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const attendance = await Attendance.find({ student: student._id }).sort('-date');
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const late = attendance.filter(a => a.status === 'Late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    res.json({ records: attendance, stats: { total, present, absent, late, percentage } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get student's own marksheets (only published)
const getMyMarksheets = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const marksheets = await Marksheet.find({ student: student._id, isPublished: true })
      .populate('exam')
      .sort('-createdAt');
    res.json(marksheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get a specific marksheet (student can only see own)
const getMarksheetById = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const ms = await Marksheet.findOne({ _id: req.params.id, student: student._id, isPublished: true })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .populate('exam');
    if (!ms) return res.status(404).json({ message: 'Marksheet not found or not published' });
    res.json(ms);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get performance overview
const getMyPerformance = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const marksheets = await Marksheet.find({ student: student._id, isPublished: true }).populate('exam');
    const attendance = await Attendance.find({ student: student._id });
    const present = attendance.filter(a => a.status === 'Present').length;
    const attendancePct = attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0;
    res.json({ marksheets, attendance: { total: attendance.length, present, percentage: attendancePct } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getMyProfile, updateStudentProfile, getMyMarks, getMyAttendance, getMyMarksheets, getMarksheetById, getMyPerformance };
