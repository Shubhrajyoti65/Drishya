import React from 'react'

/**
 * NeuChip - Tactile badge / pill component.
 */
export default function NeuChip({
  children,
  icon: Icon,
  variant = 'raised', // 'raised' | 'inset' | 'accent' | 'success'
  size = 'sm', // 'xs' | 'sm' | 'md'
  className = '',
  ...props
}) {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }[size] || 'px-2.5 py-1 text-xs'

  const variantStyles = {
    raised: 'bg-neu-surface text-neu-text-secondary shadow-neu-raised-xs border border-neu-border',
    inset: 'bg-neu-surface text-neu-text shadow-neu-inset-xs border border-neu-border',
    accent: 'bg-crimson/10 text-crimson border border-crimson/20 font-semibold',
    blue: 'bg-blueAccent/10 text-blueAccent border border-blueAccent/20 font-semibold',
    amber: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold',
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold',
  }[variant] || 'bg-neu-surface text-neu-text shadow-neu-raised-xs'

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-sora select-none
        transition-colors duration-150
        ${sizeStyles}
        ${variantStyles}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  )
}
