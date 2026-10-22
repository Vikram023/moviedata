import React from 'react'
import { Link } from 'react-router-dom'
import { Film, Github, Twitter, Youtube, Compass, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const exploreLinks = [
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv' },
    { label: 'Discover', path: '/discover' },
    { label: 'Mood Discovery', path: '/mood' },
    { label: 'Compare Titles', path: '/compare' },
  ]

  const featureLinks = [
    { label: 'Watchlist', path: '/watchlist' },
    { label: 'Recommendations', path: '/recommendations' },
    { label: 'Taste Profile', path: '/taste-profile' },
    { label: 'Custom Lists', path: '/my-lists' },
    { label: 'My Reviews', path: '/my-reviews' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', path: '#' },
    { label: 'Terms of Service', path: '#' },
    { label: 'API & Attribution', path: '#' },
    { label: 'Contact Support', path: '#' },
  ]

  return (
    <footer className="bg-cs-bg border-t border-cs-border relative overflow-hidden text-cs-text-secondary">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cs-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand & About Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-cs-card border border-cs-border flex items-center justify-center text-cs-accent shadow-cs group-hover:border-cs-accent/60 transition-colors">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-wider text-cs-text">
                CINE<span className="text-cs-accent">SCOPE</span>
              </span>
            </Link>

            <p className="text-cs-accent font-medium text-sm tracking-wide">
              Discover. Rate. Remember.
            </p>

            <p className="text-sm text-cs-text-secondary/80 max-w-sm leading-relaxed">
              Your personal cinema companion. Explore trending movies, curate your watchlist,
              uncover personalized recommendations, and analyze your cinematic taste profile.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-cs-card border border-cs-border flex items-center justify-center text-cs-text-secondary hover:text-cs-accent hover:border-cs-accent/50 hover:bg-cs-bg-secondary transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-lg bg-cs-card border border-cs-border flex items-center justify-center text-cs-text-secondary hover:text-cs-accent hover:border-cs-accent/50 hover:bg-cs-bg-secondary transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-cs-card border border-cs-border flex items-center justify-center text-cs-text-secondary hover:text-cs-accent hover:border-cs-accent/50 hover:bg-cs-bg-secondary transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cs-text">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="hover:text-cs-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cs-text">
              Features
            </h4>
            <ul className="space-y-2.5 text-sm">
              {featureLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="hover:text-cs-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TMDB Attribution & Legal Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cs-text">
              TMDB Attribution
            </h4>
            <div className="p-3.5 rounded-xl bg-cs-card/80 border border-cs-border space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#01b4e4]/20 border border-[#01b4e4]/40 text-[#01b4e4] font-black text-xs tracking-wider">
                  TMDB
                </span>
                <span className="text-xs text-cs-text font-semibold">The Movie Database</span>
              </div>
              <p className="text-xs text-cs-text-secondary/80 leading-relaxed">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
            <ul className="space-y-2 text-xs pt-1">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-cs-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cs-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cs-text-secondary/70">
          <p>© {currentYear} CineScope. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted for movie buffs with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> and cinema passion
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
