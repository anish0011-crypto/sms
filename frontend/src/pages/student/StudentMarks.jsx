import { useEffect, useState } from 'react';
import API from '../../utils/api';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/marks').then(r => { setMarks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Group marks by exam
  const grouped = marks.reduce((acc, m) => {
    const eid = m.exam?._id;
    if (!acc[eid]) acc[eid] = { exam: m.exam, marks: [] };
    acc[eid].marks.push(m);
    return acc;
  }, {});

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header"><div><h2>My Marks</h2><p>Your subject-wise scores</p></div></div>

      {loading ? <div className="loading"><div className="spinner" /></div> : Object.keys(grouped).length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✏️</div><h3>No marks recorded yet</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.values(grouped).map((g, i) => {
            const total = g.marks.reduce((s, m) => s + m.obtainedMarks, 0);
            const max = g.marks.reduce((s, m) => s + m.totalMarks, 0);
            const pct = max > 0 ? ((total / max) * 100).toFixed(1) : 0;
            return (
              <div key={i} className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{g.exam?.name}</h3>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{g.exam?.type} | {g.exam?.month} {g.exam?.year}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: 'var(--primary-light)', fontSize: '18px' }}>{total} / {max}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{pct}%</div>
                  </div>
                </div>
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead><tr><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
                    <tbody>
                      {g.marks.map((m, j) => (
                        <tr key={j}>
                          <td style={{ fontWeight: '600' }}>{m.subjectName}</td>
                          <td>{m.obtainedMarks} / {m.totalMarks}</td>
                          <td><span className={`grade-${m.grade?.toLowerCase()}`} style={{ fontWeight: '700' }}>{m.grade}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentMarks;
