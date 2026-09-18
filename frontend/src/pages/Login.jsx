import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // removed fillCreds

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />

      {/* Floating decorative elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '80px', opacity: 0.03, transform: 'rotate(-20deg)' }}>📚</div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', fontSize: '80px', opacity: 0.03, transform: 'rotate(15deg)' }}>🎓</div>
      <div style={{ position: 'absolute', top: '40%', right: '8%', fontSize: '50px', opacity: 0.04 }}>✏️</div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏫</div>
          <h1>RKD SCHOOL</h1>
          <p>School Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>✉️</span>
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
              <input
                id="login-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button id="login-submit" type="submit" className="login-submit" disabled={loading}>
            {loading ? '⏳ Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text2)' }}>
          Don't have an account? <br />
          <a href="/register" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Register as Student</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
