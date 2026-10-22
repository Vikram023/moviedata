# 🎬 CineScope

> **Discover. Rate. Remember.**

A full-stack movie discovery, ratings, reviews, and recommendation platform built with React, Node.js, MongoDB, and the TMDB API.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Database Models](#database-models)
6. [API Routes](#api-routes)
7. [Prerequisites](#prerequisites)
8. [Installation](#installation)
9. [Environment Variables](#environment-variables)
10. [MongoDB Atlas Setup](#mongodb-atlas-setup)
11. [TMDB API Setup](#tmdb-api-setup)
12. [Running Locally](#running-locally)
13. [Database Seeding](#database-seeding)
14. [Running Tests](#running-tests)
15. [Deployment](#deployment)
16. [Security](#security)
17. [TMDB Attribution](#tmdb-attribution)
18. [Known Limitations](#known-limitations)

---

## Overview

CineScope is a production-ready movie discovery platform that integrates with The Movie Database (TMDB) to provide real-time movie and TV show data. Users can:

- Discover and browse movies and TV shows
- Read and write reviews
- Rate titles on a 1–10 scale
- Manage personal watchlists
- Get personalized recommendations
- Explore titles by mood
- Compare two movies side-by-side
- View their taste profile with analytics

---

## Features

### Must-Have (Implemented)
- ✅ Responsive home page with cinematic hero section
- ✅ Real movie data from TMDB API
- ✅ Movie and TV show detail pages
- ✅ Advanced search and discovery filters
- ✅ User registration and login (JWT + HTTP-only cookies)
- ✅ Community ratings (1–10 scale, per-user, with distribution chart)
- ✅ Written reviews with spoiler protection
- ✅ Watchlist with planned/watched status
- ✅ MongoDB persistence
- ✅ Admin dashboard with moderation tools

### Should-Have (Implemented)
- ✅ Full TV show support
- ✅ Personalized recommendations (genre-based + content-based)
- ✅ Custom movie lists (public/private)
- ✅ Watch history
- ✅ Rating distribution charts
- ✅ Helpful votes on reviews
- ✅ Advanced discover filters

### Advanced (Implemented)
- ✅ Mood-based movie discovery
- ✅ Movie comparison (side-by-side)
- ✅ Taste profile dashboard (Recharts visualizations)
- ✅ Hidden gems algorithm
- ✅ Review reporting and admin moderation

---

## Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS 3 | Styling |
| React Router v6 | Routing |
| Axios | HTTP client |
| React Hook Form | Form handling |
| Recharts | Data visualizations |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| JWT + HTTP-only Cookies | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| node-cache | In-memory caching |

### External Services
| Service | Purpose |
|---------|---------|
| TMDB API | Movie & TV metadata |
| MongoDB Atlas | Cloud database |
| Vercel | Frontend deployment |
| Render | Backend deployment |

---

## Architecture

```
cinescope/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # LoadingSpinner, EmptyState, Pagination, etc.
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── movies/        # MovieCard, HeroBanner, GenreCard, etc.
│   │   │   ├── ratings/       # RatingInput, RatingDistribution
│   │   │   └── reviews/       # ReviewCard, ReviewForm, ReviewSection
│   │   ├── context/           # AuthContext (global auth state)
│   │   ├── hooks/             # useWatchlist, useDebounce
│   │   ├── layouts/           # MainLayout (Navbar + Outlet + Footer)
│   │   ├── pages/             # Route-level page components
│   │   ├── services/          # API service layer (api.js, movieService.js)
│   │   ├── test/              # Vitest test files
│   │   └── utils/             # helpers.js (image URLs, formatting)
│   └── ...
│
└── server/                    # Node.js + Express backend
    ├── src/
    │   ├── config/            # db.js (MongoDB), tmdb.js (Axios instance)
    │   ├── controllers/       # Route handlers
    │   ├── middleware/        # auth, admin, error handlers
    │   ├── models/            # Mongoose schemas
    │   ├── routes/            # Express router definitions
    │   ├── services/          # tmdbService, ratingService, recommendationService
    │   ├── utils/             # ApiError, ApiResponse, asyncHandler
    │   └── validators/        # Zod schemas
    └── scripts/
        └── seedMovies.js      # Database seeder
```

### Data Flow

```
Browser → React (Vite) → API Service (Axios)
                              ↓
                    Express Backend (Node.js)
                         ↙         ↘
                   MongoDB        TMDB API
                (User data)    (Movie metadata)
```

**Key principle**: TMDB is the source of truth for movie metadata. MongoDB stores only user-generated data (ratings, reviews, watchlists, custom lists) and optional cached metadata.

---

## Database Models

### User
```js
{ name, email, passwordHash (hashed), profileImage, bio,
  favoriteGenres, favoriteMovies, role ('user'|'admin'),
  accountStatus ('active'|'disabled'), onboardingCompleted }
```

### Rating
```js
{ userId, tmdbId, mediaType ('movie'|'tv'), rating (1-10) }
// Unique index: userId + tmdbId + mediaType
```

### Review
```js
{ userId, tmdbId, mediaType, reviewText, containsSpoilers,
  helpfulCount, rating, moderationStatus }
```

### Watchlist
```js
{ userId, tmdbId, mediaType, status ('planned'|'watched'),
  title, posterPath, addedAt, watchedAt }
// Unique index: userId + tmdbId + mediaType
```

### CustomList
```js
{ userId, title, description, visibility ('public'|'private'),
  items: [{ tmdbId, mediaType, title, posterPath, order }] }
```

### HelpfulVote
```js
{ userId, reviewId }
// Unique index: userId + reviewId
```

### Report
```js
{ reporterId, targetType, targetId, reason, description,
  status, reviewedBy, adminNote }
```

---

## API Routes

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Users
```
GET    /api/users/:userId
PATCH  /api/users/me
GET    /api/users/:userId/reviews
GET    /api/users/:userId/lists
GET    /api/users/me/taste-profile
```

### TMDB Proxy
```
GET    /api/tmdb/trending
GET    /api/tmdb/movies/popular
GET    /api/tmdb/movies/top-rated
GET    /api/tmdb/movies/upcoming
GET    /api/tmdb/movies/:tmdbId
GET    /api/tmdb/movies/:tmdbId/credits
GET    /api/tmdb/movies/:tmdbId/videos
GET    /api/tmdb/movies/:tmdbId/similar
GET    /api/tmdb/tv/popular
GET    /api/tmdb/tv/top-rated
GET    /api/tmdb/tv/:tmdbId
GET    /api/tmdb/tv/:tmdbId/similar
GET    /api/tmdb/search
GET    /api/tmdb/genres
GET    /api/tmdb/discover/movies
GET    /api/tmdb/discover/tv
GET    /api/tmdb/person/:personId
```

### Ratings
```
POST   /api/ratings
GET    /api/ratings/:mediaType/:tmdbId
GET    /api/ratings/:mediaType/:tmdbId/me
DELETE /api/ratings/:ratingId
```

### Reviews
```
POST   /api/reviews
GET    /api/reviews/:mediaType/:tmdbId
PATCH  /api/reviews/:reviewId
DELETE /api/reviews/:reviewId
POST   /api/reviews/:reviewId/helpful
DELETE /api/reviews/:reviewId/helpful
POST   /api/reviews/:reviewId/report
```

### Watchlist
```
GET    /api/watchlist
POST   /api/watchlist
PATCH  /api/watchlist/:entryId
DELETE /api/watchlist/:entryId
GET    /api/watchlist/check/:mediaType/:tmdbId
```

### Custom Lists
```
GET    /api/lists/:listId
POST   /api/lists
PATCH  /api/lists/:listId
DELETE /api/lists/:listId
POST   /api/lists/:listId/items
DELETE /api/lists/:listId/items/:itemId
```

### Recommendations
```
GET    /api/recommendations
GET    /api/recommendations/similar/:mediaType/:tmdbId
GET    /api/recommendations/hidden-gems
POST   /api/recommendations/mood
```

### Admin (admin role required)
```
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:userId/status
GET    /api/admin/reports
PATCH  /api/admin/reports/:reportId
```

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB Atlas** account (free tier works)
- **TMDB API** account (free)

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd cinescope

# Install all dependencies (root + server + client)
npm run install:all
```

---

## Environment Variables

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/cinescope
JWT_SECRET=<your-64-char-random-secret>
TMDB_API_KEY=<your-tmdb-api-key>
TMDB_ACCESS_TOKEN=<your-tmdb-read-access-token>
TMDB_BASE_URL=https://api.themoviedb.org/3
CLIENT_URL=http://localhost:5173
COOKIE_SECRET=<your-cookie-secret>
```

> **Security**: Never commit actual secrets. Generate strong secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new **M0 (Free)** cluster
3. Under **Database Access**, create a user with read/write permissions
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development)
5. Click **Connect → Connect your application** and copy the connection string
6. Replace `<password>` in the string and set it as `MONGODB_URI`

---

## TMDB API Setup

1. Create a free account at [themoviedb.org](https://www.themoviedb.org)
2. Go to **Settings → API**
3. Request an API key (select **Developer** for personal/educational use)
4. Copy:
   - **API Key (v3 auth)** → `TMDB_API_KEY`
   - **API Read Access Token (v4 auth)** → `TMDB_ACCESS_TOKEN`

The app uses the Bearer token (v4) by default. The API key is a fallback.

---

## Running Locally

```bash
# Run both client and server concurrently
npm run dev

# Or run separately:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

The API health check is available at: `http://localhost:5000/api/health`

---

## Database Seeding

Seed the database with popular movies and TV shows from TMDB:

```bash
cd server
npm run seed
```

Options:
```bash
SEED_PAGES=5 npm run seed   # Seed 5 pages per category (default: 3)
```

The seeder:
- Fetches popular, top-rated, and upcoming movies
- Fetches popular and top-rated TV shows
- Uses upsert to avoid duplicates
- Respects TMDB rate limits (250ms between requests)
- Can be re-run safely

---

## Running Tests

### Backend Tests

```bash
cd server

# Requires MONGODB_URI set in server/.env
npm test
```

Tests cover:
- User registration and duplicate rejection
- Login and session management
- Rating CRUD and duplicate prevention
- Review CRUD and ownership
- Watchlist operations
- Admin authorization (403 for regular users)

### Frontend Tests

```bash
cd client
npm test
```

Tests cover:
- AuthContext session handling
- Utility functions (image URLs, formatting, ratings)

---

## Deployment

### Backend (Render)

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set:
   - **Build command**: `cd server && npm install`
   - **Start command**: `node server.js`
   - **Root directory**: `server`
4. Add all environment variables from `server/.env`
5. Set `NODE_ENV=production`
6. Set `CLIENT_URL` to your deployed frontend URL

### Frontend (Vercel)

1. Import your repository on [vercel.com](https://vercel.com)
2. Set:
   - **Framework preset**: Vite
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### Production Checklist

- [ ] `NODE_ENV=production` on backend
- [ ] `COOKIE_SECRET` set to a strong random value
- [ ] MongoDB Atlas network access configured (restrict to Render IPs)
- [ ] `CLIENT_URL` set to the exact Vercel deployment URL
- [ ] CORS configured for production origin only
- [ ] HTTPS enabled on both services (automatic on Vercel/Render)

---

## Security

### Implemented
- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens stored in HTTP-only cookies (inaccessible to JavaScript)
- Secure + SameSite cookie flags in production
- Helmet for security headers
- Rate limiting on auth routes (20 requests/15 min)
- Zod validation on all request bodies
- Role-based access control (admin vs user)
- Ownership checks on all user-generated content
- Error messages don't leak stack traces in production
- No credentials in frontend code

### Not Implemented (Production Recommendations)
- CSRF tokens (mitigated by SameSite cookie + CORS)
- Refresh token rotation
- Email verification
- Account lockout after failed attempts

---

## TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie data, images, and metadata are provided by [The Movie Database (TMDB)](https://www.themoviedb.org).

For TMDB's terms of use and attribution requirements, see: [themoviedb.org/about/logos-attribution](https://www.themoviedb.org/about/logos-attribution)

---

## Known Limitations

1. **In-memory cache**: The node-cache instance is process-local. If running multiple server instances, each has its own cache. For multi-instance deployments, use Redis.
2. **Image hosting**: All images are served directly from TMDB's CDN. Image availability depends on TMDB.
3. **No AI recommendations**: The recommendation engine uses algorithmic weighting (genres, ratings), not machine learning.
4. **Test database**: Backend tests require a real MongoDB connection. For CI/CD, use a separate test Atlas cluster or MongoDB Memory Server.
5. **TMDB rate limits**: Free TMDB accounts have rate limits. The seeder includes delays to respect them.

---

## Recommendation Algorithm

CineScope uses a transparent weighted scoring system:

| Factor | Weight |
|--------|--------|
| Genre similarity | 40% |
| Cast similarity | 20% |
| Director similarity | 15% |
| Keyword similarity | 15% |
| User preference match | 10% |

For the hidden gems feature, titles are filtered by:
- `vote_average >= 7.0`
- `vote_count` between 50 and 5,000

These weights are configurable in `server/src/services/recommendationService.js`.
#   m o v i e d a t a  
 