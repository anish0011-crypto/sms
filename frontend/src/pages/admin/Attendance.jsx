import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { API.get('/admin/classes').then(r => setClasses(r.data)); }, []);

  const loadStudents = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const [studRes, attRes] = await Promise.all([
        API.get('/admin/students', { params: { class: selectedClass, section: selectedSection } }),
        API.get('/admin/attendance', { params: { class: selectedClass, date } }),
      ]);
      setStudents(studRes.data);
      const attMap = {};
      attRes.data.forEach(a => { attMap[a.student?._id || a.student] = a.status; });
      const initAtt = {};
      studRes.data.forEach(s => { initAtt[s._id] = attMap[s._id] || 'Present'; });
      setAttendance(initAtt);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, [selectedClass, selectedSection, date]);

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({ student: s._id, class: selectedClass, section: selectedSection, date, status: attendance[s._id] || 'Present' }));
      await API.post('/admin/attendance', { records });
      toast.success('Attendance saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const setAll = (status) => {
    const newAtt = {};
    students.forEach(s => { newAtt[s._id] = status; });
    setAttendance(newAtt);
  };

  const present = Object.values(attendance).filter(s => s === 'Present').length;
  const absent = Object.values(attendance).filter(s => s === 'Absent').length;
  const late = Object.values(attendance).filter(s => s === 'Late').length;

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Attendance Management</h2><p>Mark daily attendance</p></div>
        {students.length > 0 && <button className="btn btn-success" onClick={saveAttendance} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Attendance'}</button>}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-grid-3">
          <div className="form-group"><label className="form-label">Class</label>
            <select className="form-select" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); }}>
              <option value="">Select Class</option>
              {[...new Set(classes.map(c => c.name))].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Section</label>
            <select className="form-select" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
              <option value="">Select Section</option>
              {classes.filter(c => c.name === selectedClass).map(c => <option key={c.section}>{c.section}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Loading students...</div>}

      {!loading && students.length > 0 && (
        <>
          <div className="stat-grid" style={{ marginBottom: '16px' }}>
            {[
              { label: 'Present', value: present, icon: '✅', color: '#48bb78', bg: 'rgba(72,187,120,0.12)' },
              { label: 'Absent', value: absent, icon: '❌', color: '#fc8181', bg: 'rgba(252,129,129,0.12)' },
              { label: 'Late', value: late, icon: '⏰', color: '#f6c453', bg: 'rgba(246,196,83,0.12)' },
              { label: 'Total', value: students.length, icon: '👥', color: '#63b3ed', bg: 'rgba(99,179,237,0.12)' },
            ].map((c, i) => (
              <div key={i} className="stat-card" style={{ '--stat-color': c.color, '--stat-bg': c.bg }}>
                <div className="stat-icon">{c.icon}</div>
                <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button className="btn btn-success btn-sm" onClick={() => setAll('Present')}>✅ Mark All Present</button>
            <button className="btn btn-danger btn-sm" onClick={() => setAll('Absent')}>❌ Mark All Absent</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setAll('Late')}>⏰ Mark All Late</button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Student Name</th><th>Roll No</th><th>Status</th></tr></thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s._id}>
                      <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                      <td style={{ fontWeight: '600' }}>{s.userId?.name}</td>
                      <td><span style={{ color: '#f6c453', fontWeight: '700' }}>{s.rollNumber}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Present', 'Absent', 'Late'].map(status => (
                            <button key={status} type="button"
                              onClick={() => setAttendance(prev => ({ ...prev, [s._id]: status }))}
                              style={{ padding: '5px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: attendance[s._id] === status ? (status === 'Present' ? 'rgba(72,187,120,0.3)' : status === 'Absent' ? 'rgba(252,129,129,0.3)' : 'rgba(246,196,83,0.3)') : 'rgba(255,255,255,0.04)',
                                borderColor: attendance[s._id] === status ? (status === 'Present' ? '#48bb78' : status === 'Absent' ? '#fc8181' : '#f6c453') : 'rgba(255,255,255,0.1)',
                                color: attendance[s._id] === status ? (status === 'Present' ? '#68d391' : status === 'Absent' ? '#fc8181' : '#f6c453') : 'var(--text3)',
                              }}>
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && selectedClass && selectedSection && students.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📅</div><h3>No students in this class</h3></div>
      )}
      {!loading && !selectedClass && (
        <div className="empty-state"><div className="empty-icon">📅</div><h3>Select class and section</h3><p>Choose class and section to mark attendance</p></div>
      )}
    </div>
  );
};

export default AttendancePage;
