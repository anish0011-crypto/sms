import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const classes = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sections = ['A', 'B', 'C', 'D'];

const Classes = () => {
  const [classes2, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', section: '', session: '2024-2025', subjects: [] });
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/classes'); setClasses(data); }
    catch { toast.error('Failed to load classes'); }
    setLoading(false);
  };
  useEffect(() => {
    fetch();
    API.get('/admin/subjects').then(r => {
      const names = [...new Set(r.data.map(s => s.name))];
      setAvailableSubjects(names);
    }).catch(() => setAvailableSubjects([]));
  }, []);

  const toggleSub = (sub) => {
    setForm(f => ({ ...f, subjects: f.subjects.includes(sub) ? f.subjects.filter(s => s !== sub) : [...f.subjects, sub] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await API.put(`/admin/classes/${editId}`, form); toast.success('Class updated!'); }
      else { await API.post('/admin/classes', form); toast.success('Class created!'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    try { await API.delete(`/admin/classes/${id}`); toast.success('Deleted!'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Classes & Sections</h2><p>Manage class structure</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', section: '', session: '2024-2025', subjects: [] }); setEditId(null); setModal(true); }}>+ Add Class</button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {loading ? <div className="loading"><div className="spinner" /></div> : classes2.map((cls, i) => (
          <div key={cls._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-light)' }}>Class {cls.name}</h3>
                <span className="badge badge-blue" style={{ marginTop: '4px' }}>Section {cls.section}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setForm({ name: cls.name, section: cls.section, session: cls.session, subjects: cls.subjects || [] }); setEditId(cls._id); setModal(true); }}>✏️</button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(cls._id)}>🗑️</button>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Subjects</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {cls.subjects?.map(s => <span key={s} className="badge badge-green" style={{ fontSize: '10px' }}>{s}</span>)}
                {(!cls.subjects || cls.subjects.length === 0) && <span style={{ color: 'var(--text3)', fontSize: '12px' }}>No subjects assigned</span>}
              </div>
            </div>
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--card-border)', fontSize: '11px', color: 'var(--text3)' }}>
              📅 Session: {cls.session}
            </div>
          </div>
        ))}
        {!loading && classes2.length === 0 && (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="empty-state"><div className="empty-icon">🏫</div><h3>No classes yet</h3><p>Add your first class to get started</p></div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? '✏️ Edit Class' : '🏫 Add New Class'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Class Name *</label>
                    <select className="form-select" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Section *</label>
                    <select className="form-select" value={form.section} onChange={e => setForm({...form, section: e.target.value})} required>
                      <option value="">Select</option>
                      {sections.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Session</label><input className="form-input" value={form.session} onChange={e => setForm({...form, session: e.target.value})} /></div>
                <div>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Subjects</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableSubjects.length === 0 && (
                      <p style={{ color: 'var(--text3)', fontSize: '12px' }}>No subjects added yet. Go to <strong>Subjects</strong> page to add some.</p>
                    )}
                    {availableSubjects.map(sub => (
                      <button key={sub} type="button"
                        style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          background: form.subjects.includes(sub) ? 'rgba(26,107,60,0.3)' : 'rgba(255,255,255,0.04)',
                          borderColor: form.subjects.includes(sub) ? '#1a6b3c' : 'rgba(255,255,255,0.1)',
                          color: form.subjects.includes(sub) ? '#68d391' : 'var(--text3)' }}
                        onClick={() => toggleSub(sub)}>
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
