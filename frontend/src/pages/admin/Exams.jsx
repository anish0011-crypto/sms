import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const classOptions = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sectionOptions = ['A', 'B', 'C', 'D'];

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', class: '', section: '', type: 'Monthly', session: '2024-2025', month: '', year: '2025', date: '', subjects: [] });
  const [newSubject, setNewSubject] = useState({ name: '', totalMarks: 100 });
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/exams'); setExams(data); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };
  useEffect(() => {
    fetch();
    API.get('/admin/subjects').then(r => {
      setAvailableSubjects(r.data);
    }).catch(() => setAvailableSubjects([]));
  }, []);

  const addSubject = () => {
    if (!newSubject.name) return;
    setForm(f => ({ ...f, subjects: [...f.subjects, { ...newSubject }] }));
    setNewSubject({ name: '', totalMarks: 100 });
  };
  const removeSubject = (i) => setForm(f => ({ ...f, subjects: f.subjects.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await API.put(`/admin/exams/${editId}`, form); toast.success('Exam updated!'); }
      else { await API.post('/admin/exams', form); toast.success('Exam created!'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return;
    try { await API.delete(`/admin/exams/${id}`); toast.success('Deleted!'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const typeColors = { 'Unit Test': 'badge-blue', 'Mid Term': 'badge-yellow', 'Final Term': 'badge-red', 'Monthly': 'badge-green' };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Exams / Tests</h2><p>Total: {exams.length} exams</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', class: '', section: '', type: 'Monthly', session: '2024-2025', month: '', year: '2025', date: '', subjects: [] }); setEditId(null); setModal(true); }}>+ Create Exam</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Exam Name</th><th>Class</th><th>Type</th><th>Month/Year</th><th>Subjects</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7"><div className="loading"><div className="spinner" /></div></td></tr>
              : exams.length === 0 ? <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">📝</div><h3>No exams yet</h3></div></td></tr>
              : exams.map((ex, i) => (
                <tr key={ex._id}>
                  <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{ex.name}</td>
                  <td><span className="badge badge-blue">Class {ex.class} - {ex.section}</span></td>
                  <td><span className={`badge ${typeColors[ex.type] || 'badge-blue'}`}>{ex.type}</span></td>
                  <td style={{ color: 'var(--text2)' }}>{ex.month} {ex.year}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {ex.subjects?.slice(0, 3).map(s => <span key={s.name} className="badge badge-green" style={{ fontSize: '10px' }}>{s.name}</span>)}
                      {ex.subjects?.length > 3 && <span className="badge badge-blue" style={{ fontSize: '10px' }}>+{ex.subjects.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setForm({ name: ex.name, class: ex.class, section: ex.section, type: ex.type, session: ex.session, month: ex.month, year: ex.year, date: ex.date?.split('T')[0] || '', subjects: ex.subjects || [] }); setEditId(ex._id); setModal(true); }}>✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(ex._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{editId ? '✏️ Edit Exam' : '📝 Create Exam'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group"><label className="form-label">Exam Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Class *</label>
                    <select className="form-select" value={form.class} onChange={e => setForm({...form, class: e.target.value})} required>
                      <option value="">Select</option>{classOptions.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Section *</label>
                    <select className="form-select" value={form.section} onChange={e => setForm({...form, section: e.target.value})} required>
                      <option value="">Select</option>{sectionOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group"><label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {['Unit Test', 'Mid Term', 'Final Term', 'Monthly'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Month</label><input className="form-input" value={form.month} onChange={e => setForm({...form, month: e.target.value})} placeholder="e.g. July" /></div>
                  <div className="form-group"><label className="form-label">Year</label><input className="form-input" value={form.year} onChange={e => setForm({...form, year: e.target.value})} /></div>
                </div>
                <div>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Subjects</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ flex: 1 }} value={newSubject.name} onChange={e => {
                      const sub = availableSubjects.find(s => s.name === e.target.value);
                      setNewSubject({ name: e.target.value, totalMarks: sub?.totalMarks || 100 });
                    }}>
                      <option value="">Select Subject</option>
                      {availableSubjects.filter(s => !form.subjects.some(fs => fs.name === s.name)).map(s => <option key={s._id}>{s.name}</option>)}
                    </select>
                    <input className="form-input" style={{ width: '100px' }} type="number" placeholder="Total Marks" value={newSubject.totalMarks} onChange={e => setNewSubject({...newSubject, totalMarks: Number(e.target.value)})} />
                    <button type="button" className="btn btn-secondary" onClick={addSubject}>Add</button>
                  </div>
                  {form.subjects.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '6px', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '13px' }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-blue">{s.totalMarks} marks</span>
                        <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeSubject(i)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create Exam'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
