import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const TeacherAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/teacher/dashboard').then(r => {
      const ac = r.data.teacher?.assignedClasses || [];
      const classStrs = ac.map(c => `${c.class}-${c.section}`);
      setClasses(classStrs);
    });
  }, []);

  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    const [cls, sec] = selectedClass.split('-');
    try {
      const { data } = await API.get('/teacher/students');
      const classStudents = data.filter(s => s.class === cls && s.section === sec);
      setStudents(classStudents);
      const initAtt = {};
      classStudents.forEach(s => { initAtt[s._id] = 'Present'; });
      setAttendance(initAtt);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, [selectedClass, date]);

  const saveAttendance = async () => {
    setSaving(true);
    const [cls, sec] = selectedClass.split('-');
    try {
      const records = students.map(s => ({ student: s._id, class: cls, section: sec, date, status: attendance[s._id] || 'Present' }));
      await API.post('/teacher/attendance', { records });
      toast.success('Attendance saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const setAll = (status) => {
    const newAtt = {};
    students.forEach(s => { newAtt[s._id] = status; });
    setAttendance(newAtt);
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Mark Attendance</h2><p>Daily attendance for your classes</p></div>
        {students.length > 0 && <button className="btn btn-success" onClick={saveAttendance} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Attendance'}</button>}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Select Class</label>
            <select className="form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Loading students...</div>}

      {!loading && students.length > 0 && (
        <>
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

      {!loading && !selectedClass && (
        <div className="empty-state"><div className="empty-icon">📅</div><h3>Select a class</h3><p>Choose one of your assigned classes to mark attendance</p></div>
      )}
    </div>
  );
};

export default TeacherAttendance;
