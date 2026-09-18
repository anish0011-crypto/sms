const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  subjects: [{ type: String }],
  session: { type: String, default: '2024-2025' },
}, { timestamps: true });

classSchema.index({ name: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
