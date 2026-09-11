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
    <div className="group rounded-2xl bg-white dark:bg-communityDarkCard border border-gray-200 dark:border-gray-800 shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
      {/* Banner */}
      <div className="h-24 w-full relative bg-gray-900 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Online</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <h4 className="font-sora font-bold text-base text-gray-900 dark:text-white group-hover:text-royalBlue transition-colors">
            {name}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
              <Users className="w-3.5 h-3.5 text-royalBlue" />
              {members}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              {activity}
            </span>
          </div>

          <button
            onClick={() => setIsJoined(!isJoined)}
            className={`px-3 py-1.5 rounded-xl font-sora font-semibold text-xs transition duration-200 flex items-center gap-1 ${
              isJoined
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                : 'bg-royalBlue hover:bg-blueAccent text-white shadow-md shadow-royalBlue/20'
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
