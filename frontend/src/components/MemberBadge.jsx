import React from 'react'
import { Star, Crown, ShieldCheck, Award } from 'lucide-react'

export default function MemberBadge({ badge, className = '' }) {
  if (!badge || !badge.isMember) return null

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'crown':
        return <Crown className="w-3 h-3 fill-current" />
      case 'shield':
        return <ShieldCheck className="w-3 h-3 fill-current" />
      case 'award':
        return <Award className="w-3 h-3 fill-current" />
      case 'star':
      default:
        return <Star className="w-3 h-3 fill-current" />
    }
  }

  const badgeColor = badge.color || '#3B82F6'

  return (
    <span
      style={{
        backgroundColor: `${badgeColor}1F`,
        borderColor: `${badgeColor}4D`,
        color: badgeColor,
      }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sora font-semibold border shadow-sm ${className}`}
      title={`Active ${badge.tierName || 'Member'}`}
    >
      {renderIcon(badge.icon)}
      <span>{badge.tierName || 'Member'}</span>
    </span>
  )
}
