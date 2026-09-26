const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'RKD SCHOOL' },
  tagline: { type: String, default: 'Excellence in Education' },
  establishedYear: { type: String, default: '2000' },
  address: { type: String, default: 'Lahore, Pakistan' },
  phone: { type: String, default: '03001234567' },
  email: { type: String, default: 'info@rkdschool.edu.pk' },
  website: { type: String, default: 'www.rkdschool.edu.pk' },
  currentSession: { type: String, default: '2024-2025' },
  principalTitle: { type: String, default: 'Principal' },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
