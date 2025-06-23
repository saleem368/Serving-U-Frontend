import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE;

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
    console.log("[AuthCallback] Component mounted. Checking URL hash...");
    console.log("[AuthCallback] Current URL:", window.location.href);

    if (window.location.hash) {
      console.log("[AuthCallback] Hash found:", window.location.hash);
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');

      if (error) {
        console.error("[AuthCallback] Error from Google OAuth:", params.get('error_description') || error);
        navigate('/login');
        return;
      }

      if (accessToken) {
        console.log("[AuthCallback] Access token found. Fetching Google user info...");
        
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => {
            console.log("[AuthCallback] Google API response status:", res.status);
            if (!res.ok) {
              throw new Error(`Google API returned ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(async (googleProfile) => {
            console.log("[AuthCallback] Google profile received:", googleProfile);
            
            const localProfile = getProfileFromLocalStorage();
            console.log("[AuthCallback] Local profile:", localProfile);

            const payload = {
              email: googleProfile.email,
              name: localProfile.name || googleProfile.name,
              phone: localProfile.phone,
              address: localProfile.address
            };

            console.log("[AuthCallback] Sending to backend:", payload);
            const response = await fetch(`${API_BASE}/api/google-auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            console.log("[AuthCallback] Backend response status:", response.status);
            const responseData = await response.json();
            console.log("[AuthCallback] Backend response data:", responseData);

            if (!response.ok) {
              throw new Error(responseData.message || `Backend returned ${response.status}`);
            }

            if (!responseData.token) {
              throw new Error("Backend did not return an authentication token");
            }

            // Store authentication data
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('role', responseData.role);
            localStorage.setItem('userEmail', googleProfile.email);
            localStorage.setItem('userProfile', JSON.stringify({
              name: responseData.name || '',
              phone: responseData.phone || '',
              address: responseData.address || ''
            }));

            console.log("[AuthCallback] Authentication successful. Redirecting to servingu.in...");
            window.location.href = 'https://www.servingu.in/';
          })
          .catch((error) => {
            console.error("[AuthCallback] Error during authentication process:", error);
            localStorage.removeItem('token');
            localStorage.removeItem('userProfile');
            navigate('/login', { state: { error: error.message } });
          });
      } else {
        console.warn("[AuthCallback] No access token found in URL hash");
        navigate('/login');
      }
    } else {
      console.warn("[AuthCallback] No hash found in URL");
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
