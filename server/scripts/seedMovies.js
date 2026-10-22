const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const tmdbClient = require('../src/config/tmdb');
const MovieCache = require('../src/models/MovieCache');

const PAGE_COUNT = parseInt(process.env.SEED_PAGES || '3');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const upsertMovies = async (movies, mediaType) => {
  let count = 0;
  for (const movie of movies) {
    try {
      await MovieCache.findOneAndUpdate(
        { tmdbId: movie.id, mediaType },
        {
          tmdbId: movie.id,
          mediaType,
          title: movie.title || movie.name,
          overview: movie.overview,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date || movie.first_air_date,
          genres: movie.genre_ids?.map((id) => ({ id })) || [],
          externalRating: movie.vote_average,
          externalVoteCount: movie.vote_count,
          popularity: movie.popularity,
          originalLanguage: movie.original_language,
          metadataUpdatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      count++;
    } catch (err) {
      console.error(`Failed to upsert ${mediaType} ${movie.id}: ${err.message}`);
    }
  }
  return count;
};

const fetchAndSeed = async (endpoint, mediaType, label) => {
  let total = 0;
  for (let page = 1; page <= PAGE_COUNT; page++) {
    try {
      const { data } = await tmdbClient.get(endpoint, { params: { page } });
      const count = await upsertMovies(data.results, mediaType);
      total += count;
      console.log(`  [${label}] Page ${page}/${PAGE_COUNT} — ${count} upserted`);
      await delay(250); // Respect TMDB rate limits
    } catch (err) {
      console.error(`  [${label}] Page ${page} failed: ${err.message}`);
    }
  }
  return total;
};

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set. Copy server/.env.example to server/.env and fill in credentials.');
    process.exit(1);
  }

  console.log('🌱 CineScope Database Seeder');
  console.log(`   Seeding ${PAGE_COUNT} pages per category (set SEED_PAGES env var to change)\n`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const tasks = [
    { endpoint: '/movie/popular', mediaType: 'movie', label: 'Popular Movies' },
    { endpoint: '/movie/top_rated', mediaType: 'movie', label: 'Top-Rated Movies' },
    { endpoint: '/movie/upcoming', mediaType: 'movie', label: 'Upcoming Movies' },
    { endpoint: '/tv/popular', mediaType: 'tv', label: 'Popular TV Shows' },
    { endpoint: '/tv/top_rated', mediaType: 'tv', label: 'Top-Rated TV Shows' },
  ];

  let grandTotal = 0;
  for (const task of tasks) {
    console.log(`📥 Seeding: ${task.label}`);
    const count = await fetchAndSeed(task.endpoint, task.mediaType, task.label);
    grandTotal += count;
    console.log(`   ✅ ${count} records upserted\n`);
  }

  const dbTotal = await MovieCache.countDocuments();
  console.log(`\n🎬 Seeding complete!`);
  console.log(`   Records upserted this run: ${grandTotal}`);
  console.log(`   Total records in DB: ${dbTotal}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
