import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { section: 'People' },
  { to: '/admin/students', label: 'Students', icon: '🎓' },
  { to: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
  { section: 'Academic' },
  { to: '/admin/classes', label: 'Classes & Sections', icon: '🏫' },
  { to: '/admin/subjects', label: 'Subjects', icon: '📚' },
  { to: '/admin/exams', label: 'Exams / Tests', icon: '📝' },
  { section: 'Results' },
  { to: '/admin/marks', label: 'Marks Management', icon: '✏️' },
  { to: '/admin/attendance', label: 'Attendance', icon: '📅' },
  { to: '/admin/marksheets', label: 'Marksheet Mgmt', icon: '📄' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
  { section: 'Settings' },
  { to: '/admin/settings', label: 'School Settings', icon: '⚙️' },
  { to: '/admin/profile', label: 'Profile', icon: '👤' },
];

const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', icon: '🏠', end: true },
  { section: 'My Classes' },
  { to: '/teacher/students', label: 'My Students', icon: '🎓' },
  { to: '/teacher/marks', label: 'Enter Marks', icon: '✏️' },
  { to: '/teacher/attendance', label: 'Attendance', icon: '📅' },
  { section: 'Results' },
  { to: '/teacher/performance', label: 'Student Performance', icon: '📊' },
  { to: '/teacher/marksheets', label: 'Marksheets', icon: '📄' },
  { section: 'Account' },
  { to: '/teacher/profile', label: 'Profile', icon: '👤' },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
  { section: 'My Info' },
  { to: '/student/profile', label: 'My Profile', icon: '👤' },
  { to: '/student/marks', label: 'My Marks', icon: '✏️' },
  { to: '/student/attendance', label: 'My Attendance', icon: '📅' },
  { section: 'Results' },
  { to: '/student/marksheets', label: 'My Marksheet', icon: '📄' },
  { to: '/student/performance', label: 'Performance', icon: '📊' },
];

const roleLinks = { admin: adminLinks, teacher: teacherLinks, student: studentLinks };
const roleColors = { admin: '#9f7aea', teacher: '#48bb78', student: '#63b3ed' };
const roleLabels = { admin: '👑 Admin', teacher: '👨‍🏫 Teacher', student: '🎓 Student' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, close } = useSidebar();
  const links = roleLinks[user?.role] || [];

  // Close sidebar on route change (mobile)
  useEffect(() => { close(); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={close}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Close button for mobile */}
        <button className="sidebar-close-btn" onClick={close} aria-label="Close sidebar">×</button>

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏫</div>
          <div className="sidebar-logo-text">
            <h2>RKD School</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div
            className="sidebar-user-avatar"
            style={{ background: `linear-gradient(135deg, ${roleColors[user?.role]}, #1a6b3c)` }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <h4>{user?.name}</h4>
            <span style={{ color: roleColors[user?.role] }}>
              {roleLabels[user?.role]}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link, i) => {
            if (link.section) return (
              <div key={i} className="sidebar-section-title">{link.section}</div>
            );
            return (
              <NavLink
                key={i}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
