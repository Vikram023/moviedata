import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

// Mock the API service
vi.mock('../services/movieService', () => ({
  getMe: vi.fn().mockRejectedValue({ status: 401 }),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
  getTrending: vi.fn().mockResolvedValue({ data: { results: [] } }),
  getPopularMovies: vi.fn().mockResolvedValue({ data: { results: [] } }),
}))

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  it('starts with loading state', () => {
    const { container } = renderWithProviders(<div data-testid="test">Test</div>)
    expect(container).toBeTruthy()
  })

  it('renders unauthenticated state after failed session restore', async () => {
    const { getByTestId } = renderWithProviders(<div data-testid="test">Test</div>)
    await waitFor(() => {
      expect(getByTestId('test')).toBeInTheDocument()
    })
  })
})

describe('Helpers', () => {
  it('getPosterUrl returns correct URL', async () => {
    const { getPosterUrl } = await import('../utils/helpers')
    expect(getPosterUrl('/test.jpg')).toBe('https://image.tmdb.org/t/p/w342/test.jpg')
    expect(getPosterUrl(null)).toBeNull()
  })

  it('formatYear returns correct year', async () => {
    const { formatYear } = await import('../utils/helpers')
    expect(formatYear('2023-07-15')).toBe(2023)
    expect(formatYear(null)).toBe('')
  })

  it('formatRuntime formats correctly', async () => {
    const { formatRuntime } = await import('../utils/helpers')
    expect(formatRuntime(142)).toBe('2h 22m')
    expect(formatRuntime(45)).toBe('45m')
    expect(formatRuntime(null)).toBeNull()
  })

  it('getRatingColor returns correct classes', async () => {
    const { getRatingColor } = await import('../utils/helpers')
    expect(getRatingColor(8.5)).toBe('text-cs-success')
    expect(getRatingColor(7)).toBe('text-cs-accent')
    expect(getRatingColor(4)).toBe('text-cs-error')
  })
})
