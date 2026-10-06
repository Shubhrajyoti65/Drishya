import React from 'react'

/**
 * NeuButton - Modern tactile button with physical pressed/raised mechanics.
 * Active states physically depress (inset shadow), primary actions feature soft glow.
 */
export default function NeuButton({
  children,
  variant = 'secondary', // 'primary' (crimson) | 'secondary' (surface) | 'accent' (blue) | 'warning' (amber) | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-sora font-semibold gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-2xl font-sora font-semibold gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl font-sora font-bold gap-2.5',
    icon: 'p-2.5 rounded-xl aspect-square flex items-center justify-center',
  }[size] || 'px-4 py-2.5 text-sm rounded-2xl'

  const variantStyles = {
    // Primary: Crimson brand button with tactile raised glow and physical press
    primary: `
      bg-gradient-to-r from-crimson to-redAccent text-white
      border border-red-500/30
      shadow-neu-glow-crimson
      hover:-translate-y-0.5 hover:brightness-105
      active:translate-y-0 active:shadow-neu-inset active:brightness-95
      focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2
    `,
    // Secondary: Tactile extruded surface button matching background
    secondary: `
      bg-neu-surface text-neu-text
      border border-neu-border
      shadow-neu-raised-sm
      hover:-translate-y-0.5 hover:shadow-neu-raised hover:text-crimson
      active:translate-y-0 active:shadow-neu-inset-sm
      focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2
    `,
    // Accent: Blue brand button with blue tactile glow
    accent: `
      bg-gradient-to-r from-blueAccent to-royalBlue text-white
      border border-blue-400/30
      shadow-neu-glow-blue
      hover:-translate-y-0.5 hover:brightness-105
      active:translate-y-0 active:shadow-neu-inset active:brightness-95
      focus-visible:ring-2 focus-visible:ring-blueAccent focus-visible:ring-offset-2
    `,
    // Warning: Amber roadmap button
    warning: `
      bg-gradient-to-r from-amber-500 to-amber-600 text-white
      border border-amber-400/30
      shadow-neu-glow-amber
      hover:-translate-y-0.5 hover:brightness-105
      active:translate-y-0 active:shadow-neu-inset active:brightness-95
      focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
    `,
    // Ghost: Flat interactive control
    ghost: `
      bg-transparent text-neu-text-secondary
      border border-transparent
      hover:bg-neu-hover hover:text-neu-text hover:shadow-neu-raised-xs
      active:shadow-neu-inset-xs
      focus-visible:ring-2 focus-visible:ring-blueAccent
    `,
  }[variant]

  const disabledStyles = disabled || loading
    ? 'opacity-50 cursor-not-allowed shadow-none hover:translate-y-0 pointer-events-none'
    : 'cursor-pointer'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 select-none
        ${sizeStyles}
        ${variantStyles}
        ${disabledStyles}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  )
}
