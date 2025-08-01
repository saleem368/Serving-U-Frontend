/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addToCart } from '../redux/cartSlice';
import { ShoppingCart } from 'lucide-react';
import CartSidebar from './CartSidebar';
import { SkeletonBox } from './Skeletons';

type LaundryItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  unit: string; // Unit is now required
};

const LAUNDRY_CATEGORIES = [
  'Normal',
  'Dry Clean',
  'Easy Wash',
  'Blanket Wash',
];

const LaundryServicePage = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/laundry`);
        const data: LaundryItem[] = await response.json();
        setItems(data);
        setCategories(['All Items', ...LAUNDRY_CATEGORIES]);
      } catch (error) {
        console.error('Error fetching laundry items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndItems();
  }, []);

  const filteredItems = selectedCategory && selectedCategory !== 'All Items'
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const getImageUrl = (image: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${API_BASE}/api${image}`;
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-2">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-2 shadow-sm">
        <h1 className="text-xl font-bold text-center text-blood-red-600">Laundry Service</h1>
        <div className="flex space-x-2 overflow-x-auto overflow-y-hidden py-2 hide-scrollbar">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category === 'All Items' ? null : category)}
              className={`px-3 py-1 text-xs md:text-sm rounded-full whitespace-nowrap ${
                (!selectedCategory && category === 'All Items') || selectedCategory === category
                  ? 'bg-blood-red-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="p-1 md:p-3 space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} className="h-24 w-full mb-3" />
          ))
        ) : (
          filteredItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center gap-4">
                {item.image && (
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                )}
                <div>
                  <h3 className="font-medium text-gray-800 text-base md:text-lg">{item.name}</h3>
                  <p className="text-blood-red-600 font-bold text-sm md:text-base">
                    {item.price} Rs/{item.unit} {/* Unit is now required */}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(addToCart({ ...item, quantity: 1, category: 'laundry', laundryType: item.category }))}
                className="bg-blood-red-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm mt-2 md:mt-0"
              >
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cart Button */}
      <div className="fixed bottom-4 right-4 z-20">
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-blood-red-600 text-white p-4 rounded-full shadow-lg"
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Order Submitted Notification */}
      {orderSubmitted && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blood-red-600 text-white px-4 py-2 rounded text-sm shadow-lg">
          Order submitted successfully!
        </div>
      )}

      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          .btn-hover { 
            transition: all 0.2s ease; 
          }
          .btn-hover:hover { 
            transform: translateY(-1px); 
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); 
          }
          
          .card-hover { 
            transition: all 0.3s ease; 
          }
          .card-hover:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); 
          }
          
          .fab { 
            transition: all 0.3s ease; 
          }
          .fab:hover { 
            transform: scale(1.05); 
            box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4); 
          }
          
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}
      </style>
    </div>
  );
};

export default LaundryServicePage;
