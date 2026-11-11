import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import runLogo from '../assets/run-logo.jpg';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Dynamic API URL definition
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col items-center justify-center mb-4">
          <img
            src={runLogo}
            alt="Redeemer's University Logo"
            className="h-28 w-auto object-contain mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-800">RUN Market Login</h2>
        </div>

        {error && <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-600">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-lg border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}