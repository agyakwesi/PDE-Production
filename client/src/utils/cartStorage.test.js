import { describe, it, expect, vi } from 'vitest';
import { getStoredCart } from './cartStorage';

describe('getStoredCart', () => {
  it('should return empty array on JSON parse error', () => {
    // Mock localStorage to return invalid JSON
    const mockGetItem = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid-json{];');
    
    // Extract cart using the helper
    const cart = getStoredCart('test_key');
    
    // Assert it gracefully swallowed the error and returned []
    expect(cart).toEqual([]);
    
    // Clean up
    mockGetItem.mockRestore();
  });

  it('should return parsed array on valid JSON', () => {
    const validData = JSON.stringify([{ productId: '1', quantity: 2 }]);
    const mockGetItem = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(validData);
    
    const cart = getStoredCart('test_key');
    
    expect(cart).toEqual([{ productId: '1', quantity: 2 }]);
    
    mockGetItem.mockRestore();
  });
});
