import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SpoilerReview from '../components/reviews/SpoilerReview'
import RatingDistribution from '../components/ratings/RatingDistribution'
import RatingInput from '../components/ratings/RatingInput'
import ReviewCard from '../components/reviews/ReviewCard'
import ReviewForm from '../components/reviews/ReviewForm'

// Mock AuthContext
const mockAuth = {
  user: { _id: 'user123', name: 'John Doe', email: 'john@example.com' },
  isAuthenticated: true,
  loading: false,
}

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}))

// Mock movieService
vi.mock('../services/movieService', () => ({
  submitRating: vi.fn().mockResolvedValue({
    data: {
      rating: { _id: 'rating1', rating: 8, tmdbId: 100, mediaType: 'movie' },
      communityStats: { average: 8, count: 1, distribution: { 8: 1 } },
    },
  }),
  getMyRating: vi.fn().mockResolvedValue({
    data: {
      rating: { _id: 'rating1', rating: 8, tmdbId: 100, mediaType: 'movie' },
    },
  }),
  deleteRating: vi.fn().mockResolvedValue({
    data: {
      communityStats: { average: 0, count: 0, distribution: {} },
    },
  }),
  createReview: vi.fn().mockResolvedValue({
    data: {
      review: {
        _id: 'rev1',
        tmdbId: 100,
        mediaType: 'movie',
        reviewText: 'Great cinematography and direction throughout the movie!',
        rating: 9,
        containsSpoilers: false,
        helpfulCount: 0,
        userId: { _id: 'user123', name: 'John Doe' },
      },
    },
  }),
  updateReview: vi.fn().mockResolvedValue({
    data: {
      review: {
        _id: 'rev1',
        reviewText: 'Updated review text with more details.',
        rating: 8,
      },
    },
  }),
  reportReview: vi.fn().mockResolvedValue({ data: {} }),
}))

describe('SpoilerReview component', () => {
  it('renders children directly when hasSpoiler is false', () => {
    render(
      <SpoilerReview hasSpoiler={false}>
        <p>This is a safe review without spoilers.</p>
      </SpoilerReview>
    )

    expect(screen.getByText('This is a safe review without spoilers.')).toBeInTheDocument()
    expect(screen.queryByText('Spoiler Warning')).not.toBeInTheDocument()
  })

  it('hides children behind warning when hasSpoiler is true and reveals on click', () => {
    render(
      <SpoilerReview hasSpoiler={true}>
        <p>The main hero was the villain all along!</p>
      </SpoilerReview>
    )

    expect(screen.getByText('Spoiler Warning')).toBeInTheDocument()
    expect(screen.getByText('Reveal Review')).toBeInTheDocument()
    expect(screen.queryByText('The main hero was the villain all along!')).not.toBeInTheDocument()

    // Click reveal
    fireEvent.click(screen.getByText('Reveal Review'))
    expect(screen.getByText('The main hero was the villain all along!')).toBeInTheDocument()
    expect(screen.getByText('Spoiler revealed')).toBeInTheDocument()

    // Re-hide
    fireEvent.click(screen.getByText('Hide'))
    expect(screen.queryByText('The main hero was the villain all along!')).not.toBeInTheDocument()
    expect(screen.getByText('Spoiler Warning')).toBeInTheDocument()
  })
})

describe('RatingDistribution component', () => {
  it('renders average score, total count, and 1-10 rating bars', () => {
    const dist = { 10: 25, 9: 15, 8: 30, 7: 10, 6: 5, 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
    render(<RatingDistribution distribution={dist} average={8.4} count={88} />)

    expect(screen.getByText('8.4')).toBeInTheDocument()
    expect(screen.getByText('88 ratings')).toBeInTheDocument()
    expect(screen.getByText('Rating Distribution')).toBeInTheDocument()

    // Check row for 10 stars
    expect(screen.getAllByText('10').length).toBeGreaterThan(0)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('renders empty fallback when count is 0', () => {
    render(<RatingDistribution distribution={{}} average={null} count={0} />)

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('0 ratings')).toBeInTheDocument()
    expect(screen.getByText('No community ratings yet')).toBeInTheDocument()
  })
})

describe('ReviewCard component', () => {
  const sampleReview = {
    _id: 'rev_abc',
    userId: { _id: 'author999', name: 'Alice Walker', profileImage: null },
    rating: 9,
    reviewText: 'An absolute cinematic masterpiece with breathtaking sound design.',
    containsSpoilers: false,
    helpfulCount: 14,
    isHelpfulByUser: false,
    createdAt: new Date().toISOString(),
  }

  it('renders author, rating, review text, and helpful count', () => {
    render(
      <MemoryRouter>
        <ReviewCard review={sampleReview} currentUserId="user123" />
      </MemoryRouter>
    )

    expect(screen.getByText('Alice Walker')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(
      screen.getByText('An absolute cinematic masterpiece with breathtaking sound design.')
    ).toBeInTheDocument()
    expect(screen.getByText('(14)')).toBeInTheDocument()
    expect(screen.getByText('Report')).toBeInTheDocument()
  })

  it('shows Edit and Delete buttons for own review', () => {
    const ownReview = {
      ...sampleReview,
      userId: { _id: 'user123', name: 'John Doe' },
    }

    render(
      <MemoryRouter>
        <ReviewCard review={ownReview} currentUserId="user123" onEdit={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.queryByText('Report')).not.toBeInTheDocument()
  })

  it('triggers onHelpful when Helpful button is clicked', async () => {
    const handleHelpful = vi.fn()
    render(
      <MemoryRouter>
        <ReviewCard review={sampleReview} currentUserId="user123" onHelpful={handleHelpful} />
      </MemoryRouter>
    )

    const helpfulBtn = screen.getByLabelText('Mark review as helpful')
    fireEvent.click(helpfulBtn)
    expect(handleHelpful).toHaveBeenCalledWith('rev_abc', true)
  })
})

describe('ReviewForm component', () => {
  it('renders form inputs and handles character count', () => {
    render(<ReviewForm tmdbId={100} mediaType="movie" />)

    expect(screen.getByText('Write a Review')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/What did you think of the directing/i)).toBeInTheDocument()
    expect(screen.getByText(/This review contains spoilers/i)).toBeInTheDocument()
    expect(screen.getByText('Post Review')).toBeInTheDocument()
  })

  it('validates min characters length before submitting', async () => {
    render(<ReviewForm tmdbId={100} mediaType="movie" />)

    const textarea = screen.getByPlaceholderText(/What did you think of the directing/i)
    fireEvent.change(textarea, { target: { value: 'Too short' } }) // 9 chars < 10

    const submitBtn = screen.getByText('Post Review')
    fireEvent.submit(submitBtn.closest('form'))

    await waitFor(() => {
      expect(screen.getByText(/Review must be at least 10 characters long/i)).toBeInTheDocument()
    })
  })
})
