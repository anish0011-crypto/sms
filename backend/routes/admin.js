const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats, getStudents, createStudent, updateStudent, deleteStudent,
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getClasses, createClass, updateClass, deleteClass,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getExams, createExam, updateExam, deleteExam,
  getMarks, saveMark, saveBulkMarks, getAttendance, saveAttendance,
  getMarksheets, generateMarksheets, publishMarksheets, getMarksheetById,
  getReports,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);
router.get('/exams', getExams);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);
router.get('/marks', getMarks);
router.post('/marks', saveMark);
router.post('/marks/bulk', saveBulkMarks);
router.get('/attendance', getAttendance);
router.post('/attendance', saveAttendance);
router.get('/marksheets', getMarksheets);
router.get('/marksheets/:id', getMarksheetById);
router.post('/marksheets/generate', generateMarksheets);
router.post('/marksheets/publish', publishMarksheets);
router.get('/reports', getReports);

module.exports = router;
