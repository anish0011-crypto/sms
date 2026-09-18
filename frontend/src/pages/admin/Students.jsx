import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', phone: '', rollNumber: '', class: '', section: '', fatherName: '', motherName: '', dob: '', address: '', gender: 'Male' };
const classes = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sections = ['A', 'B', 'C', 'D'];

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.class = filterClass;
      const { data } = await API.get('/admin/students', { params });
      setStudents(data);
    } catch { toast.error('Failed to load students'); }
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [filterClass]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (s) => {
    setForm({
      name: s.userId?.name || '', email: s.userId?.email || '', password: '', phone: s.userId?.phone || '',
      rollNumber: s.rollNumber, class: s.class, section: s.section,
      fatherName: s.fatherName, motherName: s.motherName,
      dob: s.dob ? s.dob.split('T')[0] : '', address: s.address, gender: s.gender,
    });
    setEditId(s._id); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/admin/students/${editId}`, form);
        toast.success('Student updated!');
      } else {
        await API.post('/admin/students', form);
        toast.success('Student added!');
      }
      setModal(false); fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving student'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    try { await API.delete(`/admin/students/${id}`); toast.success('Deleted!'); fetchStudents(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = students.filter(s =>
    (s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
     s.rollNumber?.includes(search) ||
     s.fatherName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>Students Management</h2><p>Total: {students.length} students</p></div>
        <button className="btn btn-primary" id="add-student-btn" onClick={openAdd}>+ Add Student</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name, roll number, father name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>#</th><th>Name</th><th>Roll No</th><th>Class</th><th>Father Name</th><th>Gender</th><th>Contact</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8"><div className="loading"><div className="spinner" /> Loading...</div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8"><div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3></div></td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: 'var(--text3)', fontWeight: '600' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a6b3c, #48bb78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                        {s.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{s.userId?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: '700', color: '#f6c453' }}>{s.rollNumber}</span></td>
                  <td><span className="badge badge-blue">Class {s.class} - {s.section}</span></td>
                  <td style={{ color: 'var(--text2)' }}>{s.fatherName || '—'}</td>
                  <td><span className={`badge ${s.gender === 'Female' ? 'badge-yellow' : 'badge-blue'}`}>{s.gender}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.userId?.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s._id)} title="Delete">🗑️</button>
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
              <h2>{editId ? '✏️ Edit Student' : '🎓 Add New Student'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                </div>
                {!editId && <div className="form-grid">
                  <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                </div>}
                <div className="form-grid-3">
                  <div className="form-group"><label className="form-label">Roll Number *</label><input className="form-input" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Class *</label>
                    <select className="form-select" value={form.class} onChange={e => setForm({...form, class: e.target.value})} required>
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
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Father's Name</label><input className="form-input" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Mother's Name</label><input className="form-input" value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Student' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
