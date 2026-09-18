import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', phone: '', employeeId: '', qualification: '' };
const classes = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sections = ['A', 'B', 'C', 'D'];
const subjects = [];

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/teachers'); setTeachers(data); }
    catch { toast.error('Failed to load teachers'); }
    setLoading(false);
  };
  useEffect(() => {
    fetch();
    API.get('/admin/subjects').then(r => {
      const names = [...new Set(r.data.map(s => s.name))];
      setAvailableSubjects(names);
    }).catch(() => setAvailableSubjects([]));
  }, []);

  const openAdd = () => { setForm(emptyForm); setAssignedClasses([]); setEditId(null); setModal(true); };
  const openEdit = (t) => {
    setForm({ name: t.userId?.name || '', email: t.userId?.email || '', password: '', phone: t.userId?.phone || '', employeeId: t.employeeId, qualification: t.qualification });
    setAssignedClasses(t.assignedClasses || []);
    setEditId(t._id); setModal(true);
  };

  const addAssignedClass = () => setAssignedClasses([...assignedClasses, { class: '', section: '', subjects: [] }]);
  const removeAssignedClass = (i) => setAssignedClasses(assignedClasses.filter((_, idx) => idx !== i));
  const updateAC = (i, field, val) => {
    const updated = [...assignedClasses];
    updated[i] = { ...updated[i], [field]: val };
    setAssignedClasses(updated);
  };
  const toggleSubject = (i, sub) => {
    const updated = [...assignedClasses];
    const subs = updated[i].subjects || [];
    updated[i].subjects = subs.includes(sub) ? subs.filter(s => s !== sub) : [...subs, sub];
    setAssignedClasses(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, assignedClasses };
      if (editId) { await API.put(`/admin/teachers/${editId}`, payload); toast.success('Teacher updated!'); }
      else { await API.post('/admin/teachers', payload); toast.success('Teacher added!'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving teacher'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher?')) return;
    try { await API.delete(`/admin/teachers/${id}`); toast.success('Deleted!'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = teachers.filter(t => t.userId?.name?.toLowerCase().includes(search.toLowerCase()) || t.employeeId?.includes(search));

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Teachers Management</h2><p>Total: {teachers.length} teachers</p></div>
        <button className="btn btn-primary" id="add-teacher-btn" onClick={openAdd}>+ Add Teacher</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or employee ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Employee ID</th><th>Qualification</th><th>Assigned Classes</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6"><div className="loading"><div className="spinner" /></div></td></tr>
              : filtered.length === 0 ? <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon">👨‍🏫</div><h3>No teachers found</h3></div></td></tr>
              : filtered.map((t, i) => (
                <tr key={t._id}>
                  <td style={{ color: 'var(--text3)', fontWeight: '600' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #2b6cb0, #63b3ed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                        {t.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{t.userId?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{t.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: '700', color: '#63b3ed' }}>{t.employeeId}</span></td>
                  <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{t.qualification || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {t.assignedClasses?.map((ac, idx) => (
                        <span key={idx} className="badge badge-green" style={{ fontSize: '10px' }}>Class {ac.class}-{ac.section}</span>
                      ))}
                      {(!t.assignedClasses || t.assignedClasses.length === 0) && <span style={{ color: 'var(--text3)', fontSize: '12px' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(t)}>✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(t._id)}>🗑️</button>
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
          <div className="modal modal-lg" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{editId ? '✏️ Edit Teacher' : '👨‍🏫 Add New Teacher'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                </div>
                <div className="form-grid">
                  {!editId && <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>}
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Employee ID *</label><input className="form-input" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} /></div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="form-label">Assigned Classes</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addAssignedClass}>+ Add Class</button>
                  </div>
                  {assignedClasses.map((ac, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                      <div className="form-grid" style={{ marginBottom: '10px' }}>
                        <div className="form-group"><label className="form-label">Class</label>
                          <select className="form-select" value={ac.class} onChange={e => updateAC(idx, 'class', e.target.value)}>
                            <option value="">Select</option>{classes.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="form-group"><label className="form-label">Section</label>
                          <select className="form-select" value={ac.section} onChange={e => updateAC(idx, 'section', e.target.value)}>
                            <option value="">Select</option>{sections.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Subjects</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(availableSubjects.length === 0 ? subjects : availableSubjects).map(sub => (
                            <button key={sub} type="button"
                              style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                                background: ac.subjects?.includes(sub) ? 'rgba(26,107,60,0.3)' : 'rgba(255,255,255,0.04)',
                                borderColor: ac.subjects?.includes(sub) ? '#1a6b3c' : 'rgba(255,255,255,0.1)',
                                color: ac.subjects?.includes(sub) ? '#68d391' : 'var(--text3)' }}
                              onClick={() => toggleSubject(idx, sub)}>
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: '10px' }} onClick={() => removeAssignedClass(idx)}>Remove Class</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
