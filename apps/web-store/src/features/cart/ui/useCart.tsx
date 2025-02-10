import { useContext } from 'react';

import { CartContext } from './CartProvider';

export default function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside of the CartProvider');
  return ctx;
}
