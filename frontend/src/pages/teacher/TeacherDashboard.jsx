import { useEffect, useState } from 'react';
import API from '../../utils/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/teacher/dashboard').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h2><p>Your teaching overview for today</p></div>
        <Link to="/teacher/marks" className="btn btn-primary">✏️ Enter Marks</Link>
      </div>

      <div className="stat-grid">
        {[
          { label: 'My Classes', value: stats?.teacher?.assignedClasses?.length || 0, icon: '🏫', color: '#63b3ed', bg: 'rgba(99,179,237,0.12)' },
          { label: 'My Students', value: stats?.totalStudents || 0, icon: '🎓', color: '#48bb78', bg: 'rgba(72,187,120,0.12)' },
          { label: 'Subjects Taught', value: stats?.teacher?.assignedClasses?.reduce((s, ac) => s + ac.subjects.length, 0) || 0, icon: '📚', color: '#f6c453', bg: 'rgba(246,196,83,0.12)' },
          { label: 'Employee ID', value: stats?.teacher?.employeeId || '—', icon: '🪪', color: '#b794f4', bg: 'rgba(183,148,244,0.12)' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': c.color, '--stat-bg': c.bg }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info"><h3 style={{ fontSize: typeof c.value === 'string' ? '16px' : '26px' }}>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>🏫 My Assigned Classes</h3>
          {stats?.teacher?.assignedClasses?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.teacher.assignedClasses.map((ac, i) => (
                <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary-light)' }}>Class {ac.class} - {ac.section}</span>
                    <span className="badge badge-green">{ac.subjects?.length} subjects</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {ac.subjects?.map(s => <span key={s} className="badge badge-blue" style={{ fontSize: '10px' }}>{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text3)', fontSize: '13px' }}>No classes assigned yet.</p>}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/teacher/students', label: 'View My Students', icon: '🎓', color: '#48bb78' },
              { to: '/teacher/marks', label: 'Enter/Update Marks', icon: '✏️', color: '#f6c453' },
              { to: '/teacher/attendance', label: 'Mark Attendance', icon: '📅', color: '#63b3ed' },
              { to: '/teacher/performance', label: 'Student Performance', icon: '📈', color: '#b794f4' },
              { to: '/teacher/marksheets', label: 'View Marksheets', icon: '📄', color: '#76e4f7' },
            ].map((a, i) => (
              <Link key={i} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: a.color, textDecoration: 'none', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '18px' }}>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
