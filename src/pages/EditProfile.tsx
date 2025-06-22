/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE; 

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const draft = localStorage.getItem('editProfileDraft');
    if (draft) {
      setProfile({ ...JSON.parse(draft), email });
      return;
    }
    if (email) {
      fetch(`${API_BASE}/api/auth/profile?email=${encodeURIComponent(email)}`)
        .then(async res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          const data = await res.json();
          setProfile({ ...data, email });
          localStorage.setItem('userProfile', JSON.stringify({
            name: data.name,
            phone: data.phone,
            address: data.address,
          }));
        })
        .catch(() => {
          const saved = localStorage.getItem('userProfile');
          setProfile(saved ? { ...JSON.parse(saved), email } : { name: '', phone: '', address: '', email });
        });
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (profile.name || profile.phone || profile.address) {
      localStorage.setItem('editProfileDraft', JSON.stringify(profile));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save to backend
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      localStorage.setItem('userProfile', JSON.stringify({
        name: data.name,
        phone: data.phone,
        address: data.address,
      }));
      localStorage.removeItem('editProfileDraft'); // Remove draft after save
      setSuccess('Profile updated!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setSuccess('Error updating profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Premium animated gold graph/grid background - just behind the form, above white bg */}
        <div className="absolute inset-0 premium-bg pointer-events-none" style={{ zIndex: 1 }}>
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
        <div className="relative z-20 w-full max-w-md bg-white bg-opacity-90 rounded-xl shadow-xl p-8 md:p-12 border border-gray-200 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-blood-red-600 mb-6 tracking-tight text-center">Edit Profile</h1>
          <form onSubmit={handleSave} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email (login)</label>
              <input type="email" value={profile.email} disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Phone</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Address</label>
              <input type="text" name="address" value={profile.address} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <button type="submit" className="w-full bg-blood-red-600 text-white py-2 rounded text-base font-bold hover:bg-blood-red-700 transition">Save</button>
            {success && <div className="text-green-600 text-center font-semibold mt-2">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
