import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWishlist } from '../use-wishlist'

// Mock wishlist data
const mockWishlistItems = [
  {
    id: 1,
    productId: 1,
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

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWishlistItems),
    })
  })

  it('fetches wishlist items on mount', async () => {
    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.wishlistItems).toEqual(mockWishlistItems)
    })
    
    expect(global.fetch).toHaveBeenCalledWith('/api/wishlist')
  })

  it('checks if product is in wishlist', async () => {
    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isInWishlist(1)).toBe(true)
      expect(result.current.isInWishlist(2)).toBe(false)
    })
  })

  it('adds item to wishlist', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWishlistItems),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.wishlistItems).toBeDefined()
    })

    result.current.addToWishlist(2)

    expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 2 }),
    })
  })

  it('removes item from wishlist', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWishlistItems),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.wishlistItems).toBeDefined()
    })

    result.current.removeFromWishlist(1)

    expect(global.fetch).toHaveBeenCalledWith('/api/wishlist/1', {
      method: 'DELETE',
    })
  })

  it('toggles wishlist item correctly', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWishlistItems),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.wishlistItems).toBeDefined()
    })

    // Toggle item that's in wishlist (should remove)
    result.current.toggleWishlist(1)

    expect(global.fetch).toHaveBeenCalledWith('/api/wishlist/1', {
      method: 'DELETE',
    })
  })
})