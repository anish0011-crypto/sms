import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const handleSave = (e) => { e.preventDefault(); toast.success('Settings saved!'); };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header"><div><h2>School Settings</h2><p>Configure school information</p></div></div>
      <div className="grid-2" style={{ gap: '24px' }}>
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '15px' }}>🏫 School Information</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group"><label className="form-label">School Name</label><input className="form-input" defaultValue="RKD School" /></div>
            <div className="form-group"><label className="form-label">Established Year</label><input className="form-input" defaultValue="2000" /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" defaultValue="Lahore, Pakistan" /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" defaultValue="03001234567" /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="info@rkdschool.edu.pk" /></div>
            <div className="form-group"><label className="form-label">Website</label><input className="form-input" defaultValue="www.rkdschool.edu.pk" /></div>
            <div className="form-group"><label className="form-label">Current Session</label><input className="form-input" defaultValue="2024-2025" /></div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>💾 Save Settings</button>
          </form>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>📊 System Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[['Version', 'v1.0.0'], ['Database', 'MongoDB'], ['Backend', 'Node.js + Express'], ['Frontend', 'React + Vite']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--card-border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ fontWeight: '600' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(26,107,60,0.15), rgba(26,107,60,0.05))', border: '1px solid rgba(26,107,60,0.3)' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '15px' }}>👑 Admin Account</h3>
            <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{user?.name}</p>
            <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
