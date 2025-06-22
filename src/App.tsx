import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Services from './components/Services';
import SuitCollection from './components/SuitCollection';
import Footer from './components/Footer';
import LaundryService from './components/LaundryService';
import UnstitchedClothesPage from './components/UnstitchedClothesPage';
import AdminEditor from './components/AdminEditor';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerOrders from './components/CustomerOrders';
import ViewOrders from './components/ViewOrders';
import AlterationPage from './components/AlterationPage';
import CustomerAlterations from './components/CustomerAlterations';
import ViewAlterations from './components/ViewAlterations';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import GoogleAuth from './pages/GoogleAuth';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <Features />
                    <Services />
                    <SuitCollection />
                    <About />
                  </>
                }
              />
              <Route path="/laundry-service" element={<LaundryService />} />
              <Route path="/unstitched-clothes" element={<UnstitchedClothesPage />} />
              <Route
                path="/Admin-Editor"
                element={
                  <ProtectedRoute>
                    <AdminEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="/Login" element={<Login />} />
              <Route path="/Register" element={<Register />} />
              <Route path="/my-orders" element={<CustomerOrders />} />
              <Route path="/orders" element={<ViewOrders isPage />} />
              <Route path="/alteration" element={<AlterationPage />} />
              <Route path="/my-alterations" element={<CustomerAlterations />} />
              <Route path="/alteration-orders" element={<ViewAlterations isPage />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/google-auth" element={<GoogleAuth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;