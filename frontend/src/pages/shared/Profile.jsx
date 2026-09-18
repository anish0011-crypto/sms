import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const classOptions = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sectionOptions = ['A', 'B', 'C', 'D'];

const Profile = ({ role = 'admin' }) => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState({ class: '', section: '', fatherName: '', rollNumber: '', dob: '', address: '', gender: '' });
  const [authData, setAuthData] = useState({ phone: user?.phone || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(role === 'student');

  useEffect(() => {
    if (role === 'student') {
      API.get('/student/profile').then(r => {
        setStudentData({
          class: r.data.class || '', section: r.data.section || '', fatherName: r.data.fatherName || '',
          rollNumber: r.data.rollNumber || '', dob: r.data.dob ? r.data.dob.split('T')[0] : '',
          address: r.data.address || '', gender: r.data.gender || ''
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [role]);

  const roleColor = role === 'admin' ? '#9f7aea' : role === 'teacher' ? '#48bb78' : '#63b3ed';
  const roleLabel = role === 'admin' ? '👑 Administrator' : role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student';
  
  const handleSave = async (e) => { 
    e.preventDefault();
    try {
      if (authData.newPassword && authData.newPassword !== authData.confirmPassword) {
        return toast.error('Passwords do not match');
      }
      
      let updated = false;

      // 1. Update Student Profile if student
      if (role === 'student') {
        await API.put('/student/profile', studentData);
        updated = true;
      }
      
      // 2. Update Auth (Phone/Password) if changed
      if (authData.phone !== user?.phone || authData.newPassword) {
        await API.put('/auth/profile', {
          phone: authData.phone,
          currentPassword: authData.currentPassword,
          newPassword: authData.newPassword
        });
        updated = true;
        setAuthData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' })); // clear passwords
      }
      
      if (updated) {
        toast.success('Profile updated successfully!');
      } else {
        toast('No changes made');
      }
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to update profile'); 
    }
  };

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header"><div><h2>My Profile</h2><p>Manage your account</p></div></div>
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, #1a6b3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '800', border: `3px solid ${roleColor}`, boxShadow: `0 0 24px ${roleColor}44` }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{user?.name}</h2>
            <span style={{ display: 'inline-block', marginTop: '6px', padding: '4px 14px', background: `${roleColor}22`, border: `1px solid ${roleColor}44`, borderRadius: '20px', fontSize: '12px', color: roleColor, fontWeight: '600' }}>{roleLabel}</span>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {[['✉️', 'Email', user?.email], ['📞', 'Phone', user?.phone || 'Not set']].map(([icon, label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--card-border)', textAlign: 'left' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: '600' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '15px' }}>✏️ Edit Profile</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue={user?.name} disabled /></div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" defaultValue={user?.email} disabled /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} /></div>
            
            {role === 'student' && !loading && (
              <>
                <hr style={{ borderColor: 'var(--card-border)' }} />
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)' }}>🎓 Academic Details</h4>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Class</label>
                    <select className="form-select" value={studentData.class} onChange={e => setStudentData({...studentData, class: e.target.value})}>
                      <option value="">Select Class</option>{classOptions.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Section</label>
                    <select className="form-select" value={studentData.section} onChange={e => setStudentData({...studentData, section: e.target.value})}>
                      <option value="">Select</option>{sectionOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Father's Name</label><input className="form-input" value={studentData.fatherName} onChange={e => setStudentData({...studentData, fatherName: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" value={studentData.rollNumber} onChange={e => setStudentData({...studentData, rollNumber: e.target.value})} /></div>
                </div>
              </>
            )}

            <hr style={{ borderColor: 'var(--card-border)' }} />
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)' }}>🔒 Change Password</h4>
            <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" placeholder="Leave blank to keep same" value={authData.currentPassword} onChange={e => setAuthData({...authData, currentPassword: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={authData.newPassword} onChange={e => setAuthData({...authData, newPassword: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" value={authData.confirmPassword} onChange={e => setAuthData({...authData, confirmPassword: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>💾 Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
