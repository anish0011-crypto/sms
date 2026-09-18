import { useEffect, useState } from 'react';
import API from '../../utils/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/reports').then(r => { setReports(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading reports...</div>;

  const totalStudents = reports.reduce((s, r) => s + r.totalStudents, 0);
  const totalPassed = reports.reduce((s, r) => s + r.passCount, 0);
  const totalFailed = reports.reduce((s, r) => s + r.failCount, 0);

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Reports</h2><p>School performance overview</p></div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Classes', value: reports.length, icon: '🏫', color: '#63b3ed', bg: 'rgba(99,179,237,0.12)' },
          { label: 'Total Students', value: totalStudents, icon: '🎓', color: '#48bb78', bg: 'rgba(72,187,120,0.12)' },
          { label: 'Students Passed', value: totalPassed, icon: '✅', color: '#48bb78', bg: 'rgba(72,187,120,0.12)' },
          { label: 'Students Failed', value: totalFailed, icon: '❌', color: '#fc8181', bg: 'rgba(252,129,129,0.12)' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': c.color, '--stat-bg': c.bg }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', fontWeight: '700', fontSize: '15px' }}>📊 Class-wise Performance Report</div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Class</th><th>Section</th><th>Total Students</th><th>Passed</th><th>Failed</th><th>Pass %</th><th>Status</th></tr></thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan="8"><div className="empty-state"><div className="empty-icon">📈</div><h3>No report data yet</h3><p>Generate and publish marksheets to see reports</p></div></td></tr>
              ) : reports.map((r, i) => {
                const passPct = r.passCount + r.failCount > 0 ? ((r.passCount / (r.passCount + r.failCount)) * 100).toFixed(0) : 0;
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td style={{ fontWeight: '700' }}>Class {r.class}</td>
                    <td><span className="badge badge-blue">Section {r.section}</span></td>
                    <td style={{ fontWeight: '700', color: 'var(--text)' }}>{r.totalStudents}</td>
                    <td style={{ fontWeight: '700', color: '#68d391' }}>{r.passCount}</td>
                    <td style={{ fontWeight: '700', color: '#fc8181' }}>{r.failCount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', maxWidth: '80px' }}>
                          <div style={{ width: `${passPct}%`, height: '100%', background: `linear-gradient(90deg, ${passPct >= 60 ? '#48bb78' : passPct >= 33 ? '#f6c453' : '#fc8181'}, ${passPct >= 60 ? '#68d391' : '#fc8181'})`, borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontWeight: '700', color: passPct >= 60 ? '#68d391' : passPct >= 33 ? '#f6c453' : '#fc8181' }}>{passPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${passPct >= 60 ? 'badge-green' : passPct >= 33 ? 'badge-yellow' : 'badge-red'}`}>
                        {passPct >= 60 ? 'Excellent' : passPct >= 33 ? 'Average' : 'Needs Attention'}
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

export default Reports;
