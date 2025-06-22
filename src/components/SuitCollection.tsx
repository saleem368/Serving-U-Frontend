import { motion } from "framer-motion";

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }; 

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  return (
    <section
      id="about-us"
      className="relative py-16 md:py-24 bg-gradient-to-b from-cream-50 to-white overflow-hidden"
    >
      {/* Background stitching pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwTDEwMCAxMDBNMTAwIDBMMCAxMDAiIHN0cm9rZT0iI2VmMGYwZiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-20"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-serif text-center mb-10 italic text-blood-red-600"
          >
            About Us
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-3xl font-serif text-blood-red-700 mb-4">Who We Are</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              At <span className="text-blood-red-600 font-semibold">Serving U</span>, we provide exceptional services blending quality,
              convenience, and care. With years of expertise, we have earned a reputation for excellence and reliability.
            </p>

            <h3 className="text-3xl font-serif text-blood-red-700 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our mission is to simplify your life with premium services tailored to your needs. Whether it's laundry or tailoring, we aim to exceed your expectations every time.
            </p>

            <h3 className="text-3xl font-serif text-blood-red-700 mb-4">Our Values</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-4">
              <li>
                <span className="font-semibold text-blood-red-600">Quality:</span> Delivering the highest standards in everything we do.
              </li>
              <li>
                <span className="font-semibold text-blood-red-600">Customer Satisfaction:</span> Your happiness is our top priority.
              </li>
              <li>
                <span className="font-semibold text-blood-red-600">Sustainability:</span> Using eco-friendly practices to protect our planet.
              </li>
              <li>
                <span className="font-semibold text-blood-red-600">Innovation:</span> Continuously evolving to meet your needs better.
              </li>
            </ul>
          </motion.div>

          {/* Service Promise */}
          <motion.div
            variants={itemVariants}
            className="mt-12 bg-blood-red-600/10 border border-blood-red-300/40 rounded-2xl p-8 md:p-10 backdrop-blur-md shadow-lg"
          >
            <h3 className="text-2xl font-serif text-blood-red-700 text-center mb-6">Our Commitment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Excellence", text: "Delivering top-notch services with care and precision." },
                { title: "Reliability", text: "Always there when you need us most." },
                { title: "Sustainability", text: "Committed to eco-friendly operations." },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="text-center p-6 bg-white/70 rounded-lg shadow-md"
                >
                  <h4 className="font-serif text-blood-red-700 mb-3 text-xl">{item.title}</h4>
                  <p className="text-gray-700">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Suit Collection Section - Responsive Padding and Stacking */}
      <div className="p-2 md:p-8 flex flex-col gap-4 md:gap-8">
        {/* ...suit collection content... */}
      </div>
    </section>
  );
};

export default AboutUs;