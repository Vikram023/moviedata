const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string().optional(),
}).refine((d) => !d.confirmPassword || d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

const ratingSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  rating: z.number().int().min(1).max(10),
});

const reviewSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  reviewText: z.string().min(10).max(5000).trim(),
  containsSpoilers: z.boolean().optional().default(false),
  rating: z.number().int().min(1).max(10).optional(),
});

const watchlistSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().optional(),
  posterPath: z.string().optional(),
  releaseDate: z.string().optional(),
  externalRating: z.number().optional(),
});

const listSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional().default(''),
  visibility: z.enum(['public', 'private']).optional().default('private'),
});

const listItemSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().optional(),
  posterPath: z.string().optional(),
  releaseDate: z.string().optional(),
});

const reportSchema = z.object({
  targetType: z.enum(['review', 'user']),
  targetId: z.string().min(1),
  reason: z.enum(['spam', 'offensive', 'spoiler', 'harassment', 'misinformation', 'other']),
  description: z.string().max(1000).optional().default(''),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  ratingSchema,
  reviewSchema,
  watchlistSchema,
  listSchema,
  listItemSchema,
  reportSchema,
};

const diarySchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']).optional().default('movie'),
  title: z.string().min(1).trim(),
  posterPath: z.string().optional().default(''),
  backdropPath: z.string().optional().default(''),
  releaseDate: z.string().optional().default(''),
  watchedDate: z.string().optional(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  isRewatch: z.boolean().optional().default(false),
  watchMethod: z.enum(['theater', 'streaming', 'physical_media', 'tv', 'other']).optional().default('streaming'),
  notes: z.string().max(3000).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

const diaryUpdateSchema = z.object({
  watchedDate: z.string().optional(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  isRewatch: z.boolean().optional(),
  watchMethod: z.enum(['theater', 'streaming', 'physical_media', 'tv', 'other']).optional(),
  notes: z.string().max(3000).optional(),
  tags: z.array(z.string()).optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  ratingSchema,
  reviewSchema,
  watchlistSchema,
  listSchema,
  listItemSchema,
  reportSchema,
  diarySchema,
  diaryUpdateSchema,
};
