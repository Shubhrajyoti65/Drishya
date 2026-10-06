import React, { forwardRef } from 'react'

/**
 * NeuInput - Carved-in tactile input field with inset shadows.
 * Meets WCAG AA contrast with crisp text and visible accent focus ring.
 */
export const NeuInput = forwardRef(function NeuInput(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-sora font-semibold text-neu-text-secondary tracking-wide"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-neu-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-2xl
            bg-neu-surface text-neu-text
            placeholder:text-neu-text-muted
            border border-neu-border
            shadow-neu-inset-sm
            text-sm font-sans
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-crimson/50 focus:border-crimson/60
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-crimson focus:ring-crimson' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-crimson font-sora font-medium mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-neu-text-muted font-sans mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
})

/**
 * NeuTextarea - Carved-in tactile multiline input.
 */
export const NeuTextarea = forwardRef(function NeuTextarea(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    rows = 3,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-sora font-semibold text-neu-text-secondary tracking-wide"
        >
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-2xl
          bg-neu-surface text-neu-text
          placeholder:text-neu-text-muted
          border border-neu-border
          shadow-neu-inset-sm
          text-sm font-sans resize-none
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-crimson/50 focus:border-crimson/60
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-crimson focus:ring-crimson' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-crimson font-sora font-medium mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-neu-text-muted font-sans mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
})

export default NeuInput
