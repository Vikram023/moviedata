import React from 'react'
import {
  Flame,
  Compass,
  Sparkles,
  Smile,
  ShieldAlert,
  FileVideo,
  HeartHandshake,
  Heart,
  Ghost,
  Music,
  HelpCircle,
  Rocket,
  Tv,
  Skull,
  Radio,
  Swords,
  Crown,
  Trees,
  Theater,
} from 'lucide-react'

// Genre-specific theme definitions (Gradients, Accent borders, and Icons)
const GENRE_THEMES = {
  // Action (28)
  28: {
    gradient: 'from-red-600 via-rose-700 to-amber-700',
    icon: Flame,
    accent: 'border-red-500/40',
  },
  action: {
    gradient: 'from-red-600 via-rose-700 to-amber-700',
    icon: Flame,
    accent: 'border-red-500/40',
  },

  // Adventure (12)
  12: {
    gradient: 'from-emerald-600 via-teal-700 to-cyan-900',
    icon: Compass,
    accent: 'border-emerald-500/40',
  },
  adventure: {
    gradient: 'from-emerald-600 via-teal-700 to-cyan-900',
    icon: Compass,
    accent: 'border-emerald-500/40',
  },

  // Animation (16)
  16: {
    gradient: 'from-purple-500 via-fuchsia-600 to-pink-500',
    icon: Sparkles,
    accent: 'border-fuchsia-500/40',
  },
  animation: {
    gradient: 'from-purple-500 via-fuchsia-600 to-pink-500',
    icon: Sparkles,
    accent: 'border-fuchsia-500/40',
  },

  // Comedy (35)
  35: {
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    icon: Smile,
    accent: 'border-amber-500/40',
  },
  comedy: {
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    icon: Smile,
    accent: 'border-amber-500/40',
  },

  // Crime (80)
  80: {
    gradient: 'from-zinc-700 via-stone-800 to-red-950',
    icon: ShieldAlert,
    accent: 'border-zinc-500/40',
  },
  crime: {
    gradient: 'from-zinc-700 via-stone-800 to-red-950',
    icon: ShieldAlert,
    accent: 'border-zinc-500/40',
  },

  // Documentary (99)
  99: {
    gradient: 'from-cyan-600 via-sky-700 to-blue-900',
    icon: FileVideo,
    accent: 'border-cyan-500/40',
  },
  documentary: {
    gradient: 'from-cyan-600 via-sky-700 to-blue-900',
    icon: FileVideo,
    accent: 'border-cyan-500/40',
  },

  // Drama (18)
  18: {
    gradient: 'from-indigo-600 via-purple-700 to-slate-900',
    icon: Theater,
    accent: 'border-indigo-500/40',
  },
  drama: {
    gradient: 'from-indigo-600 via-purple-700 to-slate-900',
    icon: Theater,
    accent: 'border-indigo-500/40',
  },

  // Family (10751)
  10751: {
    gradient: 'from-teal-500 via-emerald-600 to-cyan-700',
    icon: HeartHandshake,
    accent: 'border-teal-500/40',
  },
  family: {
    gradient: 'from-teal-500 via-emerald-600 to-cyan-700',
    icon: HeartHandshake,
    accent: 'border-teal-500/40',
  },

  // Fantasy (14)
  14: {
    gradient: 'from-purple-600 via-indigo-700 to-violet-950',
    icon: Crown,
    accent: 'border-purple-500/40',
  },
  fantasy: {
    gradient: 'from-purple-600 via-indigo-700 to-violet-950',
    icon: Crown,
    accent: 'border-purple-500/40',
  },

  // History (36)
  36: {
    gradient: 'from-stone-600 via-amber-800 to-stone-900',
    icon: Trees,
    accent: 'border-stone-500/40',
  },
  history: {
    gradient: 'from-stone-600 via-amber-800 to-stone-900',
    icon: Trees,
    accent: 'border-stone-500/40',
  },

  // Horror (27)
  27: {
    gradient: 'from-red-950 via-zinc-900 to-black',
    icon: Skull,
    accent: 'border-red-700/50',
  },
  horror: {
    gradient: 'from-red-950 via-zinc-900 to-black',
    icon: Skull,
    accent: 'border-red-700/50',
  },

  // Music (10402)
  10402: {
    gradient: 'from-rose-500 via-pink-600 to-purple-800',
    icon: Music,
    accent: 'border-rose-500/40',
  },
  music: {
    gradient: 'from-rose-500 via-pink-600 to-purple-800',
    icon: Music,
    accent: 'border-rose-500/40',
  },

  // Mystery (9648)
  9648: {
    gradient: 'from-violet-800 via-slate-800 to-zinc-950',
    icon: HelpCircle,
    accent: 'border-violet-500/40',
  },
  mystery: {
    gradient: 'from-violet-800 via-slate-800 to-zinc-950',
    icon: HelpCircle,
    accent: 'border-violet-500/40',
  },

  // Romance (10749)
  10749: {
    gradient: 'from-rose-500 via-pink-600 to-red-700',
    icon: Heart,
    accent: 'border-rose-500/40',
  },
  romance: {
    gradient: 'from-rose-500 via-pink-600 to-red-700',
    icon: Heart,
    accent: 'border-rose-500/40',
  },

  // Science Fiction (878)
  878: {
    gradient: 'from-blue-600 via-cyan-600 to-indigo-900',
    icon: Rocket,
    accent: 'border-cyan-500/40',
  },
  'science fiction': {
    gradient: 'from-blue-600 via-cyan-600 to-indigo-900',
    icon: Rocket,
    accent: 'border-cyan-500/40',
  },
  'sci-fi & fantasy': {
    gradient: 'from-blue-600 via-cyan-600 to-indigo-900',
    icon: Rocket,
    accent: 'border-cyan-500/40',
  },

  // TV Movie (10770)
  10770: {
    gradient: 'from-blue-700 via-indigo-800 to-slate-900',
    icon: Tv,
    accent: 'border-blue-500/40',
  },

  // Thriller (53)
  53: {
    gradient: 'from-orange-700 via-red-800 to-neutral-900',
    icon: Ghost,
    accent: 'border-orange-500/40',
  },
  thriller: {
    gradient: 'from-orange-700 via-red-800 to-neutral-900',
    icon: Ghost,
    accent: 'border-orange-500/40',
  },

  // War (10752)
  10752: {
    gradient: 'from-stone-700 via-yellow-950 to-neutral-900',
    icon: Swords,
    accent: 'border-yellow-700/40',
  },
  war: {
    gradient: 'from-stone-700 via-yellow-950 to-neutral-900',
    icon: Swords,
    accent: 'border-yellow-700/40',
  },

  // Western (37)
  37: {
    gradient: 'from-amber-700 via-orange-800 to-stone-900',
    icon: Radio,
    accent: 'border-amber-600/40',
  },
  western: {
    gradient: 'from-amber-700 via-orange-800 to-stone-900',
    icon: Radio,
    accent: 'border-amber-600/40',
  },
}

