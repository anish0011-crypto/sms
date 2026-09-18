import { useEffect, useState } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/profile').then(r => { setProfile(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Welcome, {user?.name?.split(' ')[0]}! 🎓</h2><p>Your academic dashboard</p></div>
        <Link to="/student/marksheets" className="btn btn-primary">📄 View Latest Result</Link>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(26,107,60,0.1), rgba(43,108,176,0.1))', border: '1px solid rgba(26,107,60,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #63b3ed, #48bb78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', border: '3px solid #63b3ed' }}>
            {user?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{user?.name}</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Class {profile?.class} - {profile?.section}</span>
              <span className="badge badge-yellow">Roll No: {profile?.rollNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>ℹ️ Personal Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[['Father Name', profile?.fatherName], ['Gender', profile?.gender], ['Date of Birth', profile?.dob?.split('T')[0]], ['Address', profile?.address], ['Email', user?.email], ['Phone', user?.phone]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--card-border)', fontSize: '13px' }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={{ fontWeight: '600' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>⚡ Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/student/marks', label: 'My Marks', icon: '✏️', color: '#f6c453' },
              { to: '/student/attendance', label: 'My Attendance', icon: '📅', color: '#63b3ed' },
              { to: '/student/performance', label: 'My Performance', icon: '📈', color: '#b794f4' },
              { to: '/student/marksheets', label: 'Download Marksheet', icon: '🖨️', color: '#48bb78' },
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

export default StudentDashboard;
