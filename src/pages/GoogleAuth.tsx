/* eslint-disable no-empty */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE;

const CLIENT_ID = '650768241119-4tjf6br1okb16f056ordvleoolkiaggg.apps.googleusercontent.com';
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
    const handleOAuthRedirect = async () => {
      if (window.location.hash) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');

        if (accessToken) {
          try {
            // Step 1: Fetch Google user profile
            const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const profile = await res.json();

            // Step 2: Send to backend
            const localProfile = getProfileFromLocalStorage();
            const payload = {
              email: profile.email,
              name: localProfile.name || profile.name,
              phone: localProfile.phone,
              address: localProfile.address,
            };

            const backendRes = await fetch(`${API_BASE}/api/google-auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const data = await backendRes.json();

            if (data.token) {
              // Step 3: Store auth details and redirect
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('userEmail', profile.email);
              localStorage.setItem('userProfile', JSON.stringify({
                name: data.name || '',
                phone: data.phone || '',
                address: data.address || ''
              }));

              navigate('/');
            } else {
              throw new Error('Backend did not return a valid token.');
            }
          } catch (err) {
            console.error('[GoogleAuth] Error during OAuth flow:', err);
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      }
    };

    handleOAuthRedirect();
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
        {/* Grid background (optional visual effect) */}
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="premium-bg-graph-line premium-bg-graph-vertical" style={{ left: `${(i + 1) * 10}%` }} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="premium-bg-graph-line premium-bg-graph-horizontal" style={{ top: `${(i + 1) * 10}%` }} />
        ))}
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
