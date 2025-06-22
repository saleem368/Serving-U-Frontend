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
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  timestamp: string;
};

const ViewAlterations = ({ open = true, onClose, isPage = false }: { open?: boolean; onClose?: () => void; isPage?: boolean }) => {
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [loading, setLoading] = useState(true);

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
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold">Status:</span>
                  <select
                    value={alt.status}
                    onChange={async (e) => {
                      const status = e.target.value;
                      await fetch(`${API_BASE}/api/alterations/${alt._id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status }),
                      });
                    }}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${alt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : alt.status === 'accepted' ? 'bg-green-100 text-green-700' : alt.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{alt.status}</span>
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
