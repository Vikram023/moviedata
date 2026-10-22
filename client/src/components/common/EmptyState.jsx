import React from 'react'
import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

const EmptyState = ({
  icon: Icon = Film,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  actionText,
  onAction,
  actionLink,
  actionIcon: ActionIcon,
  className = '',
  children,
}) => {
  const label = actionLabel || actionText

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-cs-card/40 border border-cs-border rounded-2xl max-w-lg mx-auto backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      {/* Icon with glowing ambient backdrop */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-cs-accent/10 blur-xl" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cs-bg-secondary border border-cs-border flex items-center justify-center text-cs-accent shadow-cs">
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-cs-accent" strokeWidth={1.75} />
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl sm:text-2xl font-bold text-cs-text tracking-tight mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-cs-text-secondary max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Custom children or Action Button */}
      {children}

      {label && (
        <div className="mt-2">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cs-accent text-cs-bg font-semibold text-sm hover:bg-yellow-400 active:scale-95 transition-all shadow-lg hover:shadow-cs-accent/30"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              <span>{label}</span>
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cs-accent text-cs-bg font-semibold text-sm hover:bg-yellow-400 active:scale-95 transition-all shadow-lg hover:shadow-cs-accent/30"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              <span>{label}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default EmptyState
