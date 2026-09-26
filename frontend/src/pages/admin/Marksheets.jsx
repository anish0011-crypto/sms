import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import MarksheetTemplate from '../../components/MarksheetTemplate';

const Marksheets = () => {
  const [exams, setExams] = useState([]);
  const [marksheets, setMarksheets] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [viewData, setViewData] = useState(null);

  useEffect(() => { API.get('/admin/exams').then(r => setExams(r.data)); }, []);

  const loadMarksheets = async (examId) => {
    if (!examId) return;
    setSelectedExam(examId);
    setLoading(true);
    try { const { data } = await API.get('/admin/marksheets', { params: { exam: examId } }); setMarksheets(data); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const handleGenerate = async () => {
    const exam = exams.find(e => e._id === selectedExam);
    if (!exam) return;
    setGenerating(true);
    try {
      const { data } = await API.post('/admin/marksheets/generate', { examId: selectedExam, class: exam.class, section: exam.section });
      toast.success(data.message);
      loadMarksheets(selectedExam);
    } catch (err) { toast.error(err.response?.data?.message || 'Generation failed'); }
    setGenerating(false);
  };

  const handlePublish = async () => {
    const exam = exams.find(e => e._id === selectedExam);
    if (!exam || !confirm('Publish all marksheets? Students will be able to view them.')) return;
    try {
      await API.post('/admin/marksheets/publish', { examId: selectedExam, class: exam.class, section: exam.section });
      toast.success('Marksheets published!');
      loadMarksheets(selectedExam);
    } catch { toast.error('Failed to publish'); }
  };

  const openMarksheet = async (id) => {
    try {
      const { data } = await API.get(`/admin/marksheets/${id}`);
      setViewData({
        studentName: data.student?.userId?.name || '—',
        fatherName: data.student?.fatherName || '—',
        motherName: data.student?.motherName || '—',
        rollNumber: data.student?.rollNumber || '—',
        dob: data.student?.dob || null,
        gender: data.student?.gender || '',
        address: data.student?.address || '',
        phone: data.student?.userId?.phone || '',
        class: data.class, section: data.section,
        session: data.session, month: data.month, year: data.year,
        marks: data.marks, totalMarks: data.totalMarks, obtainedMarks: data.obtainedMarks,
        percentage: data.percentage, overallGrade: data.overallGrade,
        rank: data.rank, remarks: data.remarks,
      });
    } catch { toast.error('Failed to load marksheet'); }
  };

  const allPublished = marksheets.length > 0 && marksheets.every(m => m.isPublished);
  const exam = exams.find(e => e._id === selectedExam);

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Marksheet Management</h2><p>Generate, review and publish marksheets</p></div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
            <label className="form-label">Select Exam</label>
            <select className="form-select" value={selectedExam} onChange={e => loadMarksheets(e.target.value)}>
              <option value="">— Select Exam —</option>
              {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name} (Class {ex.class}-{ex.section})</option>)}
            </select>
          </div>
          {selectedExam && (
            <>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                {generating ? '⏳ Generating...' : '⚡ Generate Marksheets'}
              </button>
              {marksheets.length > 0 && !allPublished && (
                <button className="btn btn-success" onClick={handlePublish}>🚀 Publish All</button>
              )}
              {allPublished && <span className="badge badge-green" style={{ padding: '8px 16px', fontSize: '13px' }}>✅ All Published</span>}
            </>
          )}
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Loading marksheets...</div>}

      {!loading && selectedExam && marksheets.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Rank</th><th>Student</th><th>Roll No</th><th>Total Marks</th><th>Obtained</th><th>Percentage</th><th>Grade</th><th>Remarks</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {[...marksheets].sort((a, b) => a.rank - b.rank).map(ms => (
                  <tr key={ms._id}>
                    <td><span style={{ fontWeight: '800', color: ms.rank <= 3 ? '#f6c453' : 'var(--text)', fontSize: '16px' }}>#{ms.rank}</span></td>
                    <td style={{ fontWeight: '600' }}>{ms.student?.userId?.name}</td>
                    <td><span style={{ color: '#f6c453', fontWeight: '700' }}>{ms.student?.rollNumber}</span></td>
                    <td>{ms.totalMarks}</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{ms.obtainedMarks}</td>
                    <td><span style={{ color: ms.percentage >= 60 ? '#68d391' : ms.percentage >= 33 ? '#f6c453' : '#fc8181', fontWeight: '700' }}>{ms.percentage}%</span></td>
                    <td><span className={`grade-${ms.overallGrade?.toLowerCase()}`} style={{ fontWeight: '800', fontSize: '16px' }}>{ms.overallGrade}</span></td>
                    <td style={{ color: 'var(--text2)', fontStyle: 'italic' }}>{ms.remarks}</td>
                    <td><span className={`badge ${ms.isPublished ? 'badge-green' : 'badge-yellow'}`}>{ms.isPublished ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openMarksheet(ms._id)}>👁️ View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && selectedExam && marksheets.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📄</div><h3>No marksheets generated yet</h3><p>Make sure marks are entered first, then click "Generate Marksheets"</p></div>
      )}

      {viewData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewData(null)}>
          <div className="modal modal-lg" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>📄 Marksheet Preview</h2>
              <button className="modal-close" onClick={() => setViewData(null)}>×</button>
            </div>
            <MarksheetTemplate data={viewData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Marksheets;
