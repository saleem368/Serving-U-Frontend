/* eslint-disable no-empty */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE; // Make sure this is set in your .env and Vercel env variables

const CLIENT_ID = '650768241119-4tjf6br1okb16f056ordvleoolkiaggg.apps.googleusercontent.com';
// Correct usage of FRONTEND_BASE here:
const REDIRECT_URI = `${FRONTEND_BASE}/auth/callback`;
const SCOPE = 'profile email';
const RESPONSE_TYPE = 'token';

function getProfileFromLocalStorage() {
  try {
    const saved = localStorage.getItem('userProfile');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: '', phone: '', address: '' };
}

const GoogleAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch Google user info');
            return res.json();
          })
          .then(async (profile) => {
            const localProfile = getProfileFromLocalStorage();
            const response = await fetch(`${API_BASE}/api/google-auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: profile.email,
                name: localProfile.name || profile.name,
                phone: localProfile.phone,
                address: localProfile.address,
              }),
            });

            const data = await response.json();

            if (data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('userEmail', profile.email);
              localStorage.setItem(
                'userProfile',
                JSON.stringify({
                  name: data.name || '',
                  phone: data.phone || '',
                  address: data.address || '',
                }),
              );
              navigate('/');
            } else {
              console.error('Backend did not return a token:', data.message);
              navigate('/login');
            }
          })
          .catch((error) => {
            console.error('Error during Google user info fetch or backend communication:', error);
            navigate('/login');
          });
      } else {
        navigate('/login');
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=${RESPONSE_TYPE}` +
      `&scope=${encodeURIComponent(SCOPE)}` +
      `&prompt=select_account`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 relative overflow-hidden">
      <div className="premium-bg">
        {/* Gold grid background lines */}
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '10%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '20%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '30%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '40%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '50%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '60%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '70%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '80%' }} />
        <div className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: '90%' }} />
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
      <div className="relative z-10 w-full max-w-md bg-white bg-opacity-90 rounded-xl shadow-xl p-8 md:p-12 border border-gray-200 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blood-red-600 mb-6 tracking-tight text-center">
          Sign in with Google
        </h1>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg transition-all text-gray-700 font-semibold text-lg hover:bg-gray-50"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google Logo"
            className="w-6 h-6"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default GoogleAuth;
