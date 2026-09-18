const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  qualification: { type: String, default: '' },
  assignedClasses: [{
    class: String,
    section: String,
    subjects: [String],
  }],
  joinDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
