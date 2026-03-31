import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import VaultPage from './pages/VaultPage';
import AdminPage from './pages/AdminPage';
import VerifyPage from './pages/VerifyPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

function App() {
  return (
    <AuthProvider>
      <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="verify" element={<VerifyPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="catalog/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
