/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonBox } from './Skeletons';

const API_BASE = import.meta.env.VITE_API_BASE ;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch( `${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      setIsLoading(false);
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role); // Store the role
        localStorage.setItem('userEmail', email); // Store user email for filtering
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate(data.role === 'admin' ? '/Admin-Editor' : '/'), 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 relative overflow-hidden">
      {/* Premium animated gold graph/grid background */}
      <div className="premium-bg">
        {/* More dense vertical lines */}
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '10%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '20%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '30%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '40%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '50%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '60%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '70%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '80%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '90%' }} />
        {/* More dense horizontal lines */}
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '10%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '20%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '30%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '40%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '50%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '60%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '70%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '80%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: '90%' }} />
      </div>
      <div className="relative z-10 w-full flex items-center justify-center">
        {isLoading ? (
          <form className="bg-white p-4 md:p-6 rounded shadow-md w-full max-w-xs md:w-80">
            <SkeletonBox className="h-8 w-1/2 mb-4" />
            <SkeletonBox className="h-10 w-full mb-4" />
            <SkeletonBox className="h-10 w-full mb-4" />
            <SkeletonBox className="h-10 w-full" />
          </form>
        ) : (
          <div className="w-full max-w-xs md:w-80 flex flex-col items-center">
            <form onSubmit={handleLogin} className="bg-white p-4 md:p-6 rounded shadow-md w-full">
              <h1 className="text-xl font-bold mb-4 text-center">Login</h1>
              {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
              {success && <div className="mb-2 p-2 bg-green-100 text-green-700 rounded text-sm">{success}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mb-4 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4 text-sm"
                required
              />
              <button
                type="submit"
                className="w-full bg-blood-red-600 text-white py-2 rounded text-sm transition-transform duration-300 hover:scale-105 hover:bg-blood-red-700"
              >
                Login
              </button>
              <div className="mt-4 text-center">
                <span className="text-gray-600 text-sm">Not registered?</span>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="ml-2 text-blood-red-600 font-semibold hover:underline text-sm"
                >
                  Go to Register
                </button>
              </div>
            </form>
            <div className="w-full flex items-center mb-4">
              <div className="flex-grow h-px bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 opacity-70"></div>
              <span className="mx-3 text-gray-400 font-semibold text-xs tracking-widest uppercase">or</span>
              <div className="flex-grow h-px bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 opacity-70"></div>
            </div>
            <button
              onClick={() => navigate('/google-auth')}
              className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-yellow-400 rounded-xl shadow-lg hover:shadow-2xl transition-all text-gray-800 font-bold text-base hover:bg-yellow-50 w-full justify-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              style={{ boxShadow: '0 2px 16px 0 rgba(255, 215, 0, 0.10)' }}
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" className="w-6 h-6" />
              <span className="tracking-wide">Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;