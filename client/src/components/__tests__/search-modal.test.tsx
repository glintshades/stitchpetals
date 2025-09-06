import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { SearchModal } from '../search-modal'

// Mock react-query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: 'Pink Crochet Sunflower',
    price: 25.99,
    description: 'Beautiful pink sunflower arrangement',
    category: { name: 'Sunflowers' },
    imageUrl: '/test-image.jpg'
  },
  {
    id: 2,
    name: 'Red Rose Bouquet',
    price: 35.50,
    description: 'Elegant red rose bouquet',
    category: { name: 'Roses' },
    imageUrl: '/test-image2.jpg'
  }
]

// Mock fetch for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockProducts),
  })
) as any

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('SearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search modal when open', () => {
    renderWithQueryClient(
      <SearchModal open={true} onOpenChange={vi.fn()} />
    )
    
    expect(screen.getByTestId('input-search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search products, colors, or categories...')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithQueryClient(
      <SearchModal open={false} onOpenChange={vi.fn()} />
    )
    
    expect(screen.queryByTestId('input-search')).not.toBeInTheDocument()
  })

  it('calls onOpenChange when escape is pressed', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <SearchModal open={true} onOpenChange={onOpenChange} />
    )
    
    const input = screen.getByTestId('input-search')
    await userEvent.type(input, '{escape}')
    
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows search results when typing', async () => {
    renderWithQueryClient(
      <SearchModal open={true} onOpenChange={vi.fn()} />
    )
    
    const input = screen.getByTestId('input-search')
    await userEvent.type(input, 'pink')
    
    await waitFor(() => {
      expect(screen.getByText('Pink Crochet Sunflower')).toBeInTheDocument()
    })
  })

  it('highlights search terms in results', async () => {
    renderWithQueryClient(
      <SearchModal open={true} onOpenChange={vi.fn()} />
    )
    
    const input = screen.getByTestId('input-search')
    await userEvent.type(input, 'pink')
    
    await waitFor(() => {
      const highlighted = document.querySelector('mark')
      expect(highlighted).toHaveTextContent('pink')
    })
  })

  it('shows no results message when no matches found', async () => {
    renderWithQueryClient(
      <SearchModal open={true} onOpenChange={vi.fn()} />
    )
    
    const input = screen.getByTestId('input-search')
    await userEvent.type(input, 'nonexistent')
    
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument()
    })
  })

  it('navigates with arrow keys', async () => {
    renderWithQueryClient(
      <SearchModal open={true} onOpenChange={vi.fn()} />
    )
    
    const input = screen.getByTestId('input-search')
    await userEvent.type(input, 'crochet')
    
    await waitFor(() => {
      expect(screen.getByText('Pink Crochet Sunflower')).toBeInTheDocument()
    })
    
    await userEvent.type(input, '{arrowdown}')
    
    // Check if first result is highlighted
    const firstResult = screen.getByText('Pink Crochet Sunflower').closest('div')
    expect(firstResult).toHaveClass('border-wine')
  })
})