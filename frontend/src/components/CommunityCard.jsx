import React, { useState } from 'react'
import { Users, Activity, UserPlus, Check } from 'lucide-react'

export default function CommunityCard({ community }) {
  const [isJoined, setIsJoined] = useState(false)

  const name = community?.name || 'Tech Creators Hub'
  const members = community?.members || '14.2K'
  const activity = community?.activity || 'Active 5m ago'
  const description = community?.description || 'A community dedicated to video production, tech reviews, and creator workflows.'
  const image = community?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'

  return (
    <div className="group rounded-3xl bg-neu-surface border border-neu-border shadow-neu-raised-sm hover:shadow-neu-raised hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Banner */}
      <div className="h-24 w-full relative bg-black/90 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Online</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <h4 className="font-sora font-bold text-base text-neu-text group-hover:text-royalBlue transition-colors">
            {name}
          </h4>
          <p className="text-xs text-neu-text-secondary line-clamp-2 mt-1 leading-relaxed font-sans">
            {description}
          </p>
        </div>

        <div className="pt-3 border-t border-neu-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-neu-text-muted">
            <span className="flex items-center gap-1 font-semibold text-neu-text">
              <Users className="w-3.5 h-3.5 text-royalBlue" />
              {members}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-neu-text-muted" />
              {activity}
            </span>
          </div>

          <button
            onClick={() => setIsJoined(!isJoined)}
            className={`px-3 py-1.5 rounded-xl font-sora font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 border ${
              isJoined
                ? 'bg-neu-surface text-neu-text shadow-neu-inset-xs border-neu-border'
                : 'bg-gradient-to-r from-blueAccent to-royalBlue text-white shadow-neu-glow-blue border-blue-400/30 hover:brightness-105 active:shadow-neu-inset'
            }`}
          >
            {isJoined ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Joined</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
