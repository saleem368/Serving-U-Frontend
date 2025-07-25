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
    email: string; // Add email for payment notifications
  };
  items: OrderItem[];
  total: number;
  adminTotal?: number; // Add admin total field (legacy)
  
  // Separate totals
  readymadeTotal?: number;
  laundryAdminTotal?: number;
  
  timestamp: string;
  
  // Legacy status (for backward compatibility)
  status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'delivered';
  
  // Separate statuses
  laundryStatus?: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Delivered';
  readymadeStatus?: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Delivered';
  
  // Legacy payment status
  paymentStatus?: 'Paid' | 'Cash on Delivery'; // Add paymentStatus
  
  // Separate payment statuses
  laundryPaymentStatus?: 'Paid' | 'Cash on Delivery' | 'Pending';
  readymadePaymentStatus?: 'Paid' | 'Cash on Delivery' | 'Pending';
  
  paymentId?: string; // Add payment ID for tracking
  razorpayOrderId?: string; // Razorpay order ID
  paymentUpdatedAt?: string; // When payment was updated
  
  // Separate payment IDs
  laundryPaymentId?: string;
  readymadePaymentId?: string;
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
  quantity?: number;
  shopNo?: string;
  adminTotal?: number;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  paymentId?: string;
  paymentUpdatedAt?: string;
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newPayments, setNewPayments] = useState<string[]>([]); // Track newly paid orders

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
      
      // Check for newly paid orders
      if (orders.length > 0) {
        const newlyPaid = ordersData.filter(newOrder => {
          const oldOrder = orders.find(o => o._id === newOrder._id);
          return oldOrder && oldOrder.paymentStatus !== 'Paid' && newOrder.paymentStatus === 'Paid';
        });
        
        if (newlyPaid.length > 0) {
          setNewPayments(newlyPaid.map(o => o._id));
          // Clear the notification after 5 seconds
          setTimeout(() => setNewPayments([]), 5000);
        }
      }
      
      const filteredOrders = ordersData;
      filteredOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const filteredAlterations = alterationsData;
      filteredAlterations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setOrders(filteredOrders);
      setAlterations(filteredAlterations);
      setLastRefresh(new Date());
      // Debug log
      console.log('Alterations fetched:', filteredAlterations);
      console.log('Orders with payment status:', filteredOrders.filter(o => o.paymentStatus === 'Paid'));
    } catch {
      setOrders([]);
      setAlterations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrdersAndAlterations();
    
    // Auto-refresh every 30 seconds to catch payment updates
    const interval = setInterval(() => {
      fetchOrdersAndAlterations();
    }, 30000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update order status for laundry or readymade items
  const updateOrderStatus = async (orderId: string, status: string, type: 'laundry' | 'readymade') => {
    try {
      console.log(`🔄 Updating ${type} status for order ${orderId} to ${status}`);
      
      const endpoint = type === 'laundry' 
        ? `${API_BASE}/api/orders/${orderId}/laundry-status`
        : `${API_BASE}/api/orders/${orderId}/readymade-status`;
      
      console.log(`📡 Calling endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Error response:`, errorData);
        throw new Error(errorData.message || `Failed to update ${type} status`);
      }

      const updatedOrder = await response.json();
      console.log(`✅ Order updated successfully:`, updatedOrder);

      // If status is changed to "Delivered", automatically update payment status to "Paid"
      if (status === 'Delivered') {
        console.log(`🎯 Status changed to Delivered, updating ${type} payment status to Paid`);
        
        const paymentEndpoint = type === 'laundry' 
          ? `${API_BASE}/api/orders/${orderId}/laundry-payment`
          : `${API_BASE}/api/orders/${orderId}/readymade-payment`;
        
        try {
          const paymentResponse = await fetch(paymentEndpoint, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentStatus: 'Paid',
              paymentId: `admin_manual_${Date.now()}` // Create a manual payment ID
            })
          });

          if (paymentResponse.ok) {
            console.log(`✅ ${type} payment status automatically updated to Paid`);
          } else {
            console.error(`❌ Failed to auto-update ${type} payment status`);
          }
        } catch (paymentError) {
          console.error(`❌ Error auto-updating ${type} payment status:`, paymentError);
        }
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o._id === orderId 
            ? { 
                ...o, 
                [type === 'laundry' ? 'laundryStatus' : 'readymadeStatus']: status,
                // If delivered, also update payment status in local state
                ...(status === 'Delivered' ? {
                  [type === 'laundry' ? 'laundryPaymentStatus' : 'readymadePaymentStatus']: 'Paid'
                } : {})
              }
            : o
        )
      );
      
      console.log(`✅ Local state updated for ${type} status`);
    } catch (error) {
      console.error(`❌ Error updating ${type} status:`, error);
      alert(`Failed to update ${type} status: ${(error as Error).message}`);
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={fetchOrdersAndAlterations}
            className="px-4 py-2 bg-blood-red-600 text-white rounded shadow hover:bg-blood-red-700 text-sm"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Orders & Alterations'}
          </button>
          <div className="text-right">
            <span className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            {newPayments.length > 0 && (
              <div className="text-xs text-green-600 font-semibold">
                {newPayments.length} new payment{newPayments.length > 1 ? 's' : ''} received!
              </div>
            )}
          </div>
        </div>
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
                      // Handle both old and new item structures
                      const laundryItems = order.items.filter((item: any) => 
                        (item.laundryType && item.laundryType.trim() !== '') || 
                        (item.category === 'laundry')
                      );
                      const unstitchedItems = order.items.filter((item: any) => 
                        (!item.laundryType || item.laundryType.trim() === '') && 
                        (item.category !== 'laundry')
                      );
                      const unstitchedTotal = unstitchedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                      return (
                        <div key={order._id} className={`bg-white p-4 rounded shadow ${newPayments.includes(order._id) ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                          {newPayments.includes(order._id) && (
                            <div className="mb-2 p-2 bg-green-100 border border-green-400 rounded text-green-700 text-sm font-semibold">
                              🎉 Payment received for this order!
                            </div>
                          )}
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
                            <strong>Email:</strong> {order.customer.email}
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
                          
                          {/* 🧺 LAUNDRY SECTION */}
                          {laundryItems.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🧺</span>
                                <h3 className="text-md font-bold text-blue-800">Laundry Items</h3>
                              </div>
                              
                              <ul className="space-y-2 mb-3">
                                {laundryItems.map((item: any) => (
                                  <li key={item._id} className="flex justify-between text-sm bg-white p-2 rounded border">
                                    <span>
                                      {item.name} (x{item.quantity})
                                      {item.laundryType && <span className="ml-2 text-xs text-blue-600">[{item.laundryType}]</span>}
                                    </span>
                                    <span className="text-blue-600 font-medium">Admin will set price</span>
                                  </li>
                                ))}
                              </ul>
                              
                              {/* Laundry Status */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">Status:</span>
                                <select
                                  value={order.laundryStatus || 'Pending'}
                                  onChange={(e) => updateOrderStatus(order._id, e.target.value, 'laundry')}
                                  className="text-sm border rounded px-2 py-1"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(order.laundryStatus || 'Pending')}`}>
                                  {order.laundryStatus || 'Pending'}
                                </span>
                              </div>
                              
                              {/* Laundry Admin Total */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">Admin Total:</span>
                                {editingTotal === `${order._id}-laundry` ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={tempTotal}
                                      onChange={(e) => setTempTotal(e.target.value)}
                                      className="text-sm border rounded px-2 py-1 w-24"
                                      placeholder="0"
                                      min="0"
                                      step="0.01"
                                    />
                                    <button
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(`${API_BASE}/api/orders/${order._id}/laundry-total`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ laundryAdminTotal: parseFloat(tempTotal) || 0 }),
                                          });
                                          
                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.message || 'Failed to update laundry total');
                                          }
                                          
                                          const updatedOrder = await response.json();
                                          
                                          setOrders(orders => orders.map(o => 
                                            o._id === order._id 
                                              ? { ...o, laundryAdminTotal: updatedOrder.laundryAdminTotal, adminTotal: updatedOrder.adminTotal } 
                                              : o
                                          ));
                                          setEditingTotal(null);
                                          setTempTotal('');
                                        } catch (error) {
                                          console.error('Error updating laundry total:', error);
                                          alert('Failed to update laundry total: ' + (error as Error).message);
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
                                      ₹{order.laundryAdminTotal ? order.laundryAdminTotal.toFixed(2) : 'Not set'}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingTotal(`${order._id}-laundry`);
                                        setTempTotal(order.laundryAdminTotal ? order.laundryAdminTotal.toString() : '');
                                      }}
                                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                    >
                                      {order.laundryAdminTotal ? 'Edit' : 'Set'}
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {/* Laundry Payment Status */}
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">Payment:</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  order.laundryPaymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                  order.laundryPaymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.laundryPaymentStatus || 'Pending'}
                                </span>
                                {order.laundryPaymentId && (
                                  <span className="text-xs text-gray-500">ID: {order.laundryPaymentId.substring(0, 8)}...</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* 👔 READYMADE SECTION */}
                          {unstitchedItems.length > 0 && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">👔</span>
                                <h3 className="text-md font-bold text-green-800">Readymade Items</h3>
                              </div>
                              
                              <ul className="space-y-2 mb-3">
                                {unstitchedItems.map((item: any) => (
                                  <li key={item._id} className="flex justify-between text-sm bg-white p-2 rounded border">
                                    <span>
                                      {item.name} (x{item.quantity})
                                      {item.size && typeof item.size === 'string' && (
                                        <span className="ml-2 inline-block bg-green-100 text-green-700 border border-green-400 rounded px-2 py-0.5 text-xs font-bold">Size: {item.size}</span>
                                      )}
                                      {item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && (
                                        <span className="ml-2 inline-block bg-green-100 text-green-700 border border-green-400 rounded px-2 py-0.5 text-xs font-bold">Sizes: {item.sizes.join(', ')}</span>
                                      )}
                                    </span>
                                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">Total: ₹{unstitchedTotal.toFixed(2)}</span>
                              </div>
                              
                              {/* Readymade Status */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">Status:</span>
                                <select
                                  value={order.readymadeStatus || 'Pending'}
                                  onChange={(e) => updateOrderStatus(order._id, e.target.value, 'readymade')}
                                  className="text-sm border rounded px-2 py-1"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(order.readymadeStatus || 'Pending')}`}>
                                  {order.readymadeStatus || 'Pending'}
                                </span>
                              </div>
                              
                              {/* Readymade Payment Status */}
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">Payment:</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  order.readymadePaymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                  order.readymadePaymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.readymadePaymentStatus || 'Cash on Delivery'}
                                </span>
                                {order.readymadePaymentId && (
                                  <span className="text-xs text-gray-500">ID: {order.readymadePaymentId.substring(0, 8)}...</span>
                                )}
                              </div>
                            </div>
                          )}
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
                            {alt.quantity && <p className="text-gray-600 text-sm"><strong>Quantity:</strong> {alt.quantity}</p>}
                            <p className="text-gray-600 text-sm"><strong>Shop No.:</strong> {alt.shopNo || '1'}</p>
                          </div>

                          {/* Admin Total */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold text-sm">Admin Total:</span>
                            {editingTotal === `${alt._id}-alteration` ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={tempTotal}
                                  onChange={(e) => setTempTotal(e.target.value)}
                                  className="text-sm border rounded px-2 py-1 w-24"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`${API_BASE}/api/alterations/${alt._id}/admin-total`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ adminTotal: parseFloat(tempTotal) || 0 }),
                                      });
                                      
                                      if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.message || 'Failed to update alteration total');
                                      }
                                      
                                      const updatedAlteration = await response.json();
                                      
                                      setAlterations(alterations => alterations.map(a => 
                                        a._id === alt._id 
                                          ? { ...a, adminTotal: updatedAlteration.adminTotal } 
                                          : a
                                      ));
                                      setEditingTotal(null);
                                      setTempTotal('');
                                    } catch (error) {
                                      console.error('Error updating alteration total:', error);
                                      alert('Failed to update alteration total: ' + (error as Error).message);
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
                                  ₹{alt.adminTotal ? alt.adminTotal.toFixed(2) : 'Not set'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingTotal(`${alt._id}-alteration`);
                                    setTempTotal(alt.adminTotal ? alt.adminTotal.toString() : '');
                                  }}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                >
                                  {alt.adminTotal ? 'Edit' : 'Set'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Payment Status */}
                          {alt.adminTotal && alt.adminTotal > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-semibold text-sm">Payment Status:</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                alt.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                alt.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {alt.paymentStatus || 'Pending'}
                              </span>
                              {alt.paymentId && (
                                <span className="text-xs text-gray-500">ID: {alt.paymentId}</span>
                              )}
                              {alt.paymentUpdatedAt && (
                                <span className="text-xs text-gray-500">
                                  Updated: {new Date(alt.paymentUpdatedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold">Status:</span>
                            <select
                              value={alt.status}
                              onChange={async (e) => {
                                const status = e.target.value as Alteration['status'];
                                try {
                                  const response = await fetch(`${API_BASE}/api/alterations/${alt._id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      status,
                                      // If setting to delivered, mark payment as paid if admin total is set
                                      ...(status === 'delivered' && alt.adminTotal && alt.adminTotal > 0 && alt.paymentStatus !== 'Paid' ? { paymentStatus: 'Paid' } : {})
                                    }),
                                  });
                                  
                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.message || 'Failed to update status');
                                  }

                                  const updatedAlteration = await response.json();
                                  setAlterations(alterations => alterations.map(a => 
                                    a._id === alt._id 
                                      ? { 
                                          ...a, 
                                          status: updatedAlteration.status,
                                          paymentStatus: updatedAlteration.paymentStatus || a.paymentStatus,
                                          paymentUpdatedAt: updatedAlteration.paymentUpdatedAt || a.paymentUpdatedAt
                                        } 
                                      : a
                                  ));
                                } catch (error) {
                                  console.error('Error updating alteration status:', error);
                                  alert('Failed to update alteration status: ' + (error as Error).message);
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
