const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true, unique: true },
  class: { type: String, default: '' },
  section: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  dob: { type: Date },
  address: { type: String, default: '' },
  admissionDate: { type: Date, default: Date.now },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
