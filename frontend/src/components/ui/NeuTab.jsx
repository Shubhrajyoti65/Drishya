import React from 'react'

/**
 * NeuTab - Tactile physical mode switcher button.
 * Depressed inset when active; raised tactile pillow when inactive.
 */
export default function NeuTab({
  active = false,
  onClick,
  icon: Icon,
  label,
  subtitle,
  badge,
  accentColor = 'crimson', // 'crimson' | 'blue' | 'amber'
  className = '',
  ...props
}) {
  const accentDetails = {
    crimson: {
      activeBorder: 'border-crimson/50',
      activeText: 'text-crimson',
      iconBg: 'bg-crimson/15 text-crimson',
      badgeBg: 'bg-crimson text-white',
    },
    blue: {
      activeBorder: 'border-blueAccent/50',
      activeText: 'text-blueAccent',
      iconBg: 'bg-blueAccent/15 text-blueAccent',
      badgeBg: 'bg-blueAccent text-white',
    },
    amber: {
      activeBorder: 'border-amber-500/50',
      activeText: 'text-amber-500',
      iconBg: 'bg-amber-500/15 text-amber-500',
      badgeBg: 'bg-amber-500 text-white',
    },
  }[accentColor]

  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`
        p-4 sm:p-5 rounded-3xl text-left
        transition-all duration-200 select-none
        border border-neu-border
        ${
          active
            ? `bg-neu-surface shadow-neu-inset ${accentDetails.activeBorder}`
            : 'bg-neu-surface shadow-neu-raised hover:-translate-y-0.5 hover:shadow-neu-raised-lg'
        }
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start gap-3.5">
        {Icon && (
          <div
            className={`
              w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors
              ${active ? accentDetails.iconBg : 'bg-neu-hover text-neu-text-secondary'}
            `}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-sora font-bold text-sm sm:text-base truncate ${
                active ? accentDetails.activeText : 'text-neu-text'
              }`}
            >
              {label}
            </h3>
            {badge && (
              <span
                className={`text-[10px] font-sora font-bold px-2 py-0.5 rounded-full ${
                  active ? accentDetails.badgeBg : 'bg-neu-hover text-neu-text-muted'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-neu-text-muted mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
