const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  session: { type: String, default: '2024-2025' },
  month: { type: String, default: '' },
  year: { type: String, default: '2025' },
  marks: [{
    subjectName: String,
    obtainedMarks: Number,
    totalMarks: Number,
    grade: String,
  }],
  totalMarks: { type: Number, default: 0 },
  obtainedMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  overallGrade: { type: String, default: '' },
  rank: { type: Number, default: 0 },
  remarks: { type: String, default: 'Good' },
  isPublished: { type: Boolean, default: false },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Marksheet', marksheetSchema);
