export const getStoredCart = (cartKey) => {
  try {
    const stored = localStorage.getItem(cartKey);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    return [];
  }
};
