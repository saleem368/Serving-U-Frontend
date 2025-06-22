import React, { useState } from 'react';
import { Scissors, Phone, MapPin, User, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE 

const AlterationPage = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!form.name || !form.phone) {
      setError('Please fill in your name and phone number.');
      setLoading(false);
      return;
    }
    try {
      const userEmail = localStorage.getItem('userEmail') || '';
      const res = await fetch(`${API_BASE}/api/alterations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.name,
            address: form.address,
            phone: form.phone,
            email: userEmail,
          },
          note: form.note,
        }),
      });
      if (!res.ok) throw new Error('Failed to book appointment');
      setSuccess('Alteration appointment booked! We will contact you soon.');
      setForm({ name: '', address: '', phone: '', note: '' });
    } catch {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
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
      <div className="relative w-full max-w-xl mx-auto z-10">
        {/* Main Ticket Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-red-100 relative">
          {/* Decorative Top Border */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-red-700 to-red-800" />

          {/* Ticket Body */}
          <div className="relative">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-4 md:px-8 py-6 md:py-8 text-white relative">
              <div className="relative z-10 text-center">
                <h1 className="text-3xl md:text-4xl font-black tracking-widest mb-2">SERVING U</h1>
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <p className="text-red-100 text-xs md:text-sm font-medium uppercase tracking-wide">Clothing Alterations</p>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full inline-block">
                  <p className="text-xs md:text-sm font-bold">EXPERT TAILORING SERVICES</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form className="px-4 md:px-8 py-6 md:py-8 bg-gradient-to-b from-white to-red-50" onSubmit={handleSubmit}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">Book Your Appointment</h2>
              <div className="space-y-6">
                {/* Name Field */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-red-600" />
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
                {/* Address Field */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-red-600" />
                    ADDRESS
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none font-medium"
                    placeholder="Enter your address"
                  />
                </div>
                {/* Phone Field */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-red-600" />
                    PHONE NO.
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none font-medium"
                    placeholder="Enter your phone number"
                  />
                </div>
                {/* Note Field */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-red-600" />
                    A NOTE
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none font-medium resize-none"
                    placeholder="Tell us about your alteration needs..."
                  />
                </div>
              </div>
              {/* Dashed Separator */}
              <div className="border-t-2 border-dashed border-red-200 my-8 relative">
                <div className="absolute left-0 top-0 -translate-y-1/2 -translate-x-1/2">
                  <div className="w-6 h-6 bg-white border-2 border-red-200 rounded-full shadow-lg" />
                </div>
                <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
                  <div className="w-6 h-6 bg-white border-2 border-red-200 rounded-full shadow-lg" />
                </div>
              </div>
              {/* Button Section */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-lg px-10 py-3 rounded-2xl shadow-lg uppercase tracking-wide w-full md:w-auto"
                >
                  <Scissors className="w-5 h-5 inline mr-3" />
                  {loading ? 'Booking...' : 'Book Appointment'}
                </button>
                <p className="text-gray-500 text-sm mt-4">We'll contact you within 24 hours</p>
                {success && <div className="text-green-600 text-center font-semibold mt-2">{success}</div>}
                {error && <div className="text-red-600 text-center font-semibold mt-2">{error}</div>}
              </div>
            </form>
            {/* Triangular Perforation Edges */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="relative -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-white shadow-sm" />
                </div>
              ))}
            </div>
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="relative translate-x-1/2">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-white shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlterationPage;
