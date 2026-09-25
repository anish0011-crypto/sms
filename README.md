
# 🏫 RKD School - School Management System (SMS)

A modern, full-stack School Management System built with **React (Vite)**, **Node.js (Express)**, and **MongoDB**.

---

## 🔑 Default Login Credentials

### 👑 Admin Account
- **User ID / Email**: `admin@rkdschool.com`
- **Password**: `admin123`
- **Role**: `admin`
- *(⚡ The Login page also features a 1-click **"Auto Fill"** button for instant access)*

---

## 🚀 Features

- **Admin Portal**:
  - Full analytics dashboard (students, teachers, classes, fee collection)
  - Student registration and management
  - Teacher management and class assignments
  - Class and subject management
  - Exam scheduling and marksheet generation
  - Fee management and payment tracking
  - School announcements & notifications

- **Teacher Portal**:
  - View assigned classes and subjects
  - Mark daily student attendance
  - Enter and review examination marks
  - Access student performance reports

- **Student Portal**:
  - View personalized attendance records
  - Check exam results and download marksheets
  - Check fee status and receipts
  - View school announcements

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Chart.js, Vanilla CSS Design System
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs
- **Database**: MongoDB Atlas with Mongoose ODM

---

## 💻 Local Setup & Running

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📦 Deployment

Refer to [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for full instructions on deploying:
- **Backend**: Render Web Service
- **Frontend**: Vercel
