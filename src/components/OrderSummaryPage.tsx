/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

interface OrderSummaryPageProps {
  order: any;
  onBack: () => void;
  onPlaceOrder: (paymentMethod: 'cod' | 'razorpay') => void;
}

const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({ order, onBack, onPlaceOrder }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if order has laundry items and calculate totals
  // Handle both new laundryType field and old category field for backward compatibility
  const laundryItems = order.items.filter((item: any) => 
    (item.laundryType && item.laundryType.trim() !== '') || 
    (item.category === 'laundry')
  );
  const readymadeItems = order.items.filter((item: any) => 
    (!item.laundryType || item.laundryType.trim() === '') && 
    (item.category !== 'laundry')
  );
  const hasLaundry = laundryItems.length > 0;
  const hasReadymade = readymadeItems.length > 0;
  const readymadeTotal = readymadeItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
  const hasMixedCart = hasLaundry && hasReadymade;
  
  // Payment logic:
  // - Only readymade items: can pay online for full amount
  // - Only laundry items: can't pay online (admin sets price)
  // - Mixed cart: can pay online for readymade items only, laundry to be paid later
  const canPayOnline = (hasReadymade && readymadeTotal > 0) || (!hasLaundry && order.total > 0);

  const handleOnlinePaymentClick = () => {
    if (!canPayOnline) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    } else {
      setPaymentMethod('razorpay');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blood-red-600">Order Summary</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="mb-2">
            {order.items.map((item: any) => (
              <li key={item._id} className="flex justify-between text-sm mb-1">
                <span>
                  {item.name} (x{item.quantity}) 
                  {item.size && <span className="ml-1 text-xs text-blood-red-600">[{item.size}]</span>}
                  {(item.laundryType || item.category === 'laundry') && (
                    <span className="ml-1 text-xs text-gray-500">
                      [{item.laundryType || 'Laundry'}]
                    </span>
                  )}
                </span>
                <span>
                  {(item.laundryType || item.category === 'laundry') ? 
                    <span className="text-blood-red-600 text-xs">Admin will set price</span> : 
                    `₹${(item.price * item.quantity).toFixed(2)}`
                  }
                </span>
              </li>
            ))}
          </ul>
          
          {/* Display totals based on item types */}
          <div className="space-y-1">
            {readymadeItems.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Readymade Items Total:</span>
                <span>₹{readymadeTotal.toFixed(2)}</span>
              </div>
            )}
            {laundryItems.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Laundry Items ({laundryItems.length}):</span>
                <span className="text-blood-red-600 font-medium">Admin will set total</span>
              </div>
            )}
            {hasReadymade && !hasLaundry && (
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            )}
            {hasMixedCart && (
              <div className="space-y-1 mt-2 p-2 bg-blue-50 rounded border">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total for Readymade Items:</span>
                  <span>₹{readymadeTotal.toFixed(2)}</span>
                </div>
                <div className="text-xs text-blue-600">
                  💡 You can pay for readymade items now. Laundry items will be available for payment after admin review.
                </div>
              </div>
            )}
            {hasLaundry && !hasReadymade && (
              <div className="text-xs text-gray-600 mt-2 p-2 bg-yellow-50 rounded border">
                📝 Note: Final amount for laundry items will be determined by admin after reviewing your items. You can pay online once the admin sets the final amount.
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Customer Info:</h3>
          <div className="text-sm text-gray-700">
            <div><b>Name:</b> {order.customer.name}</div>
            <div><b>Address:</b> {order.customer.address}</div>
            <div><b>Phone:</b> {order.customer.phone}</div>
          </div>
        </div>
        <div className="mb-4 relative">
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="payment" 
                value="cod" 
                checked={paymentMethod === 'cod'} 
                onChange={() => setPaymentMethod('cod')} 
              />
              Cash on Delivery
            </label>
            <div className="relative">
              <label 
                className={`flex items-center gap-2 ${canPayOnline ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onClick={!canPayOnline ? handleOnlinePaymentClick : undefined}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="razorpay" 
                  checked={paymentMethod === 'razorpay'} 
                  onChange={() => canPayOnline && setPaymentMethod('razorpay')}
                  disabled={!canPayOnline}
                />
                {hasMixedCart 
                  ? `Pay Online (₹${readymadeTotal.toFixed(2)} for readymade items)`
                  : 'Pay Online'
                }
              </label>
              {showTooltip && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-black text-white text-xs rounded shadow-lg z-10 w-64">
                  {hasLaundry && !hasReadymade
                    ? "Online payment is not available for laundry-only orders. Admin will set the final price after review."
                    : "Online payment is not available when total is ₹0."
                  }
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
          <button 
            onClick={() => onPlaceOrder(paymentMethod)} 
            className={`px-4 py-2 rounded transition-colors ${
              paymentMethod === 'razorpay' && !canPayOnline
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blood-red-600 text-white hover:bg-blood-red-700'
            }`}
            disabled={paymentMethod === 'razorpay' && !canPayOnline}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
