/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addToCart } from '../redux/cartSlice';
import { ShoppingCart } from 'lucide-react';
import CartSidebar from './CartSidebar';
import { SkeletonBox } from './Skeletons';

type ClothesItem = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  category?: string; // Add category for type compatibility
  sizes?: string[]; // Add sizes to type
};

const API_BASE = import.meta.env.VITE_API_BASE; 

const UnstitchedClothesPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const [items, setItems] = useState<ClothesItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ClothesItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/unstitched`);
        const data: ClothesItem[] = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching unstitched clothes items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Helper to get full image URL
  const getImageUrl = (image: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${API_BASE}${image}`;
  };

  // Helper to get all images for an item (legacy + new)
  const getUnstitchedImages = (item: ClothesItem) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images.map((img: string) => getImageUrl(img));
    } else if (item.image) {
      return [getImageUrl(item.image)];
    }
    return [];
  };

  // Carousel component
  const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
    const [current, setCurrent] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollTo = (idx: number) => {
      setCurrent(idx);
      if (scrollRef.current) {
        const child = scrollRef.current.children[idx] as HTMLElement;
        if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    };
    return (
      <div className="relative w-full">
        <div className="flex items-center">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-2 scrollbar-none snap-x snap-mandatory rounded-xl"
            style={{ scrollBehavior: 'smooth', maxWidth: '320px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', overflow: 'auto' }}
          >
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Unstitched ${idx + 1}`}
                className={`w-32 h-32 object-cover rounded-xl shadow snap-center border-2 border-gray-300 transition-transform duration-200 hover:scale-105`}
                onClick={() => scrollTo(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex justify-center mt-1 space-x-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === current ? 'bg-blood-red-600' : 'bg-gray-300'}`}
                onClick={() => scrollTo(idx)}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-2">
      <h1 className="text-xl font-bold text-center text-blood-red-600 mb-4">Unstitched Suits</h1>
      <div className="p-1 md:p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} className="h-48 w-full mb-3" />
          ))
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow p-3 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedItem(item)}
            >
              <ImageCarousel images={getUnstitchedImages(item)} />
              <h3 className="font-medium text-gray-800 text-base md:text-lg mt-2 text-center">{item.name}</h3>
              <p className="text-blood-red-600 font-bold text-sm md:text-base text-center">₹{item.price}</p>
              {/* Show sizes under each item */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                  {item.sizes.map((size, idx) => (
                    <span key={idx} className="inline-flex items-center bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold border border-gray-300">{size}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Product Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-blood-red-100 max-w-md w-full relative">
            <button
              onClick={() => { setSelectedItem(null); setSelectedSize(null); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
            <ImageCarousel images={getUnstitchedImages(selectedItem)} />
            <h2 className="text-xl font-bold mt-4 mb-2 text-blood-red-600">{selectedItem.name}</h2>
            <p className="text-gray-700 mb-2">{selectedItem.description}</p>
            {/* Show selectable sizes in modal */}
            {selectedItem.sizes && selectedItem.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedItem.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1 rounded text-xs font-semibold border transition-all duration-150 ${selectedSize === size ? 'bg-blood-red-600 text-white border-blood-red-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blood-red-50'}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            <p className="text-blood-red-600 font-bold text-lg mb-4">₹{selectedItem.price}</p>
            <button
              onClick={() => {
                if (!selectedSize) return;
                const { category: _cat, ...rest } = selectedItem;
                dispatch(addToCart({ ...rest, quantity: 1, size: selectedSize }));
                setSelectedItem(null);
                setSelectedSize(null);
              }}
              className={`w-full bg-blood-red-600 text-white px-4 py-2 rounded-lg font-semibold text-base shadow transition ${!selectedSize ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blood-red-700'}`}
              disabled={!selectedSize}
            >
              {selectedItem.sizes && selectedItem.sizes.length > 0 ? 'Add to Cart (Select Size)' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default UnstitchedClothesPage;

/* Add this style block at the bottom of the file or in index.css:
<style>
{`
.scrollbar-none::-webkit-scrollbar { display: none !important; }
.scrollbar-none { -ms-overflow-style: none !important; scrollbar-width: none !important; }
`}
</style>
*/
