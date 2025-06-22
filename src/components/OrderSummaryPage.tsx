/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

interface OrderSummaryPageProps {
  order: any;
  onBack: () => void;
  onPlaceOrder: (paymentMethod: 'cod' | 'razorpay') => void;
}

const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({ order, onBack, onPlaceOrder }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blood-red-600">Order Summary</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="mb-2">
            {order.items.map((item: any) => (
              <li key={item._id} className="flex justify-between text-sm mb-1">
                <span>{item.name} (x{item.quantity}) {item.size && <span className="ml-1 text-xs text-blood-red-600">[{item.size}]</span>}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{order.total.toFixed(2)}</span>
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
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
              Pay Online
            </label>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
          <button onClick={() => onPlaceOrder(paymentMethod)} className="px-4 py-2 bg-blood-red-600 text-white rounded hover:bg-blood-red-700">Place Order</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
