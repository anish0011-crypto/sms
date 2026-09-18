import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import MarksheetTemplate from '../../components/MarksheetTemplate';

const TeacherMarksheets = () => {
  const [marksheets, setMarksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    API.get('/teacher/marksheets').then(r => { setMarksheets(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openMarksheet = (data) => {
    setViewData({
      studentName: data.student?.userId?.name || '—',
      fatherName: data.student?.fatherName || '—',
      rollNumber: data.student?.rollNumber || '—',
      class: data.class, section: data.section,
      session: data.session, month: data.month, year: data.year,
      marks: data.marks, totalMarks: data.totalMarks, obtainedMarks: data.obtainedMarks,
      percentage: data.percentage, overallGrade: data.overallGrade,
      rank: data.rank, remarks: data.remarks,
    });
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Marksheets</h2><p>View marksheets for your assigned classes</p></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Exam</th><th>Student</th><th>Roll No</th><th>Class</th><th>Marks</th><th>Grade</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="8"><div className="loading"><div className="spinner" /></div></td></tr>
              : marksheets.length === 0 ? <tr><td colSpan="8"><div className="empty-state"><div className="empty-icon">📄</div><h3>No marksheets found</h3></div></td></tr>
              : marksheets.map(ms => (
                <tr key={ms._id}>
                  <td style={{ fontWeight: '600' }}>{ms.exam?.name}</td>
                  <td>{ms.student?.userId?.name}</td>
                  <td><span style={{ color: '#f6c453', fontWeight: '700' }}>{ms.student?.rollNumber}</span></td>
                  <td><span className="badge badge-blue">{ms.class}-{ms.section}</span></td>
                  <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{ms.obtainedMarks} / {ms.totalMarks}</td>
                  <td><span className={`grade-${ms.overallGrade?.toLowerCase()}`} style={{ fontWeight: '800' }}>{ms.overallGrade}</span></td>
                  <td><span className={`badge ${ms.isPublished ? 'badge-green' : 'badge-yellow'}`}>{ms.isPublished ? 'Published' : 'Draft'}</span></td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => openMarksheet(ms)}>👁️ View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default TeacherMarksheets;
