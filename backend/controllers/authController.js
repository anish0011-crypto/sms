const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account is disabled' });

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Register a new student
// @route POST /api/auth/register-student
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create User record
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'student'
    });

    // Create empty Student profile
    const profile = await Student.create({
      userId: user._id,
      rollNumber: `STU${Date.now().toString().slice(-6)}`,
      class: '',
      section: ''
    });

    res.status(201).json({
      message: 'Student registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'student') profile = await Student.findOne({ userId: user._id });
    else if (user.role === 'teacher') profile = await Teacher.findOne({ userId: user._id });
    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update user profile (password)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.currentPassword && req.body.newPassword) {
      if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      user.password = req.body.newPassword;
    }
    
    if (req.body.phone) user.phone = req.body.phone;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, registerStudent, getMe, updateProfile };
