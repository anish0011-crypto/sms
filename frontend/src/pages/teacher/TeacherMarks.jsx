import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const getGrade = (obtained, total) => {
  if (total <= 0 || obtained === '' || obtained === undefined || obtained === null) return { g: '—', cls: '' };
  const pct = (Number(obtained) / Number(total)) * 100;
  if (pct >= 80) return { g: 'A', cls: 'grade-a' };
  if (pct >= 60) return { g: 'B', cls: 'grade-b' };
  if (pct >= 45) return { g: 'C', cls: 'grade-c' };
  if (pct >= 33) return { g: 'D', cls: 'grade-d' };
  return { g: 'F', cls: 'grade-f' };
};

const TeacherMarks = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [marksData, setMarksData] = useState({});
  const [rowSaving, setRowSaving] = useState({});
  const [newSubModal, setNewSubModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', totalMarks: 100 });

  const fetchExams = async () => {
    try {
      const { data } = await API.get('/teacher/exams');
      setExams(data || []);
      // Auto-select first exam if available and none selected
      if (data && data.length > 0 && !selectedExam) {
        loadExamData(data[0]._id, data);
      }
    } catch {
      toast.error('Failed to load exams');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const loadExamData = async (examId, examList = exams) => {
    if (!examId) {
      setSelectedExam('');
      setExamInfo(null);
      setStudents([]);
      setMarksData({});
      return;
    }

    setLoading(true);
    setSelectedExam(examId);
    const exam = examList.find(e => e._id === examId);
    setExamInfo(exam);

    try {
      const [studRes, markRes] = await Promise.all([
        API.get('/teacher/students', { params: { class: exam?.class, section: exam?.section } }),
        API.get('/teacher/marks', { params: { exam: examId } }),
      ]);

      const fetchedStudents = studRes.data || [];
      setStudents(fetchedStudents);

      const md = {};
      (markRes.data || []).forEach(m => {
        const sid = m.student?._id || m.student;
        if (!md[sid]) md[sid] = {};
        md[sid][m.subjectName] = m.obtainedMarks;
      });
      setMarksData(md);
    } catch {
      toast.error('Failed to load students or marks data');
    }
    setLoading(false);
  };

  const updateMark = (studentId, subject, val) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]: val === '' ? '' : Math.max(0, Number(val)),
      },
    }));
  };

  // Save a single mark for a student & subject
  const saveMark = async (studentId, subjectName) => {
    const sub = examInfo?.subjects?.find(s => s.name === subjectName);
    const total = sub?.totalMarks || 100;
    const rawVal = marksData[studentId]?.[subjectName];
    if (rawVal === undefined || rawVal === '') return;

    const obtained = Number(rawVal);
    if (obtained < 0 || obtained > total) {
      toast.error(`Marks for ${subjectName} must be between 0 and ${total}`);
      return;
    }

    setRowSaving(prev => ({ ...prev, [`${studentId}_${subjectName}`]: true }));
    try {
      await API.post('/teacher/marks', {
        student: studentId,
        exam: selectedExam,
        subjectName,
        obtainedMarks: obtained,
        totalMarks: total,
      });
      toast.success(`Saved ${subjectName} marks!`);
    } catch {
      toast.error('Failed to save mark');
    }
    setRowSaving(prev => ({ ...prev, [`${studentId}_${subjectName}`]: false }));
  };

  // Save all entered marks for all students in one request
  const handleSaveAll = async () => {
    if (!selectedExam || !examInfo?.subjects?.length) {
      toast.error('No exam or subjects configured');
      return;
    }

    setSavingAll(true);
    const marksToSave = [];

    students.forEach(s => {
      const sMarks = marksData[s._id] || {};
      examInfo.subjects.forEach(sub => {
        const val = sMarks[sub.name];
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
      toast.error('Please enter at least one mark before saving');
      setSavingAll(false);
      return;
    }

    try {
      const { data } = await API.post('/teacher/marks/bulk', {
        exam: selectedExam,
        marks: marksToSave,
      });
      toast.success(data.message || 'All marks saved successfully!');
    } catch {
      toast.error('Failed to save all marks');
    }
    setSavingAll(false);
  };

  // Generate marksheets directly from marks page
  const handleGenerateMarksheets = async () => {
    if (!selectedExam || !examInfo) return;
    setGenerating(true);
    try {
      // First save all current marks to ensure latest data is generated
      await handleSaveAll();

      const { data } = await API.post('/teacher/marksheets/generate', {
        examId: selectedExam,
        class: examInfo.class,
        section: examInfo.section,
      });
      toast.success(data.message || 'Marksheets generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Marksheet generation failed');
    }
    setGenerating(false);
  };

  // Publish marksheets for students
  const handlePublishMarksheets = async () => {
    if (!selectedExam || !examInfo) return;
    if (!confirm('Publish all marksheets for this exam? Students will immediately be able to view their results.')) return;
    setPublishing(true);
    try {
      await API.post('/teacher/marksheets/publish', {
        examId: selectedExam,
        class: examInfo.class,
        section: examInfo.section,
      });
      toast.success('Marksheets published successfully! Students can now view their report cards.');
    } catch {
      toast.error('Failed to publish marksheets');
    }
    setPublishing(false);
  };

  // Auto-load subjects from Subject collection if exam has none
  const handleAutoLoadSubjects = async () => {
    if (!examInfo) return;
    try {
      const { data: subjects } = await API.get('/teacher/subjects', {
        params: { class: examInfo.class, section: examInfo.section },
      });

      if (!subjects || subjects.length === 0) {
        toast.error(`No subjects found in curriculum for Class ${examInfo.class}-${examInfo.section}. Please add a custom subject below.`);
        setNewSubModal(true);
        return;
      }

      const formattedSubjects = subjects.map(s => ({
        name: s.name,
        totalMarks: s.totalMarks || 100,
      }));

      const { data: updatedExam } = await API.put(`/teacher/exams/${selectedExam}/subjects`, {
        subjects: formattedSubjects,
      });

      setExamInfo(updatedExam);
      setExams(prev => prev.map(e => e._id === updatedExam._id ? updatedExam : e));
      toast.success(`Loaded ${formattedSubjects.length} subjects for Class ${examInfo.class}!`);
    } catch {
      toast.error('Failed to load subjects');
    }
  };

  // Add custom subject to current exam
  const handleAddCustomSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;

    const updatedSubjects = [...(examInfo.subjects || []), {
      name: newSubject.name.trim(),
      totalMarks: Number(newSubject.totalMarks) || 100,
    }];

    try {
      const { data: updatedExam } = await API.put(`/teacher/exams/${selectedExam}/subjects`, {
        subjects: updatedSubjects,
      });
      setExamInfo(updatedExam);
      setExams(prev => prev.map(e => e._id === updatedExam._id ? updatedExam : e));
      setNewSubject({ name: '', totalMarks: 100 });
      setNewSubModal(false);
      toast.success(`Added subject: ${newSubject.name}`);
    } catch {
      toast.error('Failed to add subject');
    }
  };

  return (
    <div className="page-wrapper animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>📝 Student Marks Entry</h2>
          <p>Enter marks, auto-calculate grades, and generate official marksheets</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {selectedExam && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/teacher/marksheets')}
              >
                📄 View Marksheets
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveAll}
                disabled={savingAll || loading}
              >
                {savingAll ? '⏳ Saving...' : '💾 Save All Marks'}
              </button>
              <button
                className="btn btn-warning"
                onClick={handleGenerateMarksheets}
                disabled={generating || loading}
                style={{ background: '#d97706', color: '#fff', border: 'none' }}
              >
                {generating ? '⏳ Generating...' : '⚡ Generate Marksheets'}
              </button>
              <button
                className="btn btn-success"
                onClick={handlePublishMarksheets}
                disabled={publishing || loading}
              >
                {publishing ? '⏳ Publishing...' : '🚀 Publish Results'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Exam Selector Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '280px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>
              Select Exam / Test *
            </label>
            <select
              className="form-select"
              value={selectedExam}
              onChange={e => loadExamData(e.target.value)}
            >
              <option value="">— Choose an exam to enter marks —</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} — Class {ex.class}-{ex.section} ({ex.type || 'Exam'})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && examInfo && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAutoLoadSubjects}
                title="Fetch class curriculum subjects"
              >
                🔄 Sync Class Subjects
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setNewSubModal(true)}
              >
                + Add Subject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>Loading students and exam marks...</span>
        </div>
      )}

      {/* Active Exam Overview Banner */}
      {!loading && selectedExam && examInfo && (
        <div style={{
          marginBottom: '18px',
          padding: '14px 20px',
          background: 'rgba(26,107,60,0.12)',
          border: '1px solid rgba(26,107,60,0.3)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-light)' }}>
              📋 {examInfo.name}
            </span>
            <span className="badge badge-blue">
              Class {examInfo.class} - {examInfo.section}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
              📅 {examInfo.month} {examInfo.year} ({examInfo.session || '2024-2025'})
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
              👥 <strong>{students.length}</strong> Students Enrolled
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
            Total Subjects: <strong>{examInfo.subjects?.length || 0}</strong>
          </div>
        </div>
      )}

      {/* Warning if Exam Has No Subjects */}
      {!loading && selectedExam && examInfo && (!examInfo.subjects || examInfo.subjects.length === 0) && (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '20px', border: '1px dashed #d97706' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ marginBottom: '8px', color: '#f6c453' }}>No Subjects Added to this Exam</h3>
          <p style={{ color: 'var(--text2)', maxWidth: '500px', margin: '0 auto 20px' }}>
            To enter marks, this exam needs subjects (e.g., Math, English, Urdu, Science). You can automatically load subjects from the class curriculum or add them manually.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleAutoLoadSubjects}>
              ⚡ Auto-Load Class Subjects
            </button>
            <button className="btn btn-secondary" onClick={() => setNewSubModal(true)}>
              + Add Subject Manually
            </button>
          </div>
        </div>
      )}

      {/* Marks Table */}
      {!loading && selectedExam && examInfo && examInfo.subjects?.length > 0 && (
        <div>
          {students.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">👥</div>
              <h3>No students found in Class {examInfo.class} - {examInfo.section}</h3>
              <p>Please register students for this class or select another exam.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th style={{ minWidth: '180px' }}>Student Name</th>
                      <th style={{ width: '90px' }}>Roll No</th>
                      {examInfo.subjects.map(s => (
                        <th key={s.name} style={{ textAlign: 'center', minWidth: '110px' }}>
                          <div>{s.name}</div>
                          <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.75 }}>
                            Max: {s.totalMarks || 100}
                          </span>
                        </th>
                      ))}
                      <th style={{ textAlign: 'center', minWidth: '110px' }}>Total Marks</th>
                      <th style={{ textAlign: 'center', width: '90px' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => {
                      const sid = s._id;
                      const sm = marksData[sid] || {};

                      // Calculate Student Totals Live
                      let totalMax = 0;
                      let totalObtained = 0;
                      let enteredCount = 0;

                      examInfo.subjects.forEach(sub => {
                        const maxVal = sub.totalMarks || 100;
                        totalMax += maxVal;
                        const v = sm[sub.name];
                        if (v !== '' && v !== undefined && v !== null) {
                          totalObtained += Number(v);
                          enteredCount += 1;
                        }
                      });

                      const overallPct = totalMax > 0 && enteredCount > 0
                        ? ((totalObtained / totalMax) * 100).toFixed(1)
                        : null;

                      let overallGrade = '—';
                      if (overallPct !== null) {
                        const num = Number(overallPct);
                        if (num >= 80) overallGrade = 'A';
                        else if (num >= 60) overallGrade = 'B';
                        else if (num >= 45) overallGrade = 'C';
                        else if (num >= 33) overallGrade = 'D';
                        else overallGrade = 'F';
                      }

                      return (
                        <tr key={sid}>
                          <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>
                              {s.userId?.name || 'Unnamed Student'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              Father: {s.fatherName || '—'}
                            </div>
                          </td>
                          <td>
                            <span style={{ color: '#f6c453', fontWeight: '700', fontSize: '13px' }}>
                              {s.rollNumber}
                            </span>
                          </td>

                          {/* Subject Input Columns */}
                          {examInfo.subjects.map(sub => {
                            const val = sm[sub.name] !== undefined ? sm[sub.name] : '';
                            const maxVal = sub.totalMarks || 100;
                            const { g, cls } = getGrade(val, maxVal);
                            const isSaving = rowSaving[`${sid}_${sub.name}`];

                            return (
                              <td key={sub.name} style={{ textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max={maxVal}
                                    style={{
                                      width: '68px',
                                      padding: '6px 8px',
                                      background: 'var(--bg3)',
                                      border: '1px solid var(--card-border)',
                                      borderRadius: '6px',
                                      color: 'var(--text)',
                                      fontSize: '13px',
                                      textAlign: 'center',
                                      fontWeight: '600',
                                      outline: 'none',
                                    }}
                                    placeholder="0"
                                    value={val}
                                    onChange={e => updateMark(sid, sub.name, e.target.value)}
                                    onBlur={() => val !== '' && saveMark(sid, sub.name)}
                                  />
                                  {val !== '' && (
                                    <span
                                      className={cls}
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '2px 5px',
                                        borderRadius: '4px',
                                        minWidth: '18px',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {g}
                                    </span>
                                  )}
                                  {isSaving && (
                                    <span style={{ fontSize: '10px', color: 'var(--primary-light)' }}>
                                      ...
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          {/* Live Totals Column */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '700', color: 'var(--primary-light)', fontSize: '13px' }}>
                              {totalObtained} / {totalMax}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              {overallPct !== null ? `${overallPct}%` : '—'}
                            </div>
                          </td>

                          {/* Grade Column */}
                          <td style={{ textAlign: 'center' }}>
                            {overallGrade !== '—' ? (
                              <span
                                className={`grade-${overallGrade.toLowerCase()}`}
                                style={{ fontWeight: '800', fontSize: '14px' }}
                              >
                                {overallGrade}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text3)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Quick Action Footer */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid var(--card-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
                  💡 Changes are automatically saved when you leave an input, or click <strong>"Save All Marks"</strong> to save entire class.
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveAll}
                    disabled={savingAll}
                  >
                    💾 {savingAll ? 'Saving All...' : 'Save All Marks'}
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={handleGenerateMarksheets}
                    disabled={generating}
                    style={{ background: '#d97706', color: '#fff', border: 'none' }}
                  >
                    ⚡ {generating ? 'Generating Marksheets...' : 'Generate Marksheets'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State when no exam chosen */}
      {!selectedExam && (
        <div className="card empty-state">
          <div className="empty-icon">✏️</div>
          <h3>Select an Exam to Enter Student Marks</h3>
          <p>Choose an exam from the dropdown list above to view students and begin entering marks.</p>
        </div>
      )}

      {/* Add Custom Subject Modal */}
      {newSubModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setNewSubModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>📚 Add Subject to Exam</h2>
              <button className="modal-close" onClick={() => setNewSubModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddCustomSubject}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Mathematics, Science, English"
                    value={newSubject.name}
                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    className="form-input"
                    value={newSubject.totalMarks}
                    onChange={e => setNewSubject({ ...newSubject, totalMarks: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setNewSubModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  + Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMarks;
