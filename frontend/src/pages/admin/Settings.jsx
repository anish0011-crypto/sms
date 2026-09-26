import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: 'RKD SCHOOL',
    tagline: 'Excellence in Education',
    establishedYear: '2000',
    address: 'Lahore, Pakistan',
    phone: '03001234567',
    email: 'info@rkdschool.edu.pk',
    website: 'www.rkdschool.edu.pk',
    currentSession: '2024-2025',
    principalTitle: 'Principal',
  });

  useEffect(() => {
    API.get('/api/settings')
      .then(r => {
        if (r.data) {
          setFormData(prev => ({ ...prev, ...r.data }));
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/admin/settings', formData);
      setFormData(prev => ({ ...prev, ...data }));
      toast.success('School settings updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading"><div className="spinner" /> Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header">
        <div>
          <h2>🏫 School Settings</h2>
          <p>Configure official school information (Reflected on all Marksheets & Reports)</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📜 Official School Details
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">School Name</label>
              <input
                className="form-input"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g. RKD School"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">School Tagline / Subtitle</label>
              <input
                className="form-input"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. Excellence in Education"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Established Year</label>
                <input
                  className="form-input"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Academic Session</label>
                <input
                  className="form-input"
                  name="currentSession"
                  value={formData.currentSession}
                  onChange={handleChange}
                  placeholder="e.g. 2024-2025"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Address</label>
              <input
                className="form-input"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  className="form-input"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Head Signature Title</label>
                <input
                  className="form-input"
                  name="principalTitle"
                  value={formData.principalTitle}
                  onChange={handleChange}
                  placeholder="e.g. Principal"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>📊 System Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['Version', 'v1.0.0'],
                ['Database', 'MongoDB'],
                ['Backend', 'Node.js + Express'],
                ['Frontend', 'React + Vite'],
                ['Marksheet Engine', 'Dynamic PDF & Print Ready'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--card-border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ fontWeight: '600' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(26,107,60,0.15), rgba(26,107,60,0.05))', border: '1px solid rgba(26,107,60,0.3)' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '15px' }}>👑 Admin Account</h3>
            <p style={{ color: 'var(--text2)', fontSize: '13px', fontWeight: '600' }}>{user?.name}</p>
            <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
