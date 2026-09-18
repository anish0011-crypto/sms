const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  type: { type: String, enum: ['Unit Test', 'Mid Term', 'Final Term', 'Monthly'], default: 'Monthly' },
  session: { type: String, default: '2024-2025' },
  month: { type: String, default: '' },
  year: { type: String, default: '2025' },
  subjects: [{ name: String, totalMarks: Number }],
  date: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
