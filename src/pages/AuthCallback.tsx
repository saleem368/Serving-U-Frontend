import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE;

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        // Fetch user info from Google
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then(async (profile) => {
            // Send to backend for JWT
            const response = await fetch(`${API_BASE}/api/google-auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: profile.email, name: profile.name }),
            });
            const data = await response.json();
            if (data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('userEmail', profile.email);
              navigate('/');
            } else {
              navigate('/login');
            }
          });
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <span className="text-lg text-gray-700">Signing you in with Google...</span>
    </div>
  );
};

export default AuthCallback;
