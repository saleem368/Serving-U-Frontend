import React from 'react';

// Use public asset path for Vite static files
const TermsAndConditions = () => (
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
        <h1 className="text-3xl md:text-4xl font-extrabold text-blood-red-600 mb-2 tracking-tight text-center">Terms & Conditions</h1>
        <p className="text-gray-600 text-center max-w-xl">Please read these terms and conditions carefully before using our services. By accessing or using our platform, you agree to be bound by these terms.</p>
      </div>
      <div className="space-y-6 text-gray-800 text-base md:text-lg">
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using Serving U’s laundry and alteration services, you agree to comply with and be legally bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">2. Service Description</h2>
          <p>We provide premium laundry and clothing alteration services. All orders are subject to acceptance and availability. We reserve the right to refuse service at our discretion.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">3. User Responsibilities</h2>
          <ul className="list-disc pl-6">
            <li>Provide accurate and complete information during registration and order placement.</li>
            <li>Ensure garments are suitable for the requested service. We are not responsible for damage due to inherent garment defects.</li>
            <li>Collect your items within the agreed timeframe. Uncollected items may be disposed of after 60 days.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">4. Payment & Pricing</h2>
          <p>All prices are subject to change. Payment must be made in full before or at the time of delivery. We accept online payments via secure gateways.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">5. Liability</h2>
          <p>While we take utmost care, Serving U is not liable for loss or damage caused by events beyond our control, including but not limited to fire, theft, or natural disasters. Compensation for lost or damaged items is limited to 5 times the service charge for the item.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">6. Prohibited Items</h2>
          <p>We do not accept items containing hazardous materials, excessive soiling, or items prohibited by law.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">7. Amendments</h2>
          <p>We reserve the right to update these Terms & Conditions at any time. Continued use of our services constitutes acceptance of the revised terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-blood-red-600 mb-2">8. Contact</h2>
          <p>For any questions regarding these Terms & Conditions, please contact us at <a href="mailto:saleem152000@gmail.com" className="text-blood-red-600 underline">saleem152000@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;
