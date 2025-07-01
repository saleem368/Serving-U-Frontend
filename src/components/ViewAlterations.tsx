import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ;

type Alteration = {
  _id: string;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  note: string;
  quantity?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'delivered';
  adminTotal?: number;
  paymentStatus?: 'Paid' | 'Cash on Delivery' | 'Pending';
  timestamp: string;
};

const ViewAlterations = ({ open = true, onClose, isPage = false }: { open?: boolean; onClose?: () => void; isPage?: boolean }) => {
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminTotals, setAdminTotals] = useState<{ [id: string]: string }>({});

  const updateAdminTotal = async (alterationId: string, adminTotal: number) => {
    try {
      console.log('📝 Updating admin total for alteration:', { alterationId, adminTotal });
      const response = await fetch(`${API_BASE}/api/alterations/${alterationId}/admin-total`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminTotal }),
      });
      
      if (response.ok) {
        const updatedAlteration = await response.json();
        console.log('✅ Admin total updated successfully:', updatedAlteration);
        
        // Update local state
        setAlterations(prev => 
          prev.map(alt => 
            alt._id === alterationId 
              ? { ...alt, adminTotal } 
              : alt
          )
        );
        
        // Clear the input
        setAdminTotals(prev => ({ ...prev, [alterationId]: '' }));
        alert('Admin total updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update admin total:', errorData);
        alert('Failed to update admin total: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error updating admin total:', error);
      alert('Error updating admin total. Please try again.');
    }
  };

  const updateStatus = async (alterationId: string, status: string) => {
    try {
      console.log('📝 Updating alteration status:', { alterationId, status });
      const response = await fetch(`${API_BASE}/api/alterations/${alterationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        const updatedAlteration = await response.json();
        console.log('✅ Alteration status updated successfully:', updatedAlteration);
        
        // Update local state
        setAlterations(prev => 
          prev.map(alt => 
            alt._id === alterationId 
              ? { ...alt, status: status as Alteration['status'], paymentStatus: updatedAlteration.paymentStatus } 
              : alt
          )
        );
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update status:', errorData);
        alert('Failed to update status: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAlterations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/alterations`);
        const data: Alteration[] = await response.json();
        // Sort by newest first
        data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAlterations(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Failed to fetch alterations:', error);
      }
    };
    fetchAlterations();
    const interval = setInterval(fetchAlterations, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isPage && !open) return null;

  return (
    <div className={isPage ? 'min-h-screen bg-gray-50 p-2 md:p-6 flex flex-col gap-4 md:gap-8' : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn'}>
      <div className={isPage ? 'bg-white p-6 rounded-xl shadow-2xl border border-blood-red-100 max-w-2xl w-full relative mx-auto mt-8' : 'bg-white p-6 rounded-xl shadow-2xl border border-blood-red-100 max-w-2xl w-full relative'}>
        {!isPage && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        )}
        <h2 className="text-2xl font-bold mb-4 text-blood-red-600">Alteration Appointments</h2>
        {loading ? (
          <p>Loading...</p>
        ) : alterations.length === 0 ? (
          <p>No alteration appointments found.</p>
        ) : (
          <div className="space-y-4">
            {alterations.map((alt) => (
              <div key={alt._id} className="bg-white p-4 rounded shadow border">
                <h3 className="text-lg font-bold text-gray-800">Alteration ID: {alt._id}</h3>
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
                </div>
                
                {/* Admin Total Section */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Admin Pricing</h4>
                  {alt.adminTotal ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Current Total: ₹{alt.adminTotal.toFixed(2)}</span>
                      <button
                        onClick={() => {
                          const newTotal = prompt('Enter new admin total:', alt.adminTotal?.toString());
                          if (newTotal && !isNaN(Number(newTotal)) && Number(newTotal) > 0) {
                            updateAdminTotal(alt._id, Number(newTotal));
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Enter total amount"
                        value={adminTotals[alt._id] || ''}
                        onChange={(e) => setAdminTotals(prev => ({ ...prev, [alt._id]: e.target.value }))}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => {
                          const amount = Number(adminTotals[alt._id]);
                          if (amount > 0) {
                            updateAdminTotal(alt._id, amount);
                          } else {
                            alert('Please enter a valid amount greater than 0');
                          }
                        }}
                        disabled={!adminTotals[alt._id] || Number(adminTotals[alt._id]) <= 0}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Set Total
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <select
                      value={alt.status}
                      onChange={(e) => updateStatus(alt._id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      alt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      alt.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                      alt.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      alt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {alt.status}
                    </span>
                  </div>
                  
                  {alt.adminTotal && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Payment:</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        alt.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 
                        alt.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alt.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAlterations;
