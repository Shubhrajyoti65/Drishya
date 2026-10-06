import React from 'react'

/**
 * NeuSkeleton - Carved-in tactile placeholder with soft neumorphic pulse.
 */
export default function NeuSkeleton({
  className = '',
  rounded = 'rounded-2xl',
  height = 'h-5',
  width = 'w-full',
  ...props
}) {
  return (
    <div
      aria-hidden="true"
      className={`
        bg-neu-surface shadow-neu-inset-xs border border-neu-border
        animate-pulse
        ${rounded}
        ${height}
        ${width}
        ${className}
      `}
      {...props}
    />
  )
}
