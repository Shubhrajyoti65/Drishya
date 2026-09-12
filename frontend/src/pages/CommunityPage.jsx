import React from 'react'
import CommunityTab from '../components/CommunityTab'
import { useAuth } from '../hooks/useAuth'
import { Users } from 'lucide-react'

export default function CommunityPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-xl space-y-2">
        <h1 className="text-2xl sm:text-3xl font-sora font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-royalBlue" />
          <span>Creator Community Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sora">
          Connect with creators, share announcements, discuss AI workflows, vote on polls, and engage with the community.
        </p>
      </div>

      <CommunityTab channelId={null} isOwner={!!user} />
    </div>
  )
}
