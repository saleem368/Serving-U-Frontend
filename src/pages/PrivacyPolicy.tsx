import React from 'react';

// Use public asset path for Vite static files
const PrivacyPolicy = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 relative overflow-hidden">
    <div className="premium-bg">
      {/* Gold grid background lines (same as Login/Register/Alteration) */}
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
    <div className="relative z-10 w-full max-w-2xl bg-white bg-opacity-90 rounded-xl shadow-xl p-8 md:p-12 border border-gray-200">
      <div className="flex flex-col items-center mb-8">
        <img src="/assets/images/222.png" alt="Logo" className="mb-4" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blood-red-600 mb-2 tracking-tight text-center">Privacy Policy</h1>
        <p className="text-gray-600 text-center max-w-xl">Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our services.</p>
      </div>
      <div className="space-y-6 text-gray-800 text-base md:text-lg">
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">1. Information We Collect</h2>
          <ul className="list-disc pl-6">
            <li>Personal details (name, address, email, phone) provided during registration or order placement.</li>
            <li>Order and transaction details.</li>
            <li>Usage data, such as device information and IP address.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6">
            <li>To process orders and provide requested services.</li>
            <li>To communicate with you about your orders, updates, and promotions.</li>
            <li>To improve our services and user experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is 100% secure.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">4. Sharing of Information</h2>
          <p>We do not sell or rent your personal information. We may share your data with trusted partners for service delivery, payment processing, or legal compliance, always ensuring your privacy is protected.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">5. Cookies & Tracking</h2>
          <p>We use cookies and similar technologies to enhance your experience and analyze usage. You can control cookies through your browser settings.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">6. Your Rights</h2>
          <ul className="list-disc pl-6">
            <li>Access, update, or delete your personal information by contacting us.</li>
            <li>Opt out of marketing communications at any time.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We encourage you to review it regularly. Continued use of our services constitutes acceptance of the updated policy.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">8. Contact</h2>
          <p>For privacy-related questions, contact us at <a href="mailto:saleem152000@gmail.com" className="text-blood-red-600 underline">saleem152000@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
