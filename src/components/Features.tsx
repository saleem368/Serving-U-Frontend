import { Award, Timer, Shirt } from 'lucide-react';

const Features = () => {
  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 px-2 md:px-8">
          <div className="flex-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">About Our Brand</h3>
            <p className="text-gray-600 text-sm mb-3">
              At the heart of our service is a commitment to quality, innovation, and professionalism.
            </p>
            <a href="#" className="text-xs font-medium underline">Learn more</a>
          </div>
          <div className="flex-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blood-red-50">
                <Timer className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Laundry Services</h3>
            <p className="text-gray-600 text-sm mb-3">
              Entrust your most delicate garments and fabrics to our experienced team. We handle them with utmost care.
            </p>
            <a href="#" className="text-xs font-medium underline">Learn more</a>
          </div>
          <div className="flex-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blood-red-50">
                <Shirt className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Readymade Suits</h3>
            <p className="text-gray-600 text-sm mb-3">
              Browse our wide and comprehensive collection of readymade suits. Crafted from the finest fabrics.
            </p>
            <a href="#" className="text-xs font-medium underline">Learn more</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
