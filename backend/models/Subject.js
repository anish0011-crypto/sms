const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  totalMarks: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
