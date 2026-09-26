import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import MarksheetTemplate from '../../components/MarksheetTemplate';

const TeacherMarksheets = () => {
  const [exams, setExams] = useState([]);
  const [marksheets, setMarksheets] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load teacher exams and marksheets
  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, msRes] = await Promise.all([
        API.get('/teacher/exams'),
        API.get('/teacher/marksheets', { params: selectedExam ? { exam: selectedExam } : {} }),
      ]);
      setExams(examRes.data || []);
      setMarksheets(msRes.data || []);
    } catch {
      toast.error('Failed to load marksheets');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedExam]);

  // Generate marksheets for selected exam
  const handleGenerate = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    const currentExam = exams.find(e => e._id === selectedExam);
    if (!currentExam) return;

    setGenerating(true);
    try {
      const { data } = await API.post('/teacher/marksheets/generate', {
        examId: selectedExam,
        class: currentExam.class,
        section: currentExam.section,
      });
      toast.success(data.message || 'Marksheets generated successfully!');
      // Refresh list
      const msRes = await API.get('/teacher/marksheets', { params: { exam: selectedExam } });
      setMarksheets(msRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate marksheets');
    }
    setGenerating(false);
  };

  // Publish all marksheets for this exam
  const handlePublish = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    const currentExam = exams.find(e => e._id === selectedExam);
    if (!currentExam || !confirm('Publish all marksheets? Students and parents will be able to view their report cards.')) return;

    setPublishing(true);
    try {
      await API.post('/teacher/marksheets/publish', {
        examId: selectedExam,
        class: currentExam.class,
        section: currentExam.section,
      });
      toast.success('Marksheets published successfully!');
      const msRes = await API.get('/teacher/marksheets', { params: { exam: selectedExam } });
      setMarksheets(msRes.data || []);
    } catch {
      toast.error('Failed to publish marksheets');
    }
    setPublishing(false);
  };

  const openMarksheet = (data) => {
    setViewData({
      studentName: data.student?.userId?.name || '—',
      fatherName: data.student?.fatherName || '—',
      motherName: data.student?.motherName || '—',
      rollNumber: data.student?.rollNumber || '—',
      dob: data.student?.dob || null,
      gender: data.student?.gender || '',
      address: data.student?.address || '',
      phone: data.student?.userId?.phone || '',
      class: data.class,
      section: data.section,
      session: data.session,
      month: data.month,
      year: data.year,
      marks: data.marks,
      totalMarks: data.totalMarks,
      obtainedMarks: data.obtainedMarks,
      percentage: data.percentage,
      overallGrade: data.overallGrade,
      rank: data.rank,
      remarks: data.remarks,
    });
  };

  const filteredMarksheets = marksheets.filter(ms => {
    if (!searchQuery) return true;
    const name = ms.student?.userId?.name?.toLowerCase() || '';
    const roll = ms.student?.rollNumber?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || roll.includes(q);
  });

  const allPublished = marksheets.length > 0 && marksheets.every(m => m.isPublished);

  return (
    <div className="page-wrapper animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>📄 Marksheets & Results</h2>
          <p>Generate, publish, view, and print student marksheets and report cards</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {selectedExam && (
            <>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? '⏳ Generating...' : '⚡ Generate Marksheets'}
              </button>
              {marksheets.length > 0 && !allPublished && (
                <button
                  className="btn btn-success"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? '⏳ Publishing...' : '🚀 Publish All'}
                </button>
              )}
              {allPublished && (
                <span className="badge badge-green" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  ✅ All Published
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '260px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Filter by Exam</label>
            <select
              className="form-select"
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
            >
              <option value="">— All Exams / Recent Marksheets —</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} (Class {ex.class}-{ex.section})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
            <label className="form-label">Search Student</label>
            <input
              className="form-input"
              placeholder="Search by student name or roll no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && (
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>Loading marksheets...</span>
        </div>
      )}

      {/* Marksheets Table */}
      {!loading && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarksheets.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <div className="empty-icon">📄</div>
                        <h3>No marksheets found</h3>
                        <p style={{ maxWidth: '420px', margin: '0 auto 16px' }}>
                          {selectedExam
                            ? 'Marksheets for this exam have not been generated yet. Enter marks first, then click "Generate Marksheets" above.'
                            : 'Select an exam from the filter above to generate or view marksheets.'}
                        </p>
                        {selectedExam && (
                          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                            ⚡ Generate Marksheets Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...filteredMarksheets].sort((a, b) => (a.rank || 999) - (b.rank || 999)).map(ms => (
                    <tr key={ms._id}>
                      <td>
                        <span style={{
                          fontWeight: '800',
                          fontSize: '15px',
                          color: ms.rank === 1 ? '#f6c453' : ms.rank === 2 ? '#e2e8f0' : ms.rank === 3 ? '#ed8936' : 'var(--text3)'
                        }}>
                          {ms.rank ? `#${ms.rank}` : '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>
                          {ms.student?.userId?.name || '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                          Father: {ms.student?.fatherName || '—'}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#f6c453', fontWeight: '700' }}>
                          {ms.student?.rollNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {ms.class}-{ms.section}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500', fontSize: '12px' }}>
                        {ms.exam?.name || 'Exam'}
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: 'var(--primary-light)' }}>
                          {ms.obtainedMarks} / {ms.totalMarks}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          color: ms.percentage >= 60 ? '#68d391' : ms.percentage >= 33 ? '#f6c453' : '#fc8181',
                          fontWeight: '700',
                          fontSize: '13px',
                        }}>
                          {ms.percentage}%
                        </span>
                      </td>
                      <td>
                        <span className={`grade-${ms.overallGrade?.toLowerCase()}`} style={{ fontWeight: '800', fontSize: '14px' }}>
                          {ms.overallGrade}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ms.isPublished ? 'badge-green' : 'badge-yellow'}`}>
                          {ms.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openMarksheet(ms)}
                          title="View and Print / Download PDF"
                        >
                          👁️ View & Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marksheet Print & Preview Modal */}
      {viewData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewData(null)}>
          <div className="modal modal-lg" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <h2>📄 Marksheet Preview & Print</h2>
              <button className="modal-close" onClick={() => setViewData(null)}>×</button>
            </div>
            <MarksheetTemplate data={viewData} onClose={() => setViewData(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMarksheets;
