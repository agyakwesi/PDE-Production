import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useCart = () => {
  const { user } = useAuth();
  const userId = user ? (user._id || user.id) : 'guest';
  const cartKey = `pde_cart_${userId}`;

  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(cartKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Reload cart from local storage when the user logs in/out, or when another component updates it
  useEffect(() => {
    const loadCart = () => {
      try {
        const stored = localStorage.getItem(cartKey);
        setCart(stored ? JSON.parse(stored) : []);
      } catch {
        setCart([]);
      }
    };

    loadCart();

    window.addEventListener('storage', loadCart);
    window.addEventListener('cart_updated', loadCart);

    return () => {
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('cart_updated', loadCart);
    };
  }, [cartKey]);

  useEffect(() => {
    const newStr = JSON.stringify(cart);
    if (localStorage.getItem(cartKey) !== newStr) {
      localStorage.setItem(cartKey, newStr);
      window.dispatchEvent(new Event('cart_updated'));
    }
  }, [cart, cartKey]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product.productId);
      if (exists) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount };
};

export default useCart;
