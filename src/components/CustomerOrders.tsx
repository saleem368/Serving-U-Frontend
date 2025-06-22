/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE; 

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [alterations, setAlterations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'alterations'>('orders');
  const prevStatuses = useRef<{ [id: string]: string }>({});

  // Fetch orders and alterations and update only if status changes
  const fetchOrdersAndAlterations = async () => {
    setLoading(true);
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
        >
          Laundry/Unstitched Orders
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
                        <h3 className="text-md font-bold text-gray-800">Unstitched Items:</h3>
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
                          <p className="text-gray-400 text-sm italic">No unstitched items in this order.</p>
                        )}
                      </div>
                      <p className="text-md font-bold text-gray-800 mt-2">Total: ₹{unstitchedTotal.toFixed(2)}</p>
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'accepted' ? 'bg-green-100 text-green-700' : order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{order.status || 'pending'}</span>
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
                        <span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${alt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : alt.status === 'accepted' ? 'bg-green-100 text-green-700' : alt.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{alt.status || 'pending'}</span>
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
