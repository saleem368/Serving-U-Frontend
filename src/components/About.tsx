import { Heart, Shield, Clock } from 'lucide-react';

const About = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif text-center mb-4">About Us</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          At Serving U, we believe in providing exceptional service that goes beyond expectations. Our commitment to quality and customer satisfaction drives everything we do.
        </p>
        
        <div className="p-2 md:p-8 flex flex-col gap-4 md:gap-8">
          <div className="text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Customer First</h3>
            <p className="text-gray-600">
              Your satisfaction is our top priority. We go above and beyond to ensure you receive the best service possible.
            </p>
          </div>
          
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
            <p className="text-gray-600">
              We maintain the highest standards in all our services, backed by our satisfaction guarantee.
            </p>
          </div>
          
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Timely Service</h3>
            <p className="text-gray-600">
              We value your time and ensure prompt service delivery without compromising on quality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;