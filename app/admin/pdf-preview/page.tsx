'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  departure: {
    airport: string;
    city: string;
    country: string;
    time: string;
  } | null;
  arrival: {
    airport: string;
    city: string;
    country: string;
    time: string;
  } | null;
  flightNumber: string | null;
  price: string;
  currency: string;
  status: string;
}

export default function PDFPreviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Fetch orders on component mount
  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings?limit=50');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        if (data.orders.length > 0) {
          setSelectedOrderId(data.orders[0].id);
        }
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = selectedOrderId ? `/api/pdf-preview?orderId=${selectedOrderId}` : '';

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Ticket Preview</h1>

        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Preview Settings</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Order
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {orders.length === 0 ? (
                  <option value="">No orders available</option>
                ) : (
                  orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.bookingReference || 'N/A'} - {order.customerName} - {order.departure?.airport || 'N/A'} → {order.arrival?.airport || 'N/A'} - {order.price} {order.currency}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedOrderId && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Selected Order Details:</h3>
                {(() => {
                  const selectedOrder = orders.find(o => o.id === selectedOrderId);
                  if (!selectedOrder) return <p>Order not found</p>;

                  return (
                    <div className="text-sm space-y-1">
                      <p><strong>Booking Reference:</strong> {selectedOrder.bookingReference || 'N/A'}</p>
                      <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
                      <p><strong>Flight:</strong> {selectedOrder.flightNumber || 'N/A'}</p>
                      <p><strong>Route:</strong> {selectedOrder.departure?.airport || 'N/A'} → {selectedOrder.arrival?.airport || 'N/A'}</p>
                      <p><strong>Price:</strong> {selectedOrder.price} {selectedOrder.currency}</p>
                      <p><strong>Status:</strong> {selectedOrder.status}</p>
                      <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {selectedOrderId && orders.length > 0 && (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="bg-muted px-6 py-3 border-b">
              <h2 className="text-lg font-semibold">
                PDF Preview - Flight Ticket
              </h2>
            </div>

            <div className="p-6">
              <iframe
                src={previewUrl}
                className="w-full h-96 border rounded-md"
                title="PDF Preview"
                key={previewUrl}
              />
            </div>

            <div className="px-6 pb-6 flex gap-4">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Open Preview in New Tab
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              <a
                href={`/api/pdf-download/${selectedOrderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Download PDF
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        )}

        {orders.length === 0 && !loading && (
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">No orders found to preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}