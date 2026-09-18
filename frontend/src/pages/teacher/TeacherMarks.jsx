import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const TeacherMarks = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [marksData, setMarksData] = useState({});
  const [examInfo, setExamInfo] = useState(null);

  useEffect(() => { API.get('/teacher/exams').then(r => setExams(r.data)); }, []);

  const loadExamData = async (examId) => {
    if (!examId) return;
    setLoading(true);
    setSelectedExam(examId);
    const exam = exams.find(e => e._id === examId);
    setExamInfo(exam);
    try {
      const [studRes, markRes] = await Promise.all([
        API.get('/teacher/students'),
        API.get(`/teacher/marks?exam=${examId}`),
      ]);
      const classStudents = studRes.data.filter(s => s.class === exam?.class && s.section === exam?.section);
      setStudents(classStudents);
      
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
      await API.post('/teacher/marks', { student: studentId, exam: selectedExam, subjectName, obtainedMarks: obtained, totalMarks: sub?.totalMarks || 100 });
      toast.success('Saved!');
    } catch { toast.error('Failed to save'); }
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Enter Marks</h2><p>Add marks for your assigned classes</p></div>
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
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  {examInfo.subjects?.map(s => <th key={s.name}>{s.name} <span style={{ fontSize: '10px' }}>/{s.totalMarks}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td><div style={{ fontWeight: '600', fontSize: '13px' }}>{s.userId?.name}</div></td>
                    <td><span style={{ color: '#f6c453', fontWeight: '700' }}>{s.rollNumber}</span></td>
                    {examInfo.subjects?.map(sub => (
                      <td key={sub.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number" min="0" max={sub.totalMarks}
                            style={{ width: '60px', padding: '4px 8px', background: 'var(--bg3)', border: '1px solid var(--card-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                            value={marksData[s._id]?.[sub.name] !== undefined ? marksData[s._id]?.[sub.name] : ''}
                            onChange={e => updateMark(s._id, sub.name, e.target.value)}
                            onBlur={() => marksData[s._id]?.[sub.name] !== undefined && saveMark(s._id, sub.name)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={2 + (examInfo.subjects?.length || 0)}><div className="empty-state">No students found</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMarks;
