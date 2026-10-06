import React from 'react'

/**
 * NeuCard - Tactile extruded container adhering to the Drishya neumorphic system.
 * Separated by light/dark shadow pairs and a faint 1px contrast boundary.
 */
export default function NeuCard({
  children,
  variant = 'raised', // 'raised' | 'raised-sm' | 'raised-lg' | 'inset' | 'flat'
  interactive = false,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'raised-sm':
        return 'shadow-neu-raised-sm'
      case 'raised-lg':
        return 'shadow-neu-raised-lg'
      case 'inset':
        return 'shadow-neu-inset'
      case 'flat':
        return 'shadow-none'
      case 'raised':
      default:
        return 'shadow-neu-raised'
    }
  }

  const interactiveStyles = interactive
    ? 'hover:-translate-y-0.5 hover:shadow-neu-raised-lg active:translate-y-0 active:shadow-neu-inset cursor-pointer'
    : ''

  return (
    <Component
      className={`
        bg-neu-surface rounded-3xl border border-neu-border
        transition-all duration-200
        ${getVariantStyles()}
        ${interactiveStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  )
}
