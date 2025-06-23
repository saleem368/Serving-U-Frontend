import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE; // Your backend URL (e.g., https://serving-u-backend.onrender.com)
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE; // Your frontend URL (e.g., https://serving-u-frontend.vercel.app)
// Note: FRONTEND_BASE is correctly defined here but not directly used in the logic of this component
// as the redirect itself has already happened. It's important for the *initiating* component (GoogleAuth.jsx)
// and Google Cloud Console settings.

// This function is useful if you want to retrieve existing profile data
// to send along with the Google profile during the backend call.
// This allows the backend to potentially update or merge user data.
function getProfileFromLocalStorage() {
  try {
    const saved = localStorage.getItem('userProfile');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error parsing userProfile from local storage:", e);
  }
  return { name: '', phone: '', address: '' };
}

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the URL contains a hash, which is where Google puts the access token
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        // Step 1: Fetch user information from Google using the obtained access token
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch user info from Google: ${res.statusText}`);
            }
            return res.json();
          })
          .then(async (profile) => {
            // Step 2: Send the Google profile data to your backend
            // Your backend will then generate your application's JWT token
            const localProfile = getProfileFromLocalStorage(); // Get local profile to potentially merge data
            const response = await fetch(`${API_BASE}/api/google-auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: profile.email,
                name: localProfile.name || profile.name, // Prefer local name if available, else Google's
                phone: localProfile.phone, // Include phone from local storage
                address: localProfile.address // Include address from local storage
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Backend authentication failed: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();

            // Step 3: Handle the response from your backend
            if (data.token) {
              // Store the token, role, email, and full user profile from the backend
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('userEmail', profile.email); // Store the Google email
              localStorage.setItem('userProfile', JSON.stringify({
                name: data.name || '',
                phone: data.phone || '',
                address: data.address || ''
              }));

              // --- CRITICAL CHANGE FOR REDIRECTION ---
              // Redirect to your desired main website URL by performing a full page reload.
              window.location.href = 'https://www.servingu.in/';
            } else {
              // If backend did not return a token, it means auth failed on server side
              console.error('Backend did not provide a token.');
              navigate('/login'); // Redirect to login
            }
          })
          .catch((error) => {
            // Catch any errors in the fetch chain (Google API or your backend API)
            console.error('Google authentication process failed:', error);
            navigate('/login'); // Redirect to login on any error
          });
      } else {
        // If there's a hash but no access token (e.g., user cancelled Google login)
        console.warn("No access token found in URL hash.");
        navigate('/login'); // Redirect to login
      }
    } else {
      // If no hash is present, meaning this page was accessed directly or not via Google redirect
      navigate('/login'); // Redirect to login
    }
  }, [navigate]); // navigate is a dependency of useEffect

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <span className="text-lg text-gray-700">Signing you in with Google...</span>
    </div>
  );
};

export default AuthCallback;
