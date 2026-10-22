import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Film, Sparkles, Compass, Tv, ArrowRight, Clapperboard } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[85vh] bg-cs-bg flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 select-none">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* Visual Element: Cinematic Clapperboard */}
        <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
          {/* Ambient yellow spotlight behind */}
          <div className="absolute inset-0 bg-cs-accent/15 blur-2xl rounded-full animate-pulse-slow" />

          {/* Clapperboard Graphic Container */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-cs-card border border-cs-border hover:border-cs-accent/50 shadow-cs-lg flex flex-col items-center justify-center p-4 transition-all duration-300">
            {/* Clapper top stripes */}
            <div className="w-full h-5 rounded-md bg-cs-bg-secondary flex overflow-hidden mb-2 border border-cs-border/60">
              <div className="w-1/4 h-full bg-cs-accent/80 skew-x-[-20deg]" />
              <div className="w-1/4 h-full bg-transparent" />
              <div className="w-1/4 h-full bg-cs-accent/80 skew-x-[-20deg]" />
              <div className="w-1/4 h-full bg-transparent" />
            </div>

            <Clapperboard className="w-12 h-12 sm:w-16 sm:h-16 text-cs-accent animate-bounce" strokeWidth={1.5} />
          </div>

          {/* Floating '404' Badge */}
          <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-cs-accent text-cs-bg text-xs sm:text-sm font-extrabold shadow-cs-accent border border-yellow-400">
            404
          </div>
        </div>

        {/* Cinematic Headline & Explanation */}
        <div className="space-y-3">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-cs-accent">
            Scene Missing • Cut From Final Edit
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Lost on the Cutting Room Floor
          </h1>
          <p className="text-sm sm:text-base text-cs-text-secondary max-w-lg mx-auto leading-relaxed">
            The page you are looking for has been trimmed from the sequence, renamed, or never made it past pre-production.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-cs-accent text-cs-bg font-bold text-sm sm:text-base hover:bg-yellow-400 active:scale-95 transition-all shadow-cs-accent shadow-md hover:shadow-lg"
          >
            <Home size={18} className="stroke-[2.5]" />
            <span>Go Back to Premiere (Home)</span>
          </Link>
        </div>

        {/* Alternative Suggestions */}
        <div className="pt-8 border-t border-cs-border/80">
          <p className="text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-4">
            Or resume your cinematic journey here:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <Link
              to="/movies?sort=popularity.desc"
              className="p-3.5 rounded-xl bg-cs-card/80 border border-cs-border hover:border-cs-accent/40 text-center group transition-all"
            >
              <Film size={18} className="mx-auto mb-1.5 text-cs-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-cs-text group-hover:text-cs-accent transition-colors block">
                Trending Movies
              </span>
            </Link>

            <Link
              to="/movies?sort=vote_average.desc"
              className="p-3.5 rounded-xl bg-cs-card/80 border border-cs-border hover:border-cs-accent/40 text-center group transition-all"
            >
              <Sparkles size={18} className="mx-auto mb-1.5 text-cs-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-cs-text group-hover:text-cs-accent transition-colors block">
                Top Rated
              </span>
            </Link>

            <Link
              to="/tv"
              className="p-3.5 rounded-xl bg-cs-card/80 border border-cs-border hover:border-cs-accent/40 text-center group transition-all"
            >
              <Tv size={18} className="mx-auto mb-1.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-cs-text group-hover:text-blue-400 transition-colors block">
                TV Shows
              </span>
            </Link>

            <Link
              to="/discover"
              className="p-3.5 rounded-xl bg-cs-card/80 border border-cs-border hover:border-cs-accent/40 text-center group transition-all"
            >
              <Compass size={18} className="mx-auto mb-1.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-cs-text group-hover:text-emerald-400 transition-colors block">
                Discover
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
