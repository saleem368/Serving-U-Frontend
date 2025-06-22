import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function getInitials(email: string) {
  if (!email) return '';
  return email.slice(0, 2).toUpperCase();
}

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      fetch(`${API_BASE}/api/auth/profile?email=${encodeURIComponent(email)}`)
        .then(async res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          const data = await res.json();
          setProfile({ ...data, email });
        })
        .catch(() => {
          setProfile({ name: '', phone: '', address: '', email });
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 relative overflow-hidden">
      <div className="premium-bg" />
      <div className="relative z-10 w-full max-w-md bg-white bg-opacity-90 rounded-xl shadow-xl p-8 md:p-12 border border-gray-200 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white bg-gradient-to-br from-yellow-400 via-yellow-500 to-blood-red-600 shadow-lg border-4 border-yellow-300 relative">
            <span>{getInitials(profile.email)}</span>
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full shadow-lg animate-pulse border-2 border-white" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-blood-red-600 mb-2 tracking-tight text-center">My Profile</h1>
        <div className="w-full flex flex-col gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email (login)</label>
            <input type="email" value={profile.email} disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input type="text" value={profile.name} disabled className="w-full p-2 border rounded bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Phone</label>
            <input type="text" value={profile.phone} disabled className="w-full p-2 border rounded bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Address</label>
            <input type="text" value={profile.address} disabled className="w-full p-2 border rounded bg-gray-50" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-full bg-yellow-400 text-blood-red-800 py-2 rounded text-base font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" /></svg>
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-blood-red-600 text-white py-2 rounded text-base font-bold hover:bg-blood-red-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
            Logout
          </button>
        </div>
        {success && <div className="text-green-600 text-center font-semibold mt-2">{success}</div>}
      </div>
    </div>
  );
};

export default Profile;
