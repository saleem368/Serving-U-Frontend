/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { CreditCard } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ;

const CustomerAlterations = () => {
  const [alterations, setAlterations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const prevStatuses = useRef<{ [id: string]: string }>({});

  const fetchAlterations = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/alterations`);
    const data = await res.json();
    let shouldUpdate = false;
    for (const alt of data) {
      if (prevStatuses.current[alt._id] !== alt.status) {
        shouldUpdate = true;
        break;
      }
    }
    if (shouldUpdate || alterations.length !== data.length) {
      setAlterations(data);
      prevStatuses.current = Object.fromEntries(data.map((o: any) => [o._id, o.status]));
    }
    setLoading(false);
  };

  const handlePayment = async (alteration: any) => {
    if (!alteration.adminTotal || alteration.adminTotal <= 0) {
      alert('Admin has not set the price yet. Please wait for admin to set the price.');
      return;
    }

    setPaymentLoading(alteration._id);
    try {
      console.log('🎯 Starting alteration payment process for:', alteration._id);
      
      // Step 1: Create Razorpay order
      const orderRes = await fetch(`${API_BASE}/api/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: alteration.adminTotal }),
      });
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.details || 'Failed to create payment order');
      }
      
      const orderData = await orderRes.json();
      console.log('✅ Razorpay order created:', orderData);

      // Step 2: Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Serving U - Alteration Payment',
        description: `Payment for Alteration ID: ${alteration._id}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          console.log('💳 Payment completed:', response);
          
          try {
            // Step 3: Verify payment
            const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verifyData = await verifyRes.json();
            console.log('🔍 Payment verification result:', verifyData);
            
            if (verifyData.success) {
              // Step 4: Update alteration payment status
              const updateRes = await fetch(`${API_BASE}/api/alterations/${alteration._id}/payment-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentStatus: 'Paid',
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              
              if (updateRes.ok) {
                console.log('✅ Alteration payment status updated successfully');
                alert('Payment successful! Your alteration payment has been confirmed.');
                fetchAlterations(); // Refresh the alterations
              } else {
                console.error('❌ Failed to update alteration payment status');
                alert('Payment completed but failed to update status. Please contact support.');
              }
            } else {
              console.error('❌ Payment verification failed');
              alert('Payment verification failed. Please try again or contact support.');
            }
          } catch (error) {
            console.error('❌ Error in payment verification:', error);
            alert('Payment completed but verification failed. Please contact support.');
          }
        },
        prefill: {
          name: alteration.customer.name,
          email: alteration.customer.email,
          contact: alteration.customer.phone,
        },
        theme: {
          color: '#dc2626',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setPaymentLoading(null);
    }
  };

  useEffect(() => {
    fetchAlterations();
    const interval = setInterval(fetchAlterations, 5000);
    return () => clearInterval(interval);
  }, [alterations.length]);

  // Get current user email from localStorage
  const userEmail = localStorage.getItem('userEmail');
  // Only show alterations for this user (defensive: check customer and email exist)
  const userAlterations = alterations.filter((alt: any) => alt.customer && alt.customer.email && userEmail && alt.customer.email.toLowerCase() === userEmail.toLowerCase());

  // Show all alterations, newest first
  const visibleAlterations = [...userAlterations].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="my-6">
      <button
        onClick={fetchAlterations}
        className="mb-4 px-4 py-2 bg-blood-red-600 text-white rounded shadow hover:bg-blood-red-700 text-sm"
      >
        Refresh Alterations
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : visibleAlterations.length === 0 ? (
        <p>No alteration appointments found.</p>
      ) : (
        <div className="space-y-4">
          {visibleAlterations.map((alt: any) => (
            <div key={alt._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-bold text-gray-800">Alteration ID: {alt._id}</h2>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(alt.timestamp).toLocaleString()}
              </p>
              <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <span className="font-semibold text-yellow-700">Note:</span> <span className="text-gray-800">{alt.note}</span>
              </div>
              <div className="mt-2">
                <p className="text-gray-600 text-sm"><strong>Name:</strong> {alt.customer.name}</p>
                <p className="text-gray-600 text-sm"><strong>Address:</strong> {alt.customer.address}</p>
                <p className="text-gray-600 text-sm"><strong>Phone:</strong> {alt.customer.phone}</p>
                <p className="text-gray-600 text-sm"><strong>Quantity:</strong> {alt.quantity || 1}</p>
              </div>
              
              {/* Admin Total and Payment Status */}
              {alt.adminTotal && (
                <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400 rounded">
                  <p className="text-green-700 font-semibold">Admin Total: ₹{alt.adminTotal}</p>
                </div>
              )}
              
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className={`inline-block px-2 py-1 rounded text-xs ${alt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : alt.status === 'accepted' ? 'bg-green-100 text-green-700' : alt.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {alt.status || 'pending'}
                </span>
                
                {alt.adminTotal && (
                  <>
                    <span className="font-semibold ml-4">Payment:</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${alt.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : alt.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {alt.paymentStatus || 'Pending'}
                    </span>
                  </>
                )}
              </div>
              
              {/* Payment Button */}
              {alt.adminTotal && alt.paymentStatus !== 'Paid' && (
                <div className="mt-3">
                  <button
                    onClick={() => handlePayment(alt)}
                    disabled={paymentLoading === alt._id}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    {paymentLoading === alt._id ? 'Processing...' : `Pay Online ₹${alt.adminTotal}`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAlterations;
