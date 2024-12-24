import React, { useState } from 'react';
import { api } from '../api';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isLogin && credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const endpoint = isLogin ? '/users/login' : '/users/register';
      const response = await api.post(endpoint, {
        username: credentials.username,
        password: credentials.password
      });

      const userData = {
        username: response.data.username,
        userId: response.data.userId
      };
      // Store user data in localStorage and update parent component
      localStorage.setItem('user', JSON.stringify(userData));
      // Force a reload to ensure proper initialization
      window.location.reload();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow bg-dark text-light border-secondary">
            <div className="card-body">
              <h2 className="text-center mb-4">
                {isLogin ? 'Login' : 'Create Account'}
              </h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control bg-dark text-light border-secondary"
                      value={credentials.confirmPassword}
                      onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  {isLogin ? 'Login' : 'Create Account'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-light w-100"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setCredentials({ username: '', password: '', confirmPassword: '' });
                    setError('');
                  }}
                >
                  {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
