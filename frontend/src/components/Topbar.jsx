import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const pageTitles = {
  '/admin': { title: 'Admin Dashboard', sub: 'Welcome back, manage your school' },
  '/admin/students': { title: 'Students Management', sub: 'View, add & manage students' },
  '/admin/teachers': { title: 'Teachers Management', sub: 'View, add & manage teachers' },
  '/admin/classes': { title: 'Classes & Sections', sub: 'Manage class structure' },
  '/admin/subjects': { title: 'Subjects', sub: 'Manage subjects per class' },
  '/admin/exams': { title: 'Exams / Tests', sub: 'Schedule and manage exams' },
  '/admin/marks': { title: 'Marks Management', sub: 'Enter and review marks' },
  '/admin/attendance': { title: 'Attendance Management', sub: 'Track student attendance' },
  '/admin/marksheets': { title: 'Marksheet Management', sub: 'Generate and publish marksheets' },
  '/admin/reports': { title: 'Reports', sub: 'School performance reports' },
  '/admin/settings': { title: 'School Settings', sub: 'Configure school information' },
  '/admin/profile': { title: 'My Profile', sub: 'Manage your account' },
  '/teacher': { title: 'Teacher Dashboard', sub: 'Your classes and assignments' },
  '/teacher/students': { title: 'My Students', sub: 'Students in your classes' },
  '/teacher/marks': { title: 'Enter Marks', sub: 'Add/update student marks' },
  '/teacher/attendance': { title: 'Mark Attendance', sub: 'Daily attendance entry' },
  '/teacher/performance': { title: 'Student Performance', sub: 'Track student progress' },
  '/teacher/marksheets': { title: 'Marksheets', sub: 'View class marksheets' },
  '/teacher/profile': { title: 'My Profile', sub: 'Manage your account' },
  '/student': { title: 'Student Dashboard', sub: 'Your academic overview' },
  '/student/profile': { title: 'My Profile', sub: 'Your personal information' },
  '/student/marks': { title: 'My Marks', sub: 'Subject-wise marks' },
  '/student/attendance': { title: 'My Attendance', sub: 'Your attendance record' },
  '/student/marksheets': { title: 'My Marksheet', sub: 'Official result marksheets' },
  '/student/performance': { title: 'My Performance', sub: 'Academic performance overview' },
};

const roleColors = { admin: '#9f7aea', teacher: '#48bb78', student: '#63b3ed' };
const roleLabels = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };

const Topbar = () => {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const location = useLocation();
  const info = pageTitles[location.pathname] || { title: 'Dashboard', sub: '' };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="topbar">
      {/* Hamburger button — visible only on mobile */}
      <button className="topbar-hamburger" onClick={toggle} aria-label="Toggle sidebar">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="topbar-title">
        <h1>{info.title}</h1>
        <p className="topbar-sub">{info.sub}</p>
      </div>

      <div className="topbar-right">
        <span className="topbar-date">📅 {dateStr}</span>
        <div
          className="topbar-user-badge"
          style={{ background: `${roleColors[user?.role]}22`, borderColor: `${roleColors[user?.role]}44`, color: roleColors[user?.role] }}
        >
          <div
            className="topbar-avatar"
            style={{ background: `linear-gradient(135deg, ${roleColors[user?.role]}, #1a6b3c)` }}
          >
            {user?.name?.charAt(0)}
          </div>
          <span className="topbar-user-name">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
