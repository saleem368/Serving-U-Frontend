import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

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
    const runAuthFlow = async () => {
      console.log("[AuthCallback] Mounted");

      const hash = window.location.hash;
      if (!hash) {
        console.warn("[AuthCallback] No hash in URL");
        return navigate('/login');
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');

      if (error) {
        console.error("[AuthCallback] OAuth error:", error);
        return navigate('/login');
      }

      if (!accessToken) {
        console.warn("[AuthCallback] No access token found");
        return navigate('/login');
      }

      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoRes.ok) throw new Error('Failed to fetch user info');
        const googleProfile = await userInfoRes.json();
        console.log("[AuthCallback] Google profile:", googleProfile);

        const localProfile = getProfileFromLocalStorage();
        const payload = {
          email: googleProfile.email,
          name: localProfile.name || googleProfile.name,
          phone: localProfile.phone,
          address: localProfile.address,
        };

        const backendRes = await fetch(`${API_BASE}/api/google-auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const backendData = await backendRes.json();
        console.log("[AuthCallback] Backend response:", backendData);

        if (!backendRes.ok || !backendData.token) {
          throw new Error(backendData.message || 'Login failed');
        }

        // Save to localStorage
        localStorage.setItem('token', backendData.token);
        localStorage.setItem('role', backendData.role);
        localStorage.setItem('userEmail', googleProfile.email);
        localStorage.setItem('userProfile', JSON.stringify({
          name: backendData.name || '',
          phone: backendData.phone || '',
          address: backendData.address || ''
        }));

        window.location.href = 'https://www.servingu.in/';
      } catch (err) {
        console.error("[AuthCallback] Error:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
        navigate('/login');
      }
    };

    runAuthFlow();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <span className="text-lg text-gray-700">Signing you in with Google...</span>
    </div>
  );
};

export default AuthCallback;
