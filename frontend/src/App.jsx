import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';

// Shared
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Profile from './pages/shared/Profile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Classes from './pages/admin/Classes';
import Exams from './pages/admin/Exams';
import Marks from './pages/admin/Marks';
import Attendance from './pages/admin/Attendance';
import Marksheets from './pages/admin/Marksheets';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Subjects from './pages/admin/Subjects';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherPerformance from './pages/teacher/TeacherPerformance';
import TeacherMarksheets from './pages/teacher/TeacherMarksheets';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMarks from './pages/student/StudentMarks';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentPerformance from './pages/student/StudentPerformance';
import StudentMarksheets from './pages/student/StudentMarksheets';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="admin"><Layout><Students /></Layout></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><Layout><Teachers /></Layout></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute role="admin"><Layout><Classes /></Layout></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute role="admin"><Layout><Subjects /></Layout></ProtectedRoute>} />
      <Route path="/admin/exams" element={<ProtectedRoute role="admin"><Layout><Exams /></Layout></ProtectedRoute>} />
      <Route path="/admin/marks" element={<ProtectedRoute role="admin"><Layout><Marks /></Layout></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><Layout><Attendance /></Layout></ProtectedRoute>} />
      <Route path="/admin/marksheets" element={<ProtectedRoute role="admin"><Layout><Marksheets /></Layout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="admin"><Layout><Profile role="admin" /></Layout></ProtectedRoute>} />

      {/* TEACHER ROUTES */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><Layout><TeacherDashboard /></Layout></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><Layout><TeacherStudents /></Layout></ProtectedRoute>} />
      <Route path="/teacher/marks" element={<ProtectedRoute role="teacher"><Layout><TeacherMarks /></Layout></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><Layout><TeacherAttendance /></Layout></ProtectedRoute>} />
      <Route path="/teacher/performance" element={<ProtectedRoute role="teacher"><Layout><TeacherPerformance /></Layout></ProtectedRoute>} />
      <Route path="/teacher/marksheets" element={<ProtectedRoute role="teacher"><Layout><TeacherMarksheets /></Layout></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><Layout><Profile role="teacher" /></Layout></ProtectedRoute>} />

      {/* STUDENT ROUTES */}
      <Route path="/student" element={<ProtectedRoute role="student"><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
      <Route path="/student/marks" element={<ProtectedRoute role="student"><Layout><StudentMarks /></Layout></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute role="student"><Layout><StudentAttendance /></Layout></ProtectedRoute>} />
      <Route path="/student/performance" element={<ProtectedRoute role="student"><Layout><StudentPerformance /></Layout></ProtectedRoute>} />
      <Route path="/student/marksheets" element={<ProtectedRoute role="student"><Layout><StudentMarksheets /></Layout></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><Layout><Profile role="student" /></Layout></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <SidebarProvider>
          <Toaster position="top-right" toastOptions={{ style: { background: '#162130', color: '#e8f0fe', border: '1px solid rgba(26,107,60,0.3)' } }} />
          <AppRoutes />
        </SidebarProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
