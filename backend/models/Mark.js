const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  subjectName: { type: String, required: true },
  obtainedMarks: { type: Number, required: true, min: 0 },
  totalMarks: { type: Number, required: true },
  grade: { type: String, default: '' },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-calculate grade before saving
markSchema.pre('save', function () {
  const pct = this.totalMarks > 0 ? (this.obtainedMarks / this.totalMarks) * 100 : 0;
  if (pct >= 80) this.grade = 'A';
  else if (pct >= 60) this.grade = 'B';
  else if (pct >= 45) this.grade = 'C';
  else if (pct >= 33) this.grade = 'D';
  else this.grade = 'F';
});

module.exports = mongoose.model('Mark', markSchema);
