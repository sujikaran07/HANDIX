import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import '../styles/SignIn.css';

const SignIn = ({ loginUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (formData.email === 'retail@example.com' && formData.password === 'password') {
        loginUser({
          name: 'Retail Customer',
          email: formData.email,
          address: '123 Main St, Colombo, Sri Lanka',
          phone: '+94 77 123 4567'
        }, 'retail');
        navigate('/');
      } else if (formData.email === 'wholesale@example.com' && formData.password === 'password') {
        loginUser({
          name: 'Wholesale Business',
          email: formData.email,
          address: '456 Market St, Jaffna, Sri Lanka',
          phone: '+94 76 987 6543',
          businessName: 'ABC Crafts Ltd.',
          taxId: 'SL12345678'
        }, 'wholesale');
        navigate('/');
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h2 className="text-center">Sign In</h2>
        </div>
        <div className="signin-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <FaEnvelope />
                  </span>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <FaLock />
                  </span>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="mt-1 text-right">
                <a href="#" className="text-primary">Forgot your password?</a>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary">
                Register now
              </Link>
            </p>
          </div>

          <div className="mt-5 border-top pt-4">
            <div className="text-center text-muted mb-3">
              For demo purposes, use:
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <h5 className="card-title mb-0">Retail Customer</h5>
                    </div>
                    <p className="card-text text-muted mb-1">Email: retail@example.com</p>
                    <p className="card-text text-muted">Password: password</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <h5 className="card-title mb-0">Wholesale Business</h5>
                    </div>
                    <p className="card-text text-muted mb-1">Email: wholesale@example.com</p>
                    <p className="card-text text-muted">Password: password</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;