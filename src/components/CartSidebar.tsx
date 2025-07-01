/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCart, updateQuantity, removeFromCart } from '../redux/cartSlice';
import { X, Plus, Minus } from 'lucide-react';
import OrderSummaryPage from './OrderSummaryPage';
import { useNavigate } from 'react-router-dom';


const API_BASE = import.meta.env.VITE_API_BASE 

// Helper to get full image URL
const getImageUrl = (image: string) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `${API_BASE}/api${image}`;
};


type PendingOrder = {
  customer: { name: string; address: string; phone: string; email: string };
  items: Array<{ _id: string; name: string; price: number; quantity: number; category?: string; size?: string; laundryType?: string }>;

  total: number;
  note?: string;
  paymentStatus?: 'Paid' | 'Cash on Delivery';
};

const CartSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [note, setNote] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);

  useEffect(() => {
    // Autofill customer info from profile if available
    const saved = localStorage.getItem('userProfile');
    const userEmail = localStorage.getItem('userEmail');
    if (saved && userEmail) {
      setCustomerInfo((info) => ({ ...info, ...JSON.parse(saved), email: userEmail }));
    } else if (saved) {
      setCustomerInfo((info) => ({ ...info, ...JSON.parse(saved) }));
    } else if (userEmail) {
      setCustomerInfo((info) => ({ ...info, email: userEmail }));
    }
  }, [isOpen]);

  const calculateTotal = () => {
    // Separate laundry and readymade items based on laundryType field
    // Also handle old structure with category field for backward compatibility
    const laundryItems = cart.filter(item => 
      (item.laundryType && item.laundryType.trim() !== '') || 
      (item.category === 'laundry')
    );
    const readymadeItems = cart.filter(item => 
      (!item.laundryType || item.laundryType.trim() === '') && 
      (item.category !== 'laundry')
    );
    
    // Only calculate total for readymade items (suits, etc.)
    const readymadeTotal = readymadeItems.reduce((total, item) => {
      const price = parseFloat(item.price.toString());
      const quantity = parseInt(item.quantity.toString());
      return total + (price * quantity);
    }, 0);
    
    // Round to 2 decimal places to avoid floating point issues
    return {
      hasLaundry: laundryItems.length > 0,
      hasReadymade: readymadeItems.length > 0,
      readymadeTotal: Math.round(readymadeTotal * 100) / 100,
      laundryCount: laundryItems.length,
      readymadeCount: readymadeItems.length
    };
  };

  const handleFormContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/register');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before placing an order.');
      return;
    }
    if (!customerInfo.name || !customerInfo.address || !customerInfo.phone) {
      setError('Please fill in all customer details.');
      return;
    }
    
    const totalInfo = calculateTotal();
    const customerWithEmail = { ...customerInfo, email: userEmail };
    
    // For orders with only laundry items, total will be 0 until admin sets price
    // For mixed orders, use readymade total
    // For readymade-only orders, use full total
    let orderTotal = 0;
    if (totalInfo.hasReadymade && !totalInfo.hasLaundry) {
      // Pure readymade order
      orderTotal = totalInfo.readymadeTotal;
    } else if (totalInfo.hasReadymade && totalInfo.hasLaundry) {
      // Mixed order - use readymade total for now
      orderTotal = totalInfo.readymadeTotal;
    } else {
      // Pure laundry order - total will be 0 until admin sets price
      orderTotal = 0;
    }
    
    const order: PendingOrder = {
      customer: customerWithEmail,
      items: cart.map(({ _id, name, price, quantity, category, size, laundryType }) => {
        const item: { _id: string; name: string; price: number; quantity: number; category?: string; size?: string; laundryType?: string } = { _id, name, price, quantity };
        if (category) item.category = category;
        if (typeof size === 'string' && size.trim() !== '') item.size = size;
        if (laundryType) item.laundryType = laundryType;
        return item;
      }),
      total: orderTotal,
      note,
    };
    setPendingOrder(order);
    setShowSummary(true);
  };

  const handlePlaceOrder = async (paymentMethod: 'cod' | 'razorpay') => {
    // For orders with laundry items, we need to wait for admin to set the total
    const totalInfo = calculateTotal();
    
    // If razorpay and has laundry items, only allow payment for readymade items
    if (paymentMethod === 'razorpay' && totalInfo.hasLaundry && !totalInfo.hasReadymade) {
      setError('Online payment for laundry-only orders will be available after admin sets the final amount. Please use Cash on Delivery for now.');
      return;
    }
    
    // Set paymentStatus on pendingOrder
    if (pendingOrder) {
      setPendingOrder({ ...pendingOrder, paymentStatus: paymentMethod === 'razorpay' ? 'Paid' : 'Cash on Delivery' });
    }
    if (paymentMethod === 'razorpay') {
      // Check if Razorpay key is available
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        setError('Payment system not configured. Please contact support.');
        return;
      }

      try {
        // Calculate payment amount (only readymade items if mixed cart)
        const paymentAmount = totalInfo.hasLaundry && totalInfo.hasReadymade 
          ? totalInfo.readymadeTotal  // Mixed cart: pay only for readymade items
          : pendingOrder?.total || 0;      // Pure readymade cart: pay full amount
        
        // Ensure payment amount is valid
        if (!paymentAmount || paymentAmount <= 0) {
          setError('Invalid payment amount. Please check your order total.');
          return;
        }
        
        console.log('💰 Payment amount calculated:', paymentAmount, 'for order total:', pendingOrder?.total);
        
        // Razorpay integration (open checkout)
        console.log('🔗 API endpoint:', `${API_BASE}/api/razorpay/order`);
        console.log('💰 Sending payment amount:', paymentAmount);
        
        const res = await fetch(`${API_BASE}/api/razorpay/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: paymentAmount }),
        });
        
        console.log('📡 API Response Status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.error || errorData.message || 'Failed to create payment order');
        }
        
        const data = await res.json();
        console.log('✅ Razorpay order data:', data);
        
        const options = {
          key: razorpayKey,
          amount: data.amount,
          currency: data.currency,
          order_id: data.id,
          name: 'Laundry/Readymade Suits Service',
          description: 'Order Payment',
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
              // On payment success, place order
              await submitOrder('Paid');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: pendingOrder?.customer.name,
          email: pendingOrder?.customer.email,
          contact: pendingOrder?.customer.phone,
        },
        theme: { color: '#b91c1c' },
      };        // @ts-expect-error: Razorpay is loaded globally and may not have TypeScript types
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (error) {
        console.error('Payment setup error:', error);
        setError('Failed to setup payment. Please try again or use Cash on Delivery.');
        return;
      }
    }
    // Cash on Delivery
    await submitOrder('Cash on Delivery');
  };

  // Update submitOrder to accept paymentStatus
  const submitOrder = async (paymentStatus?: 'Paid' | 'Cash on Delivery') => {
    try {
      const orderToSend = paymentStatus ? { ...pendingOrder, paymentStatus } : pendingOrder;
      
      // Debug: Log the order data being sent
      console.log('📤 Sending order data:', JSON.stringify(orderToSend, null, 2));
      console.log('🔗 API endpoint:', `${API_BASE}/api/orders`);
      
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderToSend),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        throw new Error(errorData.message || 'Failed to place order');
      }
      
      const result = await response.json();
      console.log('✅ Order placed successfully:', result);
      
      setSuccess('Order submitted successfully!');
      setCustomerInfo({ name: '', address: '', phone: '' });
      setNote('');
      dispatch(clearCart());
      if (window.localStorage) {
        window.localStorage.removeItem('cart');
      }
      setTimeout(() => {
        setSuccess('');
        setShowSummary(false);
        setPendingOrder(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('🚨 Submit order error:', err);
      setError(`Failed to place order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className={`fixed top-0 right-0 h-full w-11/12 sm:w-96 bg-white shadow-lg z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Order</h2>
            <button onClick={onClose} className="text-gray-500">
              <X size={24} />
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
          {success && (
            <div className="mb-2 p-2 bg-blue-100 text-blue-700 rounded text-sm">
              Your order has been placed and is pending review. You can check its status in your order history.
            </div>
          )}

          {/* Show summary page if needed */}
          {showSummary && pendingOrder ? (
            <OrderSummaryPage
              order={pendingOrder}
              onBack={() => setShowSummary(false)}
              onPlaceOrder={handlePlaceOrder}
            />
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-grow overflow-y-auto space-y-2">
                {cart.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Your cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-10 h-10 object-cover rounded border" />
                        )}
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">
                            {item.category === 'laundry' ? 
                              <span className="text-blood-red-600">Admin will set price</span> : 
                              `₹${item.price.toFixed(2)}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            dispatch(updateQuantity({ itemId: item._id, newQuantity: Math.max(1, item.quantity - 1) }))
                          }
                          className="text-blood-red-600 p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="mx-1 text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch(updateQuantity({ itemId: item._id, newQuantity: item.quantity + 1 }))
                          }
                          className="text-blood-red-600 p-1"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="text-blood-red-600 p-1 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))  
                )}
              </div>

              {/* Customer Info Form */}
              <form onSubmit={handleFormContinue} className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 border rounded text-sm"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full p-2 border rounded text-sm"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-2 border rounded text-sm"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  required
                />
                <textarea
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Add a note for special requirements (optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  maxLength={300}
                  style={{ resize: 'vertical' }}
                />

                <div className="flex justify-center items-center mt-3 mb-1">
                  <span className="text-xs text-gray-500">
                  For any query contact:&nbsp;
                  <a href="tel:8427631266" className="text-blood-red-600 font-semibold hover:underline">
                    84276 31266
                  </a>
                  </span>
                </div>
                {/* Order Summary */}
                <div className="border-t pt-2">
                  {(() => {
                    const totalInfo = calculateTotal();
                    return (
                      <div className="space-y-1">
                        {totalInfo.hasReadymade && (
                          <div className="flex justify-between text-sm">
                            <span>Readymade Items:</span>
                            <span>₹{totalInfo.readymadeTotal.toFixed(2)}</span>
                          </div>
                        )}
                        {totalInfo.hasLaundry && (
                          <div className="flex justify-between text-sm">
                            <span>Laundry Items ({totalInfo.laundryCount}):</span>
                            <span className="text-blood-red-600 font-medium">See admin total</span>
                          </div>
                        )}
                        {totalInfo.hasReadymade && !totalInfo.hasLaundry && (
                          <div className="flex justify-between font-bold text-sm">
                            <span>Total:</span>
                            <span>₹{totalInfo.readymadeTotal.toFixed(2)}</span>
                          </div>
                        )}
                        {totalInfo.hasLaundry && (
                          <div className="text-xs text-gray-600 mt-2">
                            * Final total will be set by admin after reviewing laundry items
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <button
                    type="submit"
                    className="w-full bg-blood-red-600 text-white py-2 rounded text-sm mt-2"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
