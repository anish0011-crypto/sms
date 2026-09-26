const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/teacherController');

router.use(protect, authorize('teacher'));

// Dashboard & Profile
router.get('/dashboard', getTeacherDashboard);

// Students & Exams & Subjects
router.get('/students', getMyStudents);
router.get('/exams', getExamsForTeacher);
router.put('/exams/:examId/subjects', updateExamSubjects);
router.get('/subjects', getTeacherSubjects);

// Marks
router.get('/marks', getMarks);
router.post('/marks', enterMarks);
router.post('/marks/bulk', saveBulkMarks);

// Marksheets (Generate, Publish, View, Print)
router.get('/marksheets', getMyMarksheets);
router.get('/marksheets/:id', getMarksheetById);
router.post('/marksheets/generate', generateMarksheets);
router.post('/marksheets/publish', publishMarksheets);

// Attendance & Performance
router.post('/attendance', markAttendance);
router.get('/performance/:studentId', getStudentPerformance);

module.exports = router;
