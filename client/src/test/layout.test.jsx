import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import Pagination from '../components/common/Pagination'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Footer from '../components/layout/Footer'
import MainLayout from '../layouts/MainLayout'

// Mock api service
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { results: [] } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  default: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    logout: vi.fn(),
  }),
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}))

describe('LoadingSpinner', () => {
  it('renders standard spinner', () => {
    render(<LoadingSpinner size="md" label="Loading test..." />)
    expect(screen.getByText('Loading test...')).toBeInTheDocument()
  })

  it('renders fullScreen spinner', () => {
    render(<LoadingSpinner fullScreen label="Full screen loader" />)
    expect(screen.getByText('CineScope')).toBeInTheDocument()
    expect(screen.getByText('Full screen loader')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders title, description and action button', () => {
    const handleAction = vi.fn()
    render(
      <MemoryRouter>
        <EmptyState
          title="No Movies Found"
          description="Try searching for another movie."
          actionLabel="Browse Movies"
          onAction={handleAction}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('No Movies Found')).toBeInTheDocument()
    expect(screen.getByText('Try searching for another movie.')).toBeInTheDocument()
    const btn = screen.getByText('Browse Movies')
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })
})

describe('ErrorState', () => {
  it('renders error message and retry button', () => {
    const handleRetry = vi.fn()
    render(
      <ErrorState
        title="Failed to Load"
        message="Unable to fetch movies."
        onRetry={handleRetry}
      />
    )

    expect(screen.getByText('Failed to Load')).toBeInTheDocument()
    expect(screen.getByText('Unable to fetch movies.')).toBeInTheDocument()
    const retryBtn = screen.getByText('Try Again')
    fireEvent.click(retryBtn)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})

describe('Pagination', () => {
  it('renders page numbers and handles page change', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    )

    // Current page indicator/button
    expect(screen.getByText('3', { selector: 'button' })).toBeInTheDocument()

    // Click next page
    const nextBtn = screen.getByLabelText('Go to next page')
    fireEvent.click(nextBtn)
    expect(handlePageChange).toHaveBeenCalledWith(4)
  })
})

describe('ConfirmDialog', () => {
  it('renders when isOpen is true and triggers confirm/cancel', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()

    const { rerender } = render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Item"
        message="Are you sure you want to delete this?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument()

    rerender(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure you want to delete this?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )

    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Confirm'))
    expect(handleConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Cancel'))
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })
})

describe('Footer', () => {
  it('renders CineScope tagline and TMDB attribution', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByText('Discover. Rate. Remember.')).toBeInTheDocument()
    expect(
      screen.getByText('This product uses the TMDB API but is not endorsed or certified by TMDB.')
    ).toBeInTheDocument()
    expect(screen.getByText(/2024 CineScope|CineScope\. All rights reserved\./)).toBeInTheDocument()
  })
})

describe('MainLayout', () => {
  it('renders Navbar and Footer inside MainLayout', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    )

    // CineScope logo in header and footer
    const logos = screen.getAllByText((content, element) => {
      return element?.textContent === 'CINESCOPE'
    })
    expect(logos.length).toBeGreaterThanOrEqual(1)
  })
})
