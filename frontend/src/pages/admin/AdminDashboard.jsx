import { useEffect, useState } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: '🎓', color: '#48bb78', bg: 'rgba(72,187,120,0.12)' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: '👨‍🏫', color: '#63b3ed', bg: 'rgba(99,179,237,0.12)' },
    { label: 'Total Classes', value: stats?.totalClasses || 0, icon: '🏫', color: '#f6c453', bg: 'rgba(246,196,83,0.12)' },
    { label: 'Total Exams', value: stats?.totalExams || 0, icon: '📝', color: '#fc8181', bg: 'rgba(252,129,129,0.12)' },
    { label: 'Published Marksheets', value: stats?.publishedMarksheets || 0, icon: '📄', color: '#b794f4', bg: 'rgba(183,148,244,0.12)' },
  ];

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👑</h2>
          <p>Here's your school at a glance</p>
        </div>
        <Link to="/admin/students" className="btn btn-primary">+ Add New Student</Link>
      </div>

      <div className="stat-grid">
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': c.color, '--stat-bg': c.bg }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info">
              <h3>{c.value}</h3>
              <p>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📋 Recently Added Students</h3>
          {stats?.recentStudents?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.recentStudents.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a6b3c, #48bb78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                    {s.userId?.name?.charAt(0) || 'S'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.userId?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Class {s.class} - {s.section} | Roll: {s.rollNumber}</div>
                  </div>
                  <span className="badge badge-green">Active</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text3)', fontSize: '13px' }}>No students yet. Add students to see them here.</p>}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { to: '/admin/students', label: 'Add Student', icon: '🎓', color: '#48bb78' },
              { to: '/admin/teachers', label: 'Add Teacher', icon: '👨‍🏫', color: '#63b3ed' },
              { to: '/admin/exams', label: 'Create Exam', icon: '📝', color: '#f6c453' },
              { to: '/admin/marks', label: 'Enter Marks', icon: '✏️', color: '#fc8181' },
              { to: '/admin/marksheets', label: 'Generate Marksheet', icon: '📄', color: '#b794f4' },
              { to: '/admin/reports', label: 'View Reports', icon: '📈', color: '#76e4f7' },
            ].map((a, i) => (
              <Link key={i} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: a.color, transition: 'all 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = a.color + '44'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <span style={{ fontSize: '20px' }}>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
