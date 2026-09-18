const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyProfile, updateStudentProfile, getMyMarks, getMyAttendance, getMyMarksheets, getMarksheetById, getMyPerformance } = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/profile', getMyProfile);
router.put('/profile', updateStudentProfile);
router.get('/marks', getMyMarks);
router.get('/attendance', getMyAttendance);
router.get('/marksheets', getMyMarksheets);
router.get('/marksheets/:id', getMarksheetById);
router.get('/performance', getMyPerformance);

module.exports = router;
