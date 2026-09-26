import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Marks = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [marksData, setMarksData] = useState({});
  const [examInfo, setExamInfo] = useState(null);

  useEffect(() => { API.get('/admin/exams').then(r => setExams(r.data)); }, []);

  const loadExamData = async (examId) => {
    if (!examId) return;
    setLoading(true);
    setSelectedExam(examId);
    const exam = exams.find(e => e._id === examId);
    setExamInfo(exam);
    try {
      const [studRes, markRes] = await Promise.all([
        API.get('/admin/students', { params: { class: exam?.class, section: exam?.section } }),
        API.get('/admin/marks', { params: { exam: examId } }),
      ]);
      setStudents(studRes.data);
      const md = {};
      markRes.data.forEach(m => {
        if (!md[m.student?._id || m.student]) md[m.student?._id || m.student] = {};
        md[m.student?._id || m.student][m.subjectName] = m.obtainedMarks;
      });
      setMarksData(md);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const updateMark = (studentId, subject, val) => {
    setMarksData(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [subject]: val } }));
  };

  const saveMark = async (studentId, subjectName) => {
    const exam = exams.find(e => e._id === selectedExam);
    const sub = exam?.subjects?.find(s => s.name === subjectName);
    const obtained = Number(marksData[studentId]?.[subjectName] || 0);
    if (obtained < 0 || obtained > (sub?.totalMarks || 100)) { toast.error('Invalid marks'); return; }
    try {
      await API.post('/admin/marks', { student: studentId, exam: selectedExam, subjectName, obtainedMarks: obtained, totalMarks: sub?.totalMarks || 100 });
      toast.success('Saved!');
    } catch { toast.error('Failed to save'); }
  };

  const getGrade = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 80) return { g: 'A', cls: 'grade-a' };
    if (pct >= 60) return { g: 'B', cls: 'grade-b' };
    if (pct >= 45) return { g: 'C', cls: 'grade-c' };
    if (pct >= 33) return { g: 'D', cls: 'grade-d' };
    return { g: 'F', cls: 'grade-f' };
  };

  const handleSaveAll = async () => {
    if (!selectedExam || !examInfo?.subjects?.length) return;
    const marksToSave = [];
    students.forEach(s => {
      const sm = marksData[s._id] || {};
      examInfo.subjects.forEach(sub => {
        const val = sm[sub.name];
        if (val !== undefined && val !== '') {
          marksToSave.push({
            student: s._id,
            subjectName: sub.name,
            obtainedMarks: Number(val),
            totalMarks: sub.totalMarks || 100,
          });
        }
      });
    });
    if (marksToSave.length === 0) {
      toast.error('No marks entered to save');
      return;
    }
    try {
      const { data } = await API.post('/admin/marks/bulk', { exam: selectedExam, marks: marksToSave });
      toast.success(data.message || 'Saved all marks!');
    } catch {
      toast.error('Failed to save all marks');
    }
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Marks Management</h2><p>Enter and review student marks</p></div>
        {selectedExam && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handleSaveAll}>💾 Save All Marks</button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">Select Exam</label>
          <select className="form-select" value={selectedExam} onChange={e => loadExamData(e.target.value)} style={{ maxWidth: '400px' }}>
            <option value="">— Choose an exam —</option>
            {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name} (Class {ex.class}-{ex.section})</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Loading students...</div>}

      {!loading && selectedExam && examInfo && (
        <div>
          <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(26,107,60,0.1)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px' }}>📝 <strong>{examInfo.name}</strong></span>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Class {examInfo.class} - {examInfo.section}</span>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>📅 {examInfo.month} {examInfo.year}</span>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>👥 {students.length} students</span>
          </div>

          {students.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🎓</div><h3>No students in this class</h3></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      {examInfo.subjects?.map(s => <th key={s.name}>{s.name}<br /><span style={{ fontSize: '10px', fontWeight: '400', opacity: 0.7 }}>/{s.totalMarks}</span></th>)}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const sid = s._id;
                      const sm = marksData[sid] || {};
                      const total = examInfo.subjects?.reduce((acc, sub) => acc + (Number(sm[sub.name]) || 0), 0) || 0;
                      const maxTotal = examInfo.subjects?.reduce((acc, sub) => acc + sub.totalMarks, 0) || 0;
                      return (
                        <tr key={sid}>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{s.userId?.name}</div>
                          </td>
                          <td><span style={{ color: '#f6c453', fontWeight: '700' }}>{s.rollNumber}</span></td>
                          {examInfo.subjects?.map(sub => {
                            const val = sm[sub.name] !== undefined ? sm[sub.name] : '';
                            const { g, cls } = val !== '' ? getGrade(Number(val), sub.totalMarks) : { g: '—', cls: '' };
                            return (
                              <td key={sub.name}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="number" min="0" max={sub.totalMarks}
                                    style={{ width: '60px', padding: '4px 8px', background: 'var(--bg3)', border: '1px solid var(--card-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                                    value={val}
                                    onChange={e => updateMark(sid, sub.name, e.target.value)}
                                    onBlur={() => val !== '' && saveMark(sid, sub.name)}
                                  />
                                  {val !== '' && <span className={cls} style={{ fontSize: '11px' }}>{g}</span>}
                                </div>
                              </td>
                            );
                          })}
                          <td>
                            <div style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{total}/{maxTotal}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(1) : 0}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedExam && (
        <div className="empty-state"><div className="empty-icon">✏️</div><h3>Select an exam to enter marks</h3><p>Choose from the dropdown above</p></div>
      )}
    </div>
  );
};

export default Marks;