// Fallback theme for unmapped genres
const DEFAULT_THEME = {
  gradient: 'from-zinc-700 via-slate-800 to-zinc-900',
  icon: Sparkles,
  accent: 'border-zinc-500/40',
}

/**
 * GenreCard component
 * Large clickable card with unique genre gradients, watermark icon, and hover scale effect.
 *
 * @param {Object} props
 * @param {Object} props.genre - Genre object { id, name }
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.isActive=false] - Whether this genre is currently selected
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Card sizing
 * @param {string} [props.className=''] - Additional custom CSS
 */
const GenreCard = ({
  genre,
  onClick,
  isActive = false,
  size = 'md',
  className = '',
}) => {
  if (!genre) return null

  const genreId = genre.id
  const genreName = genre.name || 'Genre'
  const lookupKey = genreName.toLowerCase().trim()

  // Match by ID first, then by normalized name, else fallback
  const theme =
    GENRE_THEMES[genreId] || GENRE_THEMES[lookupKey] || DEFAULT_THEME
  const IconComponent = theme.icon

  const sizeClasses = {
    sm: 'h-20 sm:h-24 p-3.5',
    md: 'h-28 sm:h-32 p-4 sm:p-5',
    lg: 'h-36 sm:h-44 p-6',
  }

  const iconSizes = {
    sm: 44,
    md: 68,
    lg: 88,
  }

  const currentSize = sizeClasses[size] || sizeClasses.md
  const currentIconSize = iconSizes[size] || iconSizes.md

  return (
    <button
      type="button"
      onClick={() => onClick?.(genre)}
      className={`group relative w-full rounded-2xl overflow-hidden bg-gradient-to-br ${theme.gradient} ${currentSize} text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-cs hover:shadow-cs-lg border ${
        isActive
          ? 'border-cs-accent ring-2 ring-cs-accent/60 shadow-cs-accent'
          : `${theme.accent} hover:border-cs-accent/70`
      } ${className}`}
      aria-label={`Select genre ${genreName}`}
    >
      {/* Dark gradient overlay for typography legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

      {/* Decorative large watermark icon */}
      <div className="absolute -right-3 -bottom-3 text-white/[0.08] group-hover:text-white/[0.16] group-hover:scale-110 transition-all duration-300 pointer-events-none">
        <IconComponent size={currentIconSize} strokeWidth={1.5} />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="flex items-center gap-2">
          {/* Subtle indicator bar for active/hover */}
          <span
            className={`h-4 w-1 rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-cs-accent'
                : 'bg-white/40 group-hover:bg-cs-accent group-hover:h-5'
            }`}
          />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-cs-accent transition-colors duration-200 drop-shadow-sm">
            {genreName}
          </h3>
        </div>
      </div>
    </button>
  )
}

export default GenreCard
