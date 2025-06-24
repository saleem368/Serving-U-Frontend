/* eslint-disable no-empty */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
// Make sure to set VITE_FRONTEND_BASE in your Vercel environment variables
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE; 

const CLIENT_ID = '650768241119-4tjf6br1okb16f056ordvleoolkiaggg.apps.googleusercontent.com';
// This REDIRECT_URI is critical: It must exactly match one of the Authorized Redirect URIs
// configured in your Google Cloud Console for your OAuth 2.0 Client ID.
const REDIRECT_URI = `${VITE_FRONTEND_BASE}/auth/callback`; 
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

  // This useEffect block handles the OAuth callback when the component mounts
  // if the URL contains a hash with an access token (which Google provides).
  // This means this component needs to be rendered when Google redirects back
  // to the REDIRECT_URI.
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        // Fetch user info from Google using the obtained access token
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then(async (profile) => {
            // After getting Google profile, send it to your backend for JWT generation
            const localProfile = getProfileFromLocalStorage();
            const response = await fetch(`${API_BASE}/api/google-auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: profile.email, 
                name: localProfile.name || profile.name, // Prefer existing name, fallback to Google's
                phone: localProfile.phone, 
                address: localProfile.address 
              }),
            });
            const data = await response.json();
            if (data.token) {
              // Store authentication details and navigate home
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
              // Handle backend auth failure if no token is returned
              console.error('Backend did not return a token:', data.message);
              navigate('/login'); // Redirect to login on backend auth failure
            }
          })
          .catch(error => {
            console.error('Error during Google user info fetch or backend communication:', error);
            navigate('/login'); // Redirect to login on error during fetch/post
          });
      } else {
        // If there's a hash but no access token (e.g., user denied access)
        navigate('/login');
      }
    }
  }, [navigate]); // navigate is a dependency, so useEffect re-runs if navigate object changes (unlikely)

  const handleLogin = () => {
    // Construct the Google OAuth URL for initiating the login process
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` + // Uses the FRONTEND_BASE for the redirect
      `&response_type=${RESPONSE_TYPE}` +
      `&scope=${encodeURIComponent(SCOPE)}` +
      `&prompt=select_account`; // Forces Google account selection
    
    // Redirect the user's browser to Google's authentication page
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
        <h1 className="text-2xl md:text-3xl font-extrabold text-blood-red-600 mb-6 tracking-tight text-center">Sign in with Google</h1>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg transition-all text-gray-700 font-semibold text-lg hover:bg-gray-50"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" className="w-6 h-6" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default GoogleAuth;
