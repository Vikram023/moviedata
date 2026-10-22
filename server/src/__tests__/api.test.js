require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Rating = require('../models/Rating');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');

// Use a test database
const MONGODB_TEST_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinescope_test';

let authCookie;
let testUserId;
let testRatingId;
let testReviewId;
let testWatchlistId;

beforeAll(async () => {
  await mongoose.connect(MONGODB_TEST_URI);
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({ email: /@cinescope-test\.com$/ });
  await Rating.deleteMany({ tmdbId: 99999 });
  await Review.deleteMany({ tmdbId: 99999 });
  await Watchlist.deleteMany({ tmdbId: 99999 });
  await mongoose.disconnect();
});

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe('Authentication', () => {
  it('POST /api/auth/register — registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user1@cinescope-test.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('user1@cinescope-test.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    testUserId = res.body.data.user._id;
  });

  it('POST /api/auth/register — rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user1@cinescope-test.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — logs in successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@cinescope-test.com', password: 'Test1234!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    // Extract auth cookie for subsequent requests
    authCookie = res.headers['set-cookie'];
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@cinescope-test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — returns authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('user1@cinescope-test.com');
  });

  it('GET /api/auth/me — returns 401 without cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/logout — clears cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
  });
});

// ─── Re-login for remaining tests ────────────────────────────────────────────
beforeEach(async () => {
  if (!authCookie) {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@cinescope-test.com', password: 'Test1234!' });
    authCookie = res.headers['set-cookie'];
  }
});

// ─── Rating Tests ─────────────────────────────────────────────────────────────
describe('Ratings', () => {
  it('POST /api/ratings — creates a rating', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Cookie', authCookie)
      .send({ tmdbId: 99999, mediaType: 'movie', rating: 8 });

    expect(res.status).toBe(201);
    expect(res.body.data.rating.rating).toBe(8);
    testRatingId = res.body.data.rating._id;
  });

  it('POST /api/ratings — updates existing rating (upsert)', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Cookie', authCookie)
      .send({ tmdbId: 99999, mediaType: 'movie', rating: 9 });

    expect(res.status).toBe(200);
    expect(res.body.data.rating.rating).toBe(9);
  });

  it('GET /api/ratings/movie/99999 — returns community stats', async () => {
    const res = await request(app).get('/api/ratings/movie/99999');
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBeGreaterThan(0);
    expect(res.body.data.average).toBeDefined();
  });

  it('DELETE /api/ratings/:id — deletes the rating', async () => {
    const res = await request(app)
      .delete(`/api/ratings/${testRatingId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
  });

  it('POST /api/ratings — rejects rating > 10', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Cookie', authCookie)
      .send({ tmdbId: 99999, mediaType: 'movie', rating: 11 });

    expect(res.status).toBe(400);
  });
});

// ─── Review Tests ─────────────────────────────────────────────────────────────
describe('Reviews', () => {
  it('POST /api/reviews — creates a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Cookie', authCookie)
      .send({
        tmdbId: 99999,
        mediaType: 'movie',
        reviewText: 'This is a great test movie. Very well made and entertaining.',
        containsSpoilers: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.review.reviewText).toContain('great test movie');
    testReviewId = res.body.data.review._id;
  });

  it('GET /api/reviews/movie/99999 — retrieves reviews', async () => {
    const res = await request(app).get('/api/reviews/movie/99999');
    expect(res.status).toBe(200);
    expect(res.body.data.reviews.length).toBeGreaterThan(0);
  });

  it('PATCH /api/reviews/:id — updates own review', async () => {
    const res = await request(app)
      .patch(`/api/reviews/${testReviewId}`)
      .set('Cookie', authCookie)
      .send({ reviewText: 'Updated review text with more detail about the film.' });

    expect(res.status).toBe(200);
    expect(res.body.data.review.reviewText).toContain('Updated review text');
  });

  it('DELETE /api/reviews/:id — deletes own review', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${testReviewId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
  });
});

// ─── Watchlist Tests ──────────────────────────────────────────────────────────
describe('Watchlist', () => {
  it('POST /api/watchlist — adds a title', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .set('Cookie', authCookie)
      .send({ tmdbId: 99999, mediaType: 'movie', title: 'Test Movie' });

    expect(res.status).toBe(201);
    testWatchlistId = res.body.data.item._id;
  });

  it('POST /api/watchlist — rejects duplicate', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .set('Cookie', authCookie)
      .send({ tmdbId: 99999, mediaType: 'movie', title: 'Test Movie' });

    expect(res.status).toBe(409);
  });

  it('GET /api/watchlist — returns watchlist items', async () => {
    const res = await request(app)
      .get('/api/watchlist')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('PATCH /api/watchlist/:id — marks as watched', async () => {
    const res = await request(app)
      .patch(`/api/watchlist/${testWatchlistId}`)
      .set('Cookie', authCookie)
      .send({ status: 'watched' });

    expect(res.status).toBe(200);
    expect(res.body.data.item.status).toBe('watched');
  });

  it('DELETE /api/watchlist/:id — removes item', async () => {
    const res = await request(app)
      .delete(`/api/watchlist/${testWatchlistId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
  });
});

// ─── Admin Tests ──────────────────────────────────────────────────────────────
describe('Admin Authorization', () => {
  it('GET /api/admin/dashboard — rejects regular users', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', authCookie);

    expect(res.status).toBe(403);
  });

  it('GET /api/admin/dashboard — rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
