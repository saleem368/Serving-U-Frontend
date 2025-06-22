import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import Services from '../components/Services';
import SuitCollection from '../components/SuitCollection';
import Footer from '../components/Footer';
import LaundryServicePage from '../components/LaundryService';
import UnstitchedClothesPage from '../components/UnstitchedClothesPage';
import AdminEditor from '../components/AdminEditor';
import { SkeletonBox } from '../components/Skeletons';

function App() {
  // Homepage skeleton loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 1s (replace with real data loading if needed)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Main landing page route */}
            <Route path="/" element={
              loading ? (
                <div className="space-y-8 px-4 py-8 max-w-4xl mx-auto">
                  <SkeletonBox className="h-64 w-full mb-4 rounded-xl" />
                  <SkeletonBox className="h-32 w-full mb-4 rounded-xl" />
                  <SkeletonBox className="h-40 w-full mb-4 rounded-xl" />
                  <SkeletonBox className="h-32 w-full mb-4 rounded-xl" />
                  <SkeletonBox className="h-40 w-full mb-4 rounded-xl" />
                </div>
              ) : (
                <>
                  <Hero />
                  <Features />
                  <Services />
                  <SuitCollection />
                  <About />
                </>
              )
            } />
            
            {/* Laundry service page route */}
            <Route path="/laundry-service" element={<LaundryServicePage />} />
            
            <Route path="/unstitched-clothes" element={<UnstitchedClothesPage />} />
            <Route path="/Admin-Editor" element={<AdminEditor />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;