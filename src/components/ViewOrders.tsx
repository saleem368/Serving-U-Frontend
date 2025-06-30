/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

type OrderItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  size?: string; // Add size for unstitched items
};

type Order = {
  note: any;
  _id: string;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  adminTotal?: number; // Add admin total field
  timestamp: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'delivered';
  paymentStatus?: 'Paid' | 'Cash on Delivery'; // Add paymentStatus
};

type Alteration = {
  _id: string;
  note: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'delivered';
  customer: {
    name: string;
    address: string;
    phone: string;
  };
};

const API_BASE = import.meta.env.VITE_API_BASE; 

// Accept isPage prop for page/modal rendering
const ViewOrders = ({ open = true, onClose, isPage = false }: { open?: boolean; onClose?: () => void; isPage?: boolean }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'alterations'>('orders');
  const [editingTotal, setEditingTotal] = useState<string | null>(null);
  const [tempTotal, setTempTotal] = useState<string>('');

  // Helper function to get status badge styling
  const getStatusBadgeClass = (status: string) => {
    // Normalize status to lowercase for comparison
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

  // Remove setInterval polling and add a manual refresh button
  const fetchOrdersAndAlterations = async () => {
    setLoading(true);
    try {
      const [ordersRes, alterationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`),
        fetch(`${API_BASE}/api/alterations`),
      ]);
      const ordersData: Order[] = await ordersRes.json();
      const alterationsData: Alteration[] = await alterationsRes.json();
      const filteredOrders = ordersData;
      filteredOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const filteredAlterations = alterationsData;
      filteredAlterations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setOrders(filteredOrders);
      setAlterations(filteredAlterations);
      // Debug log
      console.log('Alterations fetched:', filteredAlterations);
    } catch {
      setOrders([]);
      setAlterations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrdersAndAlterations();
    // No polling
  }, []);

  // Helper to generate short sequential order IDs like S0001, S0002, ...
  function getShortOrderId(index: number) {
    return `S${(index + 1).toString().padStart(4, '0')}`;
  }

  // For S0001 logic: sort oldest to newest for ID assignment
  const idSortedOrders: Order[] = [...orders].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  // For display: sort newest to oldest
  const sortedOrders: Order[] = [...orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const sortedAlterations: Alteration[] = [...alterations].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (!isPage && !open) return null;

  return (
    <div className={isPage ? 'min-h-screen bg-gray-50 p-2 md:p-6 flex flex-col gap-4 md:gap-8' : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn'}>
      <div className={isPage ? 'bg-white p-6 rounded-xl shadow-2xl border border-blood-red-100 max-w-2xl w-full relative mx-auto mt-8' : 'bg-white p-6 rounded-xl shadow-2xl border border-blood-red-100 max-w-2xl w-full relative'}>
        {/* Manual refresh button */}
        <button
          onClick={fetchOrdersAndAlterations}
          className="mb-4 px-4 py-2 bg-blood-red-600 text-white rounded shadow hover:bg-blood-red-700 text-sm"
        >
          Refresh Orders & Alterations
        </button>
        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-200 border-b-2 ${activeTab === 'orders' ? 'border-blood-red-600 text-blood-red-600 bg-blood-red-50' : 'border-transparent text-gray-500 bg-white hover:bg-gray-50'}`}
            onClick={() => setActiveTab('orders')}
          >
            Laundry/Readymade Orders
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-200 border-b-2 ${activeTab === 'alterations' ? 'border-blood-red-600 text-blood-red-600 bg-blood-red-50' : 'border-transparent text-gray-500 bg-white hover:bg-gray-50'}`}
            onClick={() => setActiveTab('alterations')}
          >
            Alteration Appointments
          </button>
        </div>
        <h1 className="text-2xl font-bold text-center text-blood-red-600 mb-6">View Orders & Alterations</h1>
        {loading ? (
          <p className="text-center text-gray-500">Loading orders and alterations...</p>
        ) : orders.length === 0 && alterations.length === 0 ? (
          <p className="text-center text-gray-500">No orders or alteration appointments found.</p>
        ) : (
          <div className="space-y-8">
            {/* Tab content */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold text-blood-red-600 mb-2">Laundry/Readymade Orders</h2>
                <div className="space-y-4">
                  {sortedOrders.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No orders found.</p>
                  ) : (
                    sortedOrders.map((order: Order) => {
                      // Find the index in the oldest-to-newest array for S0001 logic
                      const idIdx = idSortedOrders.findIndex(o => o._id === order._id);
                      const laundryItems = order.items.filter((item: any) => item.category && item.category !== '');
                      const unstitchedItems = order.items.filter((item: any) => !item.category || item.category === '');
                      const unstitchedTotal = unstitchedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                      return (
                        <div key={order._id} className="bg-white p-4 rounded shadow">
                          <h2 className="text-lg font-bold text-gray-800">Order ID: {getShortOrderId(idIdx)}</h2>
                          <p className="text-sm text-gray-600">
                            <strong>Customer:</strong> {order.customer.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Address:</strong> {order.customer.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Phone:</strong> {order.customer.phone}
                          </p>
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
                                      {/* Show size if present as string, or all sizes if array */}
                                      {item.size && typeof item.size === 'string' && (
                                        <span className="ml-2 inline-block bg-blood-red-50 text-blood-red-700 border border-blood-red-400 rounded px-2 py-0.5 text-xs font-bold shadow-sm">Size: {item.size}</span>
                                      )}
                                      {item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && (
                                        <span className="ml-2 inline-block bg-blood-red-50 text-blood-red-700 border border-blood-red-400 rounded px-2 py-0.5 text-xs font-bold shadow-sm">Sizes: {item.sizes.join(', ')}</span>
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
                          
                          {/* Status Update Dropdown */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold">Status:</span>
                            <select
                              value={(order.status || 'pending').toLowerCase()}
                              onChange={async (e) => {
                                const newStatus = e.target.value as Order['status'];
                                // Capitalize first letter for order status (backend expects capitalized)
                                const capitalizedStatus = (newStatus || 'pending').charAt(0).toUpperCase() + (newStatus || 'pending').slice(1) as Order['status'];
                                try {
                                  await fetch(`${API_BASE}/api/orders/${order._id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: capitalizedStatus }),
                                  });
                                  setOrders(orders => orders.map(o => o._id === order._id ? { ...o, status: capitalizedStatus } : o));
                                } catch (error) {
                                  console.error('Error updating order status:', error);
                                  alert('Failed to update order status');
                                }
                              }}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="completed">Completed</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status || 'pending')}`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                          
                          <p className="text-sm mt-1">
                            <span className="font-semibold">Payment:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus === 'Paid' ? 'Paid' : 'Cash on Delivery'}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold">Admin Total:</span>
                            {editingTotal === order._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={tempTotal}
                                  onChange={(e) => setTempTotal(e.target.value)}
                                  className="border rounded px-2 py-1 w-20 text-sm"
                                  placeholder="0"
                                />
                                <button
                                  onClick={async () => {
                                    try {
                                      console.log('Updating admin total for order:', order._id, 'to:', tempTotal);
                                      const response = await fetch(`${API_BASE}/api/orders/${order._id}/total`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ adminTotal: parseFloat(tempTotal) || null }),
                                      });
                                      
                                      if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.message || 'Failed to update admin total');
                                      }
                                      
                                      const updatedOrder = await response.json();
                                      console.log('Successfully updated order:', updatedOrder);
                                      
                                      setOrders(orders => orders.map(o => 
                                        o._id === order._id 
                                          ? { ...o, adminTotal: updatedOrder.adminTotal } 
                                          : o
                                      ));
                                      setEditingTotal(null);
                                      setTempTotal('');
                                    } catch (error) {
                                      console.error('Error updating admin total:', error);
                                      alert('Failed to update admin total: ' + (error as Error).message);
                                    }
                                  }}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTotal(null);
                                    setTempTotal('');
                                  }}
                                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-blood-red-600 font-bold">
                                  ₹{order.adminTotal ? order.adminTotal.toFixed(2) : 'Not set'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingTotal(order._id);
                                    setTempTotal(order.adminTotal ? order.adminTotal.toString() : '');
                                  }}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            {activeTab === 'alterations' && (
              <div>
                <h2 className="text-xl font-bold text-blood-red-600 mb-2">Alteration Appointments</h2>
                {sortedAlterations.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No alteration appointments found.</p>
                ) : (
                  <div className="space-y-4">
                    {sortedAlterations.map((alt: Alteration, idx: number) => {
                      const displayIdx = sortedAlterations.length - idx - 1;
                      return (
                        <div key={alt._id} className="bg-white p-4 rounded shadow border">
                          <h3 className="text-lg font-bold text-gray-800">Alteration ID: {getShortOrderId(displayIdx)}</h3>
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
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold">Status:</span>
                            <select
                              value={alt.status}
                              onChange={async (e) => {
                                const status = e.target.value as Alteration['status'];
                                await fetch(`${API_BASE}/api/alterations/${alt._id}/status`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status }),
                                });
                                setAlterations(alterations => alterations.map(a => a._id === alt._id ? { ...a, status } : a));
                              }}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="completed">Completed</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(alt.status)}`}>{alt.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOrders;
