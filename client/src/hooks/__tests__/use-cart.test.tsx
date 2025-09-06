import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCart } from '../use-cart'

// Mock API response
const mockCartItems = [
  {
    id: 1,
    productId: 1,
    quantity: 2,
    product: {
      id: 1,
      name: 'Pink Sunflower',
      price: 25.99,
      imageUrl: '/test.jpg'
    }
  }
]

// Mock fetch
global.fetch = vi.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCartItems),
    })
  })

  it('fetches cart items on mount', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.cartItems).toEqual(mockCartItems)
    })
    
    expect(global.fetch).toHaveBeenCalledWith('/api/cart')
  })

  it('calculates total items correctly', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.cartItems.reduce((total, item) => total + item.quantity, 0)).toBe(2)
    })
  })

  it('calculates total price correctly', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.totalPrice).toBe(51.98) // 2 * 25.99
    })
  })

  it('adds item to cart', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCartItems),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.cartItems).toBeDefined()
    })

    result.current.addToCart({
      productId: 2,
      quantity: 1,
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 2, quantity: 1 }),
    })
  })

  it('removes item from cart', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCartItems),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.cartItems).toBeDefined()
    })

    result.current.removeFromCart(1)

    expect(global.fetch).toHaveBeenCalledWith('/api/cart/1', {
      method: 'DELETE',
    })
  })

  it('updates item quantity', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCartItems),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.cartItems).toBeDefined()
    })

    result.current.updateQuantity({
      id: 1,
      quantity: 3,
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/cart/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 }),
    })
  })
})