import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const classOptions = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sectionOptions = ['A', 'B', 'C', 'D'];
const emptyForm = { name: '', code: '', class: '', section: '', totalMarks: 100 };

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.class = filterClass;
      if (filterSection) params.section = filterSection;
      const { data } = await API.get('/admin/subjects', { params });
      setSubjects(data);
    } catch { toast.error('Failed to load subjects'); }
    setLoading(false);
  };

  useEffect(() => { fetchSubjects(); }, [filterClass, filterSection]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (sub) => { setForm({ name: sub.name, code: sub.code, class: sub.class, section: sub.section, totalMarks: sub.totalMarks }); setEditId(sub._id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await API.put(`/admin/subjects/${editId}`, form); toast.success('Subject updated!'); }
      else { await API.post('/admin/subjects', form); toast.success('Subject created!'); }
      setModal(false); fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving subject'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try { await API.delete(`/admin/subjects/${id}`); toast.success('Subject deleted!'); fetchSubjects(); }
    catch { toast.error('Failed to delete subject'); }
  };

  const grouped = subjects.reduce((acc, sub) => {
    const key = `Class ${sub.class} - Section ${sub.section}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sub);
    return acc;
  }, {});

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>📚 Subjects</h2><p>Manage subjects for all classes</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Subject</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
          <label className="form-label">Filter by Class</label>
          <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
          <label className="form-label">Filter by Section</label>
          <select className="form-select" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="">All Sections</option>
            {sectionOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={() => { setFilterClass(''); setFilterSection(''); }}>Clear</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading subjects...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No subjects yet</h3>
          <p>Add your first subject to get started</p>
          <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={openAdd}>+ Add Subject</button>
        </div>
      ) : (
        Object.entries(grouped).map(([groupKey, subs]) => (
          <div key={groupKey} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-light)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🏫 {groupKey}
            </h3>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Code</th>
                      <th>Total Marks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(sub => (
                      <tr key={sub._id}>
                        <td><span style={{ fontWeight: '600' }}>{sub.name}</span></td>
                        <td><span className="badge badge-blue">{sub.code}</span></td>
                        <td><span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>{sub.totalMarks}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(sub)}>✏️</button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(sub._id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? '✏️ Edit Subject' : '📚 Add New Subject'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Subject Name *</label>
                    <input className="form-input" placeholder="e.g. Mathematics" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject Code *</label>
                    <input className="form-input" placeholder="e.g. MATH101" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Class *</label>
                    <select className="form-select" value={form.class} onChange={e => setForm({...form, class: e.target.value})} required>
                      <option value="">Select Class</option>
                      {classOptions.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section *</label>
                    <select className="form-select" value={form.section} onChange={e => setForm({...form, section: e.target.value})} required>
                      <option value="">Select Section</option>
                      {sectionOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input type="number" className="form-input" value={form.totalMarks} min="1" max="1000" onChange={e => setForm({...form, totalMarks: Number(e.target.value)})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Subject' : 'Add Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
