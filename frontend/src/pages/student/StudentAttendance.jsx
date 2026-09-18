import { useEffect, useState } from 'react';
import API from '../../utils/api';

const StudentAttendance = () => {
  const [data, setData] = useState({ records: [], stats: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/attendance').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header"><div><h2>My Attendance</h2><p>Your attendance history</p></div></div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Present', value: data.stats.present, icon: '✅', color: '#48bb78', bg: 'rgba(72,187,120,0.12)' },
          { label: 'Absent', value: data.stats.absent, icon: '❌', color: '#fc8181', bg: 'rgba(252,129,129,0.12)' },
          { label: 'Late', value: data.stats.late, icon: '⏰', color: '#f6c453', bg: 'rgba(246,196,83,0.12)' },
          { label: 'Percentage', value: `${data.stats.percentage}%`, icon: '📊', color: '#63b3ed', bg: 'rgba(99,179,237,0.12)' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': c.color, '--stat-bg': c.bg }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
            <tbody>
              {data.records.length === 0 ? <tr><td colSpan="3"><div className="empty-state">No attendance recorded</div></td></tr> : data.records.map((r, i) => {
                const d = new Date(r.date);
                const isLate = r.status === 'Late';
                const isAbsent = r.status === 'Absent';
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: '600' }}>{d.toLocaleDateString('en-GB')}</td>
                    <td style={{ color: 'var(--text3)' }}>{d.toLocaleDateString('en-GB', { weekday: 'long' })}</td>
                    <td>
                      <span className={`badge ${isAbsent ? 'badge-red' : isLate ? 'badge-yellow' : 'badge-green'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
