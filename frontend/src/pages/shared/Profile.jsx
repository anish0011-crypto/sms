import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const classOptions = ['Nine', 'Ten', 'Eleven', 'Twelve'];
const sectionOptions = ['A', 'B', 'C', 'D'];
const genderOptions = ['Male', 'Female', 'Other'];

const InfoItem = ({ icon, label, value }) => (
  <div className="profile-info-item">
    <span className="profile-info-icon">{icon}</span>
    <div>
      <div className="profile-info-label">{label}</div>
      <div className="profile-info-value">{value || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Not set</span>}</div>
    </div>
  </div>
);

const Profile = ({ role = 'admin' }) => {
  const { user, refreshUser } = useAuth();

  const [studentData, setStudentData] = useState({
    class: '', section: '', fatherName: '', motherName: '',
    rollNumber: '', dob: '', address: '', gender: ''
  });
  const [authData, setAuthData] = useState({
    phone: '', currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(role === 'student');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Sync phone from user context whenever user changes
  useEffect(() => {
    setAuthData(prev => ({ ...prev, phone: user?.phone || '' }));
  }, [user]);

  useEffect(() => {
    if (role === 'student') {
      API.get('/student/profile')
        .then(r => {
          const d = r.data;
          setStudentData({
            class: d.class || '',
            section: d.section || '',
            fatherName: d.fatherName || '',
            motherName: d.motherName || '',
            rollNumber: d.rollNumber || '',
            dob: d.dob ? d.dob.split('T')[0] : '',
            address: d.address || '',
            gender: d.gender || 'Male'
          });
        })
        .catch(() => {})
        .finally(() => setLoadingProfile(false));
    }
  }, [role]);

  const roleColor = role === 'admin' ? '#9f7aea' : role === 'teacher' ? '#48bb78' : '#63b3ed';
  const roleLabel = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Teacher' : 'Student';
  const roleIcon = role === 'admin' ? '👑' : role === 'teacher' ? '👨‍🏫' : '🎓';

  const handleSave = async (e) => {
    e.preventDefault();
    if (authData.newPassword && authData.newPassword !== authData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (authData.newPassword && !authData.currentPassword) {
      return toast.error('Please enter your current password to change it');
    }

    setSaving(true);
    try {
      let updated = false;

      // 1. Update Student Profile data
      if (role === 'student') {
        await API.put('/student/profile', studentData);
        updated = true;
      }

      // 2. Update Auth (Phone / Password)
      const phoneChanged = authData.phone.trim() !== (user?.phone || '').trim();
      const wantsPasswordChange = authData.newPassword && authData.currentPassword;

      if (phoneChanged || wantsPasswordChange) {
        await API.put('/auth/profile', {
          phone: authData.phone,
          ...(wantsPasswordChange && {
            currentPassword: authData.currentPassword,
            newPassword: authData.newPassword
          })
        });
        // Sync updated phone to AuthContext so sidebar & topbar reflect immediately
        if (phoneChanged) {
          refreshUser({ phone: authData.phone });
        }
        setAuthData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        updated = true;
      }

      if (updated) {
        toast.success('Profile updated successfully! ✅');
      } else {
        toast('No changes detected', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="page-wrapper">
        <div className="loading"><div className="spinner" /> Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper animate-fade">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p>View and manage your account details</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* LEFT — Avatar Card */}
        <div className="profile-avatar-card card">
          <div
            className="profile-avatar"
            style={{
              background: `linear-gradient(135deg, ${roleColor}, #1a6b3c)`,
              boxShadow: `0 0 32px ${roleColor}55`,
              border: `3px solid ${roleColor}66`
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <h2 className="profile-name">{user?.name}</h2>
          <span className="profile-role-badge" style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}44`, color: roleColor }}>
            {roleIcon} {roleLabel}
          </span>

          <div className="profile-meta">
            <InfoItem icon="✉️" label="Email" value={user?.email} />
            <InfoItem icon="📞" label="Phone" value={user?.phone} />
            {role === 'student' && studentData.rollNumber && (
              <InfoItem icon="🎫" label="Roll Number" value={studentData.rollNumber} />
            )}
            {role === 'student' && studentData.class && (
              <InfoItem icon="📚" label="Class" value={`Class ${studentData.class}${studentData.section ? ' – ' + studentData.section : ''}`} />
            )}
          </div>
        </div>

        {/* RIGHT — Edit Form */}
        <div className="profile-form-card card">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              type="button"
              className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              ✏️ Edit Info
            </button>
            <button
              type="button"
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
          </div>

          <form onSubmit={handleSave}>
            {activeTab === 'info' && (
              <div className="profile-section animate-fade">
                <h4 className="profile-section-title">👤 Account Info</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={user?.name || ''} disabled />
                    <span style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Name is managed by admin</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={user?.email || ''} disabled />
                    <span style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Email cannot be changed</span>
                  </div>
                </div>
                <div className="form-group" style={{ maxWidth: '300px' }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    placeholder="Enter your phone number"
                    value={authData.phone}
                    onChange={e => setAuthData({ ...authData, phone: e.target.value })}
                  />
                </div>

                {role === 'student' && (
                  <>
                    <div className="profile-divider" />
                    <h4 className="profile-section-title">🎓 Academic Details</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Class</label>
                        <select
                          className="form-select"
                          value={studentData.class}
                          onChange={e => setStudentData({ ...studentData, class: e.target.value })}
                        >
                          <option value="">Select Class</option>
                          {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section</label>
                        <select
                          className="form-select"
                          value={studentData.section}
                          onChange={e => setStudentData({ ...studentData, section: e.target.value })}
                        >
                          <option value="">Select Section</option>
                          {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          value={studentData.gender}
                          onChange={e => setStudentData({ ...studentData, gender: e.target.value })}
                        >
                          {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-input"
                          value={studentData.dob}
                          onChange={e => setStudentData({ ...studentData, dob: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="profile-divider" />
                    <h4 className="profile-section-title">👨‍👩‍👧 Family Details</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Father's Name</label>
                        <input
                          className="form-input"
                          placeholder="Enter father's name"
                          value={studentData.fatherName}
                          onChange={e => setStudentData({ ...studentData, fatherName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mother's Name</label>
                        <input
                          className="form-input"
                          placeholder="Enter mother's name"
                          value={studentData.motherName}
                          onChange={e => setStudentData({ ...studentData, motherName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        placeholder="Enter your address"
                        value={studentData.address}
                        onChange={e => setStudentData({ ...studentData, address: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="profile-section animate-fade">
                <h4 className="profile-section-title">🔒 Change Password</h4>
                <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
                  Leave blank if you don't want to change your password.
                </p>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter current password"
                    value={authData.currentPassword}
                    onChange={e => setAuthData({ ...authData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="form-grid" style={{ marginTop: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={authData.newPassword}
                      onChange={e => setAuthData({ ...authData, newPassword: e.target.value })}
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Repeat new password"
                      value={authData.confirmPassword}
                      onChange={e => setAuthData({ ...authData, confirmPassword: e.target.value })}
                      minLength={6}
                    />
                  </div>
                </div>
                {authData.newPassword && authData.confirmPassword && authData.newPassword !== authData.confirmPassword && (
                  <p className="error-msg" style={{ marginTop: '8px' }}>⚠️ Passwords do not match</p>
                )}
                {authData.newPassword && authData.confirmPassword && authData.newPassword === authData.confirmPassword && (
                  <p className="success-msg" style={{ marginTop: '8px', fontSize: '12px' }}>✅ Passwords match</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Saving...</> : '💾 Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setAuthData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                  toast('Changes discarded', { icon: '↩️' });
                }}
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
