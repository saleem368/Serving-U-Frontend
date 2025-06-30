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

  // Razorpay payment handler
  const handlePayment = async (orderId: string, amount: number) => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert('Payment system not configured. Please contact support.');
      return;
    }

    setPaymentLoading(orderId);
    
    try {
      // Create Razorpay order
      const res = await fetch(`${API_BASE}/api/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }
      
      const data = await res.json();
      
      // Get customer info for the order
      const order = orders.find((o: any) => o._id === orderId);
      
      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: 'Laundry/Readymade Suits Service',
        description: `Payment for Order ${order ? getShortOrderId(idSortedOrders.findIndex((o: any) => o._id === orderId)) : ''}`,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.success) {
              // Update order payment status with complete transaction details
              const updateResponse = await fetch(`${API_BASE}/api/orders/${orderId}/payment`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  paymentStatus: 'Paid',
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                }),
              });
              
              if (updateResponse.ok) {
                // Update local state
                setOrders(prevOrders => 
                  prevOrders.map((o: any) => 
                    o._id === orderId 
                      ? { ...o, paymentStatus: 'Paid' }
                      : o
                  )
                );
                alert('Payment successful! Your order payment status has been updated.');
              } else {
                alert('Payment successful, but failed to update order status. Please contact support.');
              }
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setPaymentLoading(null);
          }
        },
        prefill: {
          name: order?.customer?.name || '',
          email: order?.customer?.email || '',
          contact: order?.customer?.phone || '',
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
      console.error('Payment setup error:', error);
      alert('Failed to setup payment. Please try again later.');
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
      
      console.log('Fetched orders data:', ordersData);
      console.log('Orders with adminTotal:', ordersData.filter((order: any) => order.adminTotal));
      
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

  // For S0001 logic: sort oldest to newest for ID assignment
  const idSortedOrders = [...userOrders].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const idSortedAlterations = [...userAlterations].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  // For display: sort newest to oldest
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
                  const laundryItems = order.items.filter((item: any) => item.category && item.category !== '');
                  const unstitchedItems = order.items.filter((item: any) => !item.category || item.category === '');
                  const unstitchedTotal = unstitchedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
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
                      <div className="mt-2">
                        <h3 className="text-md font-bold text-gray-800">Laundry Items :</h3>
                        {laundryItems.length > 0 ? (
                          <ul className="space-y-2">
                            {laundryItems.map((item: any) => (
                              <li key={item._id} className="flex justify-between text-sm">
                                <span>{item.name} (x{item.quantity})</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No laundry items in this order.</p>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="text-md font-bold text-gray-800">Readymade Items:</h3>
                        {unstitchedItems.length > 0 ? (
                          <ul className="space-y-2">
                            {unstitchedItems.map((item: any) => (
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
                        ) : (
                          <p className="text-gray-400 text-sm italic">No readymade items in this order.</p>
                        )}
                      </div>
                      <p className="text-md font-bold text-gray-800 mt-2">Total: ₹{unstitchedTotal.toFixed(2)}</p>
                      {order.adminTotal && (
                        <div className="mt-1">
                          <p className="text-md font-bold text-blood-red-600">
                            Final Total: ₹{order.adminTotal.toFixed(2)}
                          </p>
                          {order.paymentStatus !== 'Paid' && 
                           order.status?.toLowerCase() !== 'delivered' && (
                            <button
                              onClick={() => handlePayment(order._id, order.adminTotal)}
                              disabled={paymentLoading === order._id}
                              className={`mt-2 px-4 py-2 rounded text-sm font-semibold ${
                                paymentLoading === order._id
                                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                  : 'bg-blood-red-600 text-white hover:bg-blood-red-700'
                              }`}
                            >
                              {paymentLoading === order._id ? 'Processing...' : 'Pay Online'}
                            </button>
                          )}
                          {order.status?.toLowerCase() === 'delivered' && order.paymentStatus !== 'Paid' && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              Payment no longer available - Order has been delivered
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status || 'pending')}`}>{order.status || 'pending'}</span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Payment:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus === 'Paid' ? 'Paid' : 'Cash on Delivery'}</span>
                      </p>
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
                      </div>
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(alt.status || 'pending')}`}>{alt.status || 'pending'}</span>
                      </p>
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
