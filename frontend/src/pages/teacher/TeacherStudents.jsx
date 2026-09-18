import { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/teacher/students');
        setStudents(data);
        const uniqueClasses = [...new Set(data.map(s => `${s.class}-${s.section}`))];
        setClasses(uniqueClasses);
      } catch { toast.error('Failed to load students'); }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = students.filter(s => {
    const matchesSearch = s.userId?.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.includes(search);
    const matchesClass = filterClass ? `${s.class}-${s.section}` === filterClass : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div><h2>My Students</h2><p>Students enrolled in your assigned classes</p></div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ width: '200px' }}>
          <option value="">All My Classes</option>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading ? <div className="loading"><div className="spinner" /></div>
        : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3></div>
        : classes.filter(c => filterClass ? c === filterClass : true).map(cls => {
          const classStudents = filtered.filter(s => `${s.class}-${s.section}` === cls);
          if (classStudents.length === 0) return null;
          return (
            <div key={cls} className="card" style={{ padding: 0 }}>
              <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--card-border)', fontWeight: '700', color: 'var(--primary-light)' }}>
                🏫 Class {cls} <span className="badge badge-green" style={{ marginLeft: '10px' }}>{classStudents.length} Students</span>
              </div>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Gender</th><th>Contact</th></tr></thead>
                  <tbody>
                    {classStudents.map((s, i) => (
                      <tr key={s._id}>
                        <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #48bb78, #38a169)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                              {s.userId?.name?.charAt(0)}
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{s.userId?.name}</div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: '700', color: '#f6c453' }}>{s.rollNumber}</span></td>
                        <td><span className={`badge ${s.gender === 'Female' ? 'badge-yellow' : 'badge-blue'}`}>{s.gender}</span></td>
                        <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.userId?.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherStudents;
