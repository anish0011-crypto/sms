const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getTeacherDashboard, getMyStudents, enterMarks, getMarks, markAttendance, getStudentPerformance, getMyMarksheets, getExamsForTeacher } = require('../controllers/teacherController');

router.use(protect, authorize('teacher'));

router.get('/dashboard', getTeacherDashboard);
router.get('/students', getMyStudents);
router.get('/exams', getExamsForTeacher);
router.get('/marks', getMarks);
router.post('/marks', enterMarks);
router.post('/attendance', markAttendance);
router.get('/performance/:studentId', getStudentPerformance);
router.get('/marksheets', getMyMarksheets);

module.exports = router;
