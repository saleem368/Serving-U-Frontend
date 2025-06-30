// Hero.tsx
import { useNavigate } from 'react-router-dom';
import { SkeletonBox } from './Skeletons';
import { useState } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState({ laundry: false, suits: false });

  const handleLaundryClick = () => {
    navigate('/laundry-service');
  };

  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12 px-2 md:px-8 py-8 md:py-16 bg-cream-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center md:justify-between">
          {/* Text Content */}
          <div className="max-w-lg text-center md:text-left mb-6 md:mb-0 fade-in">
            <p className="text-blood-red-600 mb-1 md:mb-2 text-xs md:text-base animate-pulse">
              Discover our Premium Laundry Service
            </p>
            <img
              src="./assets/images/222.png"
              alt="Serving U Logo"
              className="w-full h-auto max-h-56 md:max-h-72 object-contain drop-shadow-none m-0 p-0
                        hover:scale-105 transition-transform duration-300 ease-out"
              style={{ backgroundColor: 'transparent', boxShadow: 'none', margin: 0, padding: 0, display: 'block' }}
              draggable="false"
            />
            <p className="text-gray-600 text-xs md:text-base mb-4 md:mb-8 leading-relaxed">
              Experience the ultimate in convenience and quality with our premium laundry services.
            </p>
          </div>

          {/* Images with Buttons */}
          <div className="flex flex-row justify-center items-stretch gap-3 md:gap-6 w-full overflow-x-auto scrollbar-hide">
            {/* First Image with Button */}
            <div className="flex flex-col items-center group mx-0 md:mx-2 w-full md:w-auto max-w-xs md:max-w-none">
              <div className="relative">
                {!imgLoaded.laundry && (
                  <SkeletonBox className="absolute w-24 h-24 md:w-80 md:h-80 rounded-lg z-0" style={{ top: 0, left: 0 }} />
                )}
                <img
                  src="./assets/images/2.jpg"
                  alt="White shirt on hanger"
                  className="relative w-24 h-24 md:w-80 md:h-80 rounded-lg shadow-md group-hover:shadow-xl z-10 object-contain"
                  style={!imgLoaded.laundry ? { visibility: 'hidden' } : {}}
                  onLoad={() => setImgLoaded(l => ({ ...l, laundry: true }))}
                />
              </div>
              <button
                onClick={handleLaundryClick}
                className="mt-2 md:mt-4 bg-blood-red-600 text-white px-3 py-1 md:px-6 md:py-2 hover:bg-blood-red-800 active:scale-95 rounded-lg text-xs md:text-sm shadow-lg group-hover:shadow-blood-red-500/50 focus:outline-none w-full md:w-auto"
              >
                Laundry Service
              </button>
            </div>

            {/* Second Image with Button */}
            <div className="flex flex-col items-center group mx-0 md:mx-2 w-full md:w-auto max-w-xs md:max-w-none">
              <div className="relative">
                {!imgLoaded.suits && (
                  <SkeletonBox className="absolute w-24 h-24 md:w-64 md:h-80 rounded-lg z-0" style={{ top: 0, left: 0 }} />
                )}
                <img
                  src="./assets/images/1.jpg"
                  alt="Suit jacket on hanger"
                  className="relative w-24 h-24 md:w-64 md:h-80 rounded-lg shadow-md group-hover:shadow-xl z-10 object-contain"
                  style={!imgLoaded.suits ? { visibility: 'hidden' } : {}}
                  onLoad={() => setImgLoaded(l => ({ ...l, suits: true }))}
                />
              </div>
              <button
                onClick={() => navigate('/unstitched-clothes')}
                className="mt-2 md:mt-4 bg-blood-red-600 text-white px-3 py-1 md:px-6 md:py-2 hover:bg-blood-red-800 active:scale-95 rounded-lg text-xs md:text-sm shadow-lg group-hover:shadow-blood-red-500/50 focus:outline-none w-full md:w-auto"
              >
                Readymade Suits
              </button>
            </div>

            {/* Third Image with Button: Alteration */}
            <div className="flex flex-col items-center group mx-0 md:mx-2 w-full md:w-auto max-w-xs md:max-w-none">
              <div className="relative">
                <img
                  src="./assets/images/444.png"
                  alt="Alteration needle and thread"
                  className="relative w-24 h-24 md:w-64 md:h-80 rounded-lg shadow-md group-hover:shadow-xl z-10 object-contain"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <button
                onClick={() => navigate('/alteration')}
                className="mt-2 md:mt-4 bg-blood-red-600 text-white px-3 py-1 md:px-6 md:py-2 hover:bg-blood-red-800 active:scale-95 rounded-lg text-xs md:text-sm shadow-lg group-hover:shadow-blood-red-500/50 focus:outline-none w-full md:w-auto"
              >
                Alteration
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
