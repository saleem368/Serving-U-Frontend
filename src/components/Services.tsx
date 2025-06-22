import React, { useState } from 'react';

const Services = () => {
  const [activeTab, setActiveTab] = useState('laundry');

  return (
    <section id="services" className="relative py-12 md:py-20 bg-gradient-to-b from-cream-50 to-white">
      {/* Background stitching pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwTDEwMCAxMDBNMTAwIDBMMCAxMDAiIHN0cm9rZT0iI2VmMGYwZiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-20"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 italic text-blood-red-600">Our Premium Services</h2>

        {/* Navigation tabs */}
        <div className="flex justify-center mb-8 border-b border-blood-red-100">
          <button
            onClick={() => setActiveTab('laundry')}
            className={`px-6 py-3 font-medium ${activeTab === 'laundry' ? 'text-grey-600 border-b-2 border-blood-red-600' : 'text-red-600'}`}
          >
            Laundry Services
          </button>
          <button
            onClick={() => setActiveTab('suits')}
            className={`px-6 py-3 font-medium ${activeTab === 'suits' ? 'text-red border-b-2 border-white' : 'text-red-600'}`}
          >
            Unstitched Suits
          </button>
        </div>

       {/* Laundry Services Content */}
{activeTab === 'laundry' && (
  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
    <h3 className="text-2xl md:text-3xl font-serif text-blood-red-700 mb-6">Professional Laundry Services</h3>
    
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left Column - Services */}
      <div>
        <h4 className="text-xl font-serif text-blood-red-600 mb-4">Our Comprehensive Services</h4>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="bg-blood-red-100 text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
            <div>
              <h5 className="font-medium">Premium Garment Care</h5>
              <p className="text-gray-700 text-sm">Specialized cleaning for delicate fabrics including silk, wool, and cashmere using pH-balanced detergents</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blood-red-100 text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
            <div>
              <h5 className="font-medium">Advanced Stain Removal</h5>
              <p className="text-gray-700 text-sm">Professional treatment for tough stains like wine, oil, ink, and makeup with 98% success rate</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blood-red-100 text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
            <div>
              <h5 className="font-medium">Eco-Friendly Cleaning</h5>
              <p className="text-gray-700 text-sm">Biodegradable detergents and energy-efficient equipment that reduce environmental impact</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blood-red-100 text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
            <div>
              <h5 className="font-medium">Specialty Item Handling</h5>
              <p className="text-gray-700 text-sm">Expert care for wedding dresses, leather, suede, and other delicate items</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Right Column - Process */}
      <div>
        <h4 className="text-xl font-serif text-blood-red-600 mb-4">Our Cleaning Process</h4>
        <div className="space-y-6">
          <div className="border-l-4 border-blood-red-500 pl-4">
            <h5 className="font-medium">1. Inspection & Sorting</h5>
            <p className="text-gray-700 text-sm">Each garment is individually inspected and sorted by fabric type and color</p>
          </div>
          <div className="border-l-4 border-blood-red-500 pl-4">
            <h5 className="font-medium">2. Stain Treatment</h5>
            <p className="text-gray-700 text-sm">Targeted pre-treatment for stains using specialized solutions</p>
          </div>
          <div className="border-l-4 border-blood-red-500 pl-4">
            <h5 className="font-medium">3. Precision Cleaning</h5>
            <p className="text-gray-700 text-sm">Custom wash programs for different fabric types and soil levels</p>
          </div>
          <div className="border-l-4 border-blood-red-500 pl-4">
            <h5 className="font-medium">4. Quality Control</h5>
            <p className="text-gray-700 text-sm">Three-point inspection before packaging</p>
          </div>
        </div>

        <div className="mt-8 bg-blood-red-50 p-4 rounded-lg">
          <h5 className="font-serif text-blood-red-700 mb-2">Fast Turnaround Options</h5>
          <p className="text-gray-700 text-sm">
            Choose our <span className="font-medium">Express Service</span> for 24-hour completion or 
            <span className="font-medium"> Standard Service</span> (3-5 business days). 
            Free pickup and delivery available.
          </p>
        </div>
      </div>
    </div>

    {/* Service Highlights */}
    <div className="mt-10 grid md:grid-cols-3 gap-6">
      <div className="text-center p-4">
        <div className="w-12 h-12 bg-blood-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-blood-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h5 className="font-medium text-blood-red-700">Express Service</h5>
        <p className="text-gray-700 text-sm">24-hour turnaround for urgent needs</p>
      </div>
      <div className="text-center p-4">
        <div className="w-12 h-12 bg-blood-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-blood-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h5 className="font-medium text-blood-red-700">Subscription Plans</h5>
        <p className="text-gray-700 text-sm">Save with weekly/monthly packages</p>
      </div>
      <div className="text-center p-4">
        <div className="w-12 h-12 bg-blood-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-blood-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h5 className="font-medium text-blood-red-700">Corporate Services</h5>
        <p className="text-gray-700 text-sm">Bulk solutions for businesses</p>
      </div>
    </div>
  </div>
)}

        {/* Unstitched Suits Content - with red background */}
        {activeTab === 'suits' && (
          <div className="bg-blood-red-600 text-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-serif mb-6">Exclusive Unstitched Suits Collection</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-serif mb-4">Crafted to Perfection</h4>
                <p className="mb-6 opacity-90">
                  Our unstitched suits collection represents the pinnacle of textile craftsmanship. 
                  Each fabric is hand-selected from premium mills, offering you the foundation for 
                  custom-tailored elegance.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="bg-white text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
                    <div>
                      <h5 className="font-medium">Premium Fabrics</h5>
                      <p className="opacity-80 text-sm">Luxurious materials including pure cottons, chiffons, and silk blends</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-white text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
                    <div>
                      <h5 className="font-medium">Custom Tailoring</h5>
                      <p className="opacity-80 text-sm">Partner tailors available for perfect-fit garments</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-white text-blood-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">✓</span>
                    <div>
                      <h5 className="font-medium">Seasonal Collections</h5>
                      <p className="opacity-80 text-sm">New designs introduced each season following fashion trends</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-serif mb-4">Why Choose Our Fabrics?</h4>
                <div className="space-y-6">
                  <div className="border-l-4 border-white/30 pl-4">
                    <h5 className="font-medium">Superior Quality</h5>
                    <p className="opacity-80 text-sm">3-stage quality checks ensure flawless fabrics with even weaves</p>
                  </div>
                  <div className="border-l-4 border-white/30 pl-4">
                    <h5 className="font-medium">Ethical Sourcing</h5>
                    <p className="opacity-80 text-sm">Direct partnerships with weavers supporting traditional crafts</p>
                  </div>
                  <div className="border-l-4 border-white/30 pl-4">
                    <h5 className="font-medium">Designer Patterns</h5>
                    <p className="opacity-80 text-sm">Exclusive prints developed by in-house design team</p>
                  </div>
                </div>

                <div className="mt-8 bg-white/10 p-4 rounded-lg">
                  <h5 className="font-serif mb-2">Special Care Instructions</h5>
                  <p className="opacity-80 text-sm">
                    All our fabrics come with detailed care labels. We recommend gentle hand wash 
                    for most materials to preserve color and texture.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white/10 p-6 rounded-lg">
              <h4 className="text-xl font-serif mb-4">The Serving U Advantage</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium mb-2">Perfect Fit Guarantee</h5>
                  <p className="opacity-80 text-sm">Free alteration credit with partner tailors</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Fabric Swatches</h5>
                  <p className="opacity-80 text-sm">Order sample swatches before purchasing</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Style Consultation</h5>
                  <p className="opacity-80 text-sm">Complimentary styling advice with purchase</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Promise */}
        <div className={`mt-12 rounded-2xl p-6 md:p-8 ${activeTab === 'suits' ? 'bg-white/10 text-white' : 'bg-blood-red-600/5 border border-blood-red-300/30'}`}>
          <h3 className="text-xl md:text-2xl font-serif text-center mb-6">Our Service Promise</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${activeTab === 'suits' ? 'bg-white/20' : 'bg-blood-red-100'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-serif mb-2">Quality Guaranteed</h4>
              <p className={activeTab === 'suits' ? 'opacity-80' : 'text-gray-700'}>100% satisfaction guarantee on all products</p>
            </div>
            <div className="text-center p-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${activeTab === 'suits' ? 'bg-white/20' : 'bg-blood-red-100'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-serif mb-2">Fast Delivery</h4>
              <p className={activeTab === 'suits' ? 'opacity-80' : 'text-gray-700'}>Next-day dispatch for in-stock items</p>
            </div>
            <div className="text-center p-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${activeTab === 'suits' ? 'bg-white/20' : 'bg-blood-red-100'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-serif mb-2">Eco-Conscious</h4>
              <p className={activeTab === 'suits' ? 'opacity-80' : 'text-gray-700'}>Sustainable packaging and processes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;