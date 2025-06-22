/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ;

const CustomerAlterations = () => {
  const [alterations, setAlterations] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchAlterations();
    const interval = setInterval(fetchAlterations, 5000);
    return () => clearInterval(interval);
  }, [alterations.length]);

  // Show all alterations, newest first
  const visibleAlterations = [...alterations].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
              </div>
              <p className="text-sm mt-2">
                <span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs ${alt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : alt.status === 'accepted' ? 'bg-green-100 text-green-700' : alt.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{alt.status || 'pending'}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAlterations;
