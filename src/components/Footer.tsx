import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full relative bg-blood-red-700 text-cream-100 py-6 px-2 md:px-8 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 text-xs md:text-base shadow-inner" style={{ minHeight: '70px' }}>
      {/* Animated Top Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blood-red-400 via-blood-red-500 to-blood-red-400"
        style={{ transformOrigin: 'left' }}
      />
      <div className="container mx-auto text-center z-10 relative flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-1 font-semibold tracking-wide text-base md:text-lg text-cream-100"
        >
          Serving "U"
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="text-xs md:text-sm text-cream-500 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2"
        >
          <span>&copy; {year} Serving "U"</span>
          <span className="hidden md:inline-block">|</span>
          <span>
            Powered by{' '}
            <a
              href="https://www.helmer.world/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-100 underline underline-offset-2 hover:text-cream-500 transition-colors duration-200"
            >
              HELMER
            </a>
          </span>
          <span className="hidden md:inline-block">|</span>
          <Link to="/terms-and-conditions" className="text-cream-100 underline underline-offset-2 hover:text-cream-500 transition-colors duration-200">Terms & Conditions</Link>
          <span className="hidden md:inline-block">|</span>
          <Link to="/privacy-policy" className="text-cream-100 underline underline-offset-2 hover:text-cream-500 transition-colors duration-200">Privacy Policy</Link>
        </motion.p>
      </div>
      <style>{`
        .text-cream-500 { color: var(--cream-500); }
        .text-cream-100 { color: var(--cream-100); }
        .bg-blood-red-700 { background-color: var(--blood-red-700); }
        .bg-gradient-to-r {
          background: linear-gradient(90deg, var(--blood-red-400), var(--blood-red-500), var(--blood-red-400));
        }
      `}</style>
    </footer>
  );
};

export default Footer;