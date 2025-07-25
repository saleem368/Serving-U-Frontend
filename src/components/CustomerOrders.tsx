/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE; 

const CustomerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [alterations, setAlterations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'alterations'>('orders');
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const prevStatuses = useRef<{ [id: string]: string }>({});

  // Razorpay payment handler for both orders and alterations
  const handlePayment = async (id: string, amount: number, type: 'order' | 'alteration' = 'order') => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert('Payment system not configured. Please contact support.');
      return;
    }

    setPaymentLoading(id);
    
    let isLaundryPayment = false;
    if (type === 'order') {
      // Determine if this is a laundry payment or readymade payment
      const order = orders.find((o: any) => o._id === id);
      const readymadeItems = order?.items.filter((item: any) => 
        (!item.laundryType || item.laundryType.trim() === '') && 
        (item.category !== 'laundry')
      ) || [];
      const readymadeTotal = readymadeItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      const laundryAdminTotal = order?.laundryAdminTotal !== undefined ? order?.laundryAdminTotal : order?.adminTotal;
      
      // Check if the amount matches the laundry admin total (more accurate than comparing with readymade total)
      isLaundryPayment = laundryAdminTotal !== undefined && Math.abs(amount - laundryAdminTotal) < 0.01;
    }
    
    console.log('💰 Payment details:', {
      id,
      amount,
      type,
      isLaundryPayment: type === 'order' ? isLaundryPayment : null,
      razorpayKey: razorpayKey ? 'Present' : 'Missing'
    });
    
    try {
      // Create Razorpay order
      console.log('📡 Creating Razorpay order...');
      const res = await fetch(`${API_BASE}/api/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      console.log('📡 Razorpay order response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Razorpay order creation failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create payment order');
      }
      
      const data = await res.json();
      console.log('✅ Razorpay order created:', data);
      
      // Get customer info for the order/alteration
      const order = type === 'order' ? orders.find((o: any) => o._id === id) : null;
      const alteration = type === 'alteration' ? alterations.find((a: any) => a._id === id) : null;
      
      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: type === 'order' ? 'Laundry/Readymade Suits Service' : 'Serving U - Alteration Payment',
        description: type === 'order' 
          ? `Payment for Order ${order ? getShortOrderId(idSortedOrders.findIndex((o: any) => o._id === id)) : ''}` 
          : `Payment for Alteration ${alteration ? getShortOrderId(idSortedAlterations.findIndex((a: any) => a._id === id)) : ''}`,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          console.log('🎉 Payment handler called - Payment successful!');
          console.log('💳 Payment response received:', response);
          
          // Wrap everything in try-catch to prevent silent failures
          try {
            console.log('💳 Payment completed, verifying...', response);
            
            // Verify payment on backend
            console.log('🔗 Calling verification endpoint:', `${API_BASE}/api/razorpay/verify-payment`);
            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            console.log('🔍 Payment verification response status:', verifyResponse.status);
            
            if (!verifyResponse.ok) {
              const errorText = await verifyResponse.text();
              console.error('❌ Verification failed:', errorText);
              throw new Error('Payment verification failed');
            }
            
            const verifyResult = await verifyResponse.json();
            console.log('✅ Payment verification result:', verifyResult);
            
            if (verifyResult.success) {
              // Update the appropriate payment status based on payment type
              let updateEndpoint: string;
              if (type === 'order') {
                updateEndpoint = isLaundryPayment 
                  ? `${API_BASE}/api/orders/${id}/laundry-payment`
                  : `${API_BASE}/api/orders/${id}/readymade-payment`;
              } else {
                updateEndpoint = `${API_BASE}/api/alterations/${id}/payment-status`;
              }
              
              console.log('📝 Updating payment status at:', updateEndpoint);
              
              const updateResponse = await fetch(updateEndpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  paymentStatus: 'Paid',
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                }),
              });
              
              console.log('📝 Payment status update response:', updateResponse.status);
              
              if (updateResponse.ok) {
                const updatedOrder = await updateResponse.json();
                console.log('✅ Order updated successfully:', updatedOrder);
                
                // Update local state
                if (type === 'order') {
                  setOrders(prevOrders => 
                    prevOrders.map((o: any) => 
                      o._id === id 
                        ? { 
                            ...o, 
                            [isLaundryPayment ? 'laundryPaymentStatus' : 'readymadePaymentStatus']: 'Paid' 
                          }
                        : o
                    )
                  );
                  alert(`Payment successful! Your ${isLaundryPayment ? 'laundry' : 'readymade'} items payment status has been updated.`);
                } else {
                  setAlterations(prevAlterations => 
                    prevAlterations.map((a: any) => 
                      a._id === id 
                        ? { ...a, paymentStatus: 'Paid' }
                        : a
                    )
                  );
                  alert('Payment successful! Your alteration payment status has been updated.');
                }
              } else {
                const updateErrorText = await updateResponse.text();
                console.error('❌ Order update failed:', updateErrorText);
                let updateError;
                try {
                  updateError = JSON.parse(updateErrorText);
                } catch {
                  updateError = { message: updateErrorText };
                }
                alert('Payment successful, but failed to update order status: ' + (updateError.message || 'Unknown error') + '. Please contact support with payment ID: ' + response.razorpay_payment_id);
              }
            } else {
              alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
            }
          } catch (error) {
            console.error('💥 CRITICAL: Payment verification error:', error);
            console.error('💥 Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              response: response
            });
            alert('Payment verification failed: ' + (error instanceof Error ? error.message : 'Unknown error') + '. Please contact support with payment ID: ' + response.razorpay_payment_id);
          } finally {
            console.log('🏁 Payment handler finally block executed');
            setPaymentLoading(null);
          }
        },
        prefill: {
          name: (order?.customer?.name || alteration?.customer?.name || ''),
          email: (order?.customer?.email || alteration?.customer?.email || ''),
          contact: (order?.customer?.phone || alteration?.customer?.phone || ''),
        },
        theme: { color: '#b91c1c' },
        modal: {
          ondismiss: function() {
            setPaymentLoading(null);
          }
        }
      };

      // @ts-expect-error: Razorpay is loaded globally and may not have TypeScript types
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('💥 Payment setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Failed to setup payment: ' + errorMessage + '. Please try again later.');
      setPaymentLoading(null);
    }
  };

  // Fetch orders and alterations and update only if status changes
  const fetchOrdersAndAlterations = async () => {
    setLoading(true);
    try {
      const [ordersRes, alterationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`),
        fetch(`${API_BASE}/api/alterations`),
      ]);
      const ordersData = await ordersRes.json();
      const alterationsData = await alterationsRes.json();
      
      let shouldUpdate = false;
      for (const order of ordersData) {
        if (prevStatuses.current[order._id] !== order.status) {
          shouldUpdate = true;
          break;
        }
      }
      for (const alt of alterationsData) {
        if (prevStatuses.current[alt._id] !== alt.status) {
          shouldUpdate = true;
          break;
        }
      }
      if (
        shouldUpdate ||
        orders.length !== ordersData.length ||
        alterations.length !== alterationsData.length
      ) {
        setOrders(ordersData);
        setAlterations(alterationsData);
        prevStatuses.current = {
          ...Object.fromEntries(ordersData.map((o: any) => [o._id, o.status])),
          ...Object.fromEntries(alterationsData.map((a: any) => [a._id, a.status])),
        };
      }
    } catch (error) {
      console.error('Error fetching orders and alterations:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrdersAndAlterations();
    // No auto-refresh interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current user email from localStorage
  const userEmail = localStorage.getItem('userEmail');
  // Only show orders/alterations for this user (defensive: check customer and email exist)
  const userOrders = orders.filter((order: any) => order.customer && order.customer.email && userEmail && order.customer.email.toLowerCase() === userEmail.toLowerCase());
  const userAlterations = alterations.filter((alt: any) => alt.customer && alt.customer.email && userEmail && alt.customer.email.toLowerCase() === userEmail.toLowerCase());

  // Helper function to get status badge styling (same as admin)
  const getStatusBadgeClass = (status: string) => {
    // Normalize status to lowercase for comparison to handle both cases
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Show all orders and alterations, sorted by newest first
  const visibleOrders = userOrders
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const visibleAlterations = userAlterations
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const showOrdersSection = visibleOrders.length > 0;
  const showAlterationsSection = visibleAlterations.length > 0;

  // Helper to generate short sequential order IDs like S0001, S0002, ...
  function getShortOrderId(index: number) {
    return `S${(index + 1).toString().padStart(4, '0')}`;
  }

  // For S0001 logic: sort ALL orders/alterations oldest to newest for ID assignment (same as admin)
  const idSortedOrders = [...orders].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const idSortedAlterations = [...alterations].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  // For display: sort user's orders newest to oldest
  const sortedOrders = [...userOrders].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const sortedAlterations = [...userAlterations].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="my-6">
      <button
        onClick={fetchOrdersAndAlterations}
        className="mb-4 px-4 py-2 bg-blood-red-600 text-white rounded shadow hover:bg-blood-red-700 text-sm"
      >
        Refresh Orders & Alterations
      </button>
      <div className="mb-4 flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === 'orders' ? 'border-b-2 border-blood-red-600 text-blood-red-700' : 'text-gray-500 hover:text-blood-red-600'}`}
          onClick={() => setActiveTab('orders')}
        >            Laundry/Readymade Orders
        </button>
        <button
          className={`ml-4 px-4 py-2 font-semibold focus:outline-none ${activeTab === 'alterations' ? 'border-b-2 border-blood-red-600 text-blood-red-700' : 'text-gray-500 hover:text-blood-red-600'}`}
          onClick={() => setActiveTab('alterations')}
        >
          Alteration Appointments
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : !showOrdersSection && !showAlterationsSection ? (
        <p>No orders or alteration appointments found.</p>
      ) : (
        <div className="space-y-8">
          {activeTab === 'orders' && showOrdersSection && (
            <div>
              <div className="space-y-4">
                {sortedOrders.map((order: any) => {
                  const idIdx = idSortedOrders.findIndex((o: any) => o._id === order._id);
                  // Handle both old and new item structures
                  const laundryItems = order.items.filter((item: any) => 
                    (item.laundryType && item.laundryType.trim() !== '') || 
                    (item.category === 'laundry')
                  );
                  const readymadeItems = order.items.filter((item: any) => 
                    (!item.laundryType || item.laundryType.trim() === '') && 
                    (item.category !== 'laundry')
                  );
                  const readymadeTotal = readymadeItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
                  
                  return (
                    <div key={order._id} className="bg-white p-4 rounded shadow">
                      <h2 className="text-lg font-bold text-gray-800">Order ID: {getShortOrderId(idIdx)}</h2>
                      <p className="text-sm text-gray-600">
                        <strong>Order Date:</strong> {new Date(order.timestamp).toLocaleString()}
                      </p>
                      {/* Note shown only once at the top if present */}
                      {order.note && (
                        <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <span className="font-semibold text-yellow-700">Note:</span> <span className="text-gray-800">{order.note}</span>
                        </div>
                      )}
                      
                      {/* Laundry Section */}
                      {laundryItems.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h3 className="text-md font-bold text-blue-800 mb-2">Laundry Items</h3>
                          <ul className="space-y-1">
                            {laundryItems.map((item: any) => (
                              <li key={item._id} className="flex justify-between text-sm">
                                <span>{item.name} (x{item.quantity}) - {item.laundryType}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm">Status:</span>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.laundryStatus || 'pending')}`}>
                                {order.laundryStatus || 'pending'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="font-semibold text-sm">Payment:</span>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                order.laundryPaymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.laundryPaymentStatus === 'Paid' ? 'Paid' : 
                                 (order.laundryAdminTotal !== undefined || order.adminTotal !== undefined) ? 'Admin total set - ready to pay' : 'Awaiting admin pricing'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Readymade Section */}
                      {readymadeItems.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <h3 className="text-md font-bold text-green-800 mb-2">Readymade Items</h3>
                          <ul className="space-y-1">
                            {readymadeItems.map((item: any) => (
                              <li key={item._id} className="flex justify-between text-sm items-center">
                                <span>
                                  {item.name} (x{item.quantity})
                                  {item.size && (
                                    <span className="ml-2 inline-block bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold border border-gray-300">Size: {item.size}</span>
                                  )}
                                </span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm">Total:</span>
                              <span className="font-bold text-green-800">₹{readymadeTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="font-semibold text-sm">Status:</span>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.readymadeStatus || 'pending')}`}>
                                {order.readymadeStatus || 'pending'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="font-semibold text-sm">Payment:</span>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                order.readymadePaymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.readymadePaymentStatus === 'Paid' ? 'Paid' : 'Cash on Delivery'}
                              </span>
                            </div>
                            
                            {/* Payment button for readymade items */}
                            {readymadeTotal > 0 && 
                             order.readymadePaymentStatus !== 'Paid' && 
                             order.readymadeStatus?.toLowerCase() !== 'delivered' && (
                              <button
                                onClick={() => handlePayment(order._id, readymadeTotal)}
                                disabled={paymentLoading === order._id}
                                className={`mt-2 w-full px-4 py-2 rounded text-sm font-semibold ${
                                  paymentLoading === order._id
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {paymentLoading === order._id ? 'Processing...' : 'Pay for Readymade Items'}
                              </button>
                            )}
                            {order.readymadeStatus?.toLowerCase() === 'delivered' && order.readymadePaymentStatus !== 'Paid' && (
                              <p className="mt-2 text-sm text-gray-600 italic">
                                Payment no longer available - Items have been delivered
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin total for laundry items */}
                      {laundryItems.length > 0 && (order.laundryAdminTotal !== undefined || order.adminTotal !== undefined) && (
                        (() => {
                          // Use laundryAdminTotal if available, otherwise fall back to adminTotal
                          const laundryTotal = order.laundryAdminTotal !== undefined ? order.laundryAdminTotal : order.adminTotal;
                          const displayTotal = laundryTotal !== null && laundryTotal !== undefined;
                          
                          return displayTotal && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-md font-bold text-red-600">
                                Laundry Total (set by admin): ₹{laundryTotal.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Final pricing for laundry items as determined by admin
                              </p>
                              {/* Payment button for laundry total */}
                              {order.laundryPaymentStatus !== 'Paid' && 
                               order.laundryStatus?.toLowerCase() !== 'delivered' && (
                                <button
                                  onClick={() => handlePayment(order._id, laundryTotal)}
                                  disabled={paymentLoading === order._id}
                                  className={`mt-2 w-full px-4 py-2 rounded text-sm font-semibold ${
                                    paymentLoading === order._id
                                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  }`}
                                >
                                  {paymentLoading === order._id ? 'Processing...' : `Pay ₹${laundryTotal.toFixed(2)} for Laundry`}
                                </button>
                              )}
                              {order.laundryStatus?.toLowerCase() === 'delivered' && order.laundryPaymentStatus !== 'Paid' && (
                                <p className="mt-2 text-sm text-gray-600 italic">
                                  Payment no longer available - Laundry items have been delivered
                                </p>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'alterations' && showAlterationsSection && (
            <div>
              <div className="space-y-4">
                {sortedAlterations.map((alt: any) => {
                  const idIdx = idSortedAlterations.findIndex((a: any) => a._id === alt._id);
                  return (
                    <div key={alt._id} className="bg-white p-4 rounded shadow">
                      <h2 className="text-lg font-bold text-gray-800">Alteration ID: {getShortOrderId(idIdx)}</h2>
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
                        <p className="text-gray-600 text-sm"><strong>Quantity:</strong> {alt.quantity || 1} item(s)</p>
                        <p className="text-gray-600 text-sm"><strong>Shop No.:</strong> {alt.shopNo || '1'}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="font-semibold text-sm">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(alt.status || 'pending')}`}>
                          {alt.status || 'pending'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 items-center">
                        <span className="font-semibold text-sm">Payment:</span>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          alt.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alt.paymentStatus === 'Paid' ? 'Paid' : 
                           alt.adminTotal !== undefined ? 'Admin total set - ready to pay' : 'Awaiting admin pricing'
                          }
                        </span>
                      </div>
                      
                      {/* Admin Total Display and Payment */}
                      {alt.adminTotal !== undefined && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-md font-bold text-purple-600">
                            Alteration Total (set by admin): ₹{alt.adminTotal.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Final pricing for {alt.quantity || 1} item(s) alteration as determined by admin
                          </p>
                          
                          {/* Payment Button */}
                          {alt.paymentStatus !== 'Paid' && 
                           alt.status?.toLowerCase() !== 'delivered' && (
                            <button
                              onClick={() => handlePayment(alt._id, alt.adminTotal, 'alteration')}
                              disabled={paymentLoading === alt._id}
                              className={`mt-2 w-full px-4 py-2 rounded text-sm font-semibold ${
                                paymentLoading === alt._id
                                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {paymentLoading === alt._id ? 'Processing...' : `Pay ₹${alt.adminTotal.toFixed(2)} for Alteration`}
                            </button>
                          )}
                          
                          {alt.status?.toLowerCase() === 'delivered' && alt.paymentStatus !== 'Paid' && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              Payment no longer available - Alteration has been delivered
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
