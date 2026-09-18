import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const TeacherPerformance = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/teacher/students').then(r => setStudents(r.data));
  }, []);

  const loadPerformance = async (studentId) => {
    if (!studentId) { setPerformance(null); return; }
    setSelectedStudent(studentId);
    setLoading(true);
    try {
      const { data } = await API.get(`/teacher/performance/${studentId}`);
      setPerformance(data);
    } catch { toast.error('Failed to load performance'); }
    setLoading(false);
  };

  const chartData = performance?.marks?.map(m => ({
    subject: m.subjectName,
    marks: m.obtainedMarks,
    fullMarks: m.totalMarks,
    fill: m.obtainedMarks / m.totalMarks >= 0.8 ? '#48bb78' : m.obtainedMarks / m.totalMarks >= 0.6 ? '#63b3ed' : m.obtainedMarks / m.totalMarks >= 0.45 ? '#f6c453' : '#fc8181'
  })) || [];

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Student Performance</h2><p>Track academic progress</p></div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label className="form-label">Select Student</label>
          <select className="form-select" value={selectedStudent} onChange={e => loadPerformance(e.target.value)}>
            <option value="">— Choose a student —</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.userId?.name} (Class {s.class}-{s.section} | {s.rollNumber})</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Loading performance data...</div>}

      {!loading && performance && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '15px' }}>📈 Marks Overview (Latest Exam)</h3>
            {chartData.length > 0 ? (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="subject" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <YAxis tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                    <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p style={{ color: 'var(--text3)', fontSize: '13px' }}>No marks data available for this student.</p>}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>📅 Attendance Record</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={performance.attendance.percentage >= 75 ? '#48bb78' : performance.attendance.percentage >= 50 ? '#f6c453' : '#fc8181'} strokeWidth="3" strokeDasharray={`${performance.attendance.percentage}, 100`} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                    {performance.attendance.percentage}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>Total Days: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{performance.attendance.total}</span></div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Present: <span style={{ color: '#68d391', fontWeight: '600' }}>{performance.attendance.present}</span></div>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--card-border)' }} />

            <div>
              <h3 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>📋 Recent Marks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {performance.marks?.slice(0, 5).map(m => (
                  <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '13px' }}>
                    <span>{m.subjectName}</span>
                    <span style={{ fontWeight: '700', color: m.obtainedMarks / m.totalMarks >= 0.8 ? '#68d391' : m.obtainedMarks / m.totalMarks >= 0.45 ? '#f6c453' : '#fc8181' }}>{m.obtainedMarks} / {m.totalMarks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !selectedStudent && (
        <div className="empty-state"><div className="empty-icon">📈</div><h3>Select a student</h3><p>Choose a student to view their performance analytics</p></div>
      )}
    </div>
  );
};

export default TeacherPerformance;
