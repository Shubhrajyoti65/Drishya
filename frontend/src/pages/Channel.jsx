import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authAPI, videoAPI, subscriptionAPI, membershipTierAPI, membershipAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import CommunityTab from '../components/CommunityTab'
import MembershipModal from '../components/MembershipModal'
import MemberBadge from '../components/MemberBadge'
import CreatorMemberships from './CreatorMemberships'
import MyMemberships from './MyMemberships'
import Upload from './Upload'
import { Star, Crown, Lock, CheckCircle2, Upload as UploadIcon, PlusCircle } from 'lucide-react'

export default function Channel() {
  const { username, tab } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [tiers, setTiers] = useState([])
  const [userMembership, setUserMembership] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false)

  // Map URL parameter to active tab
  const activeTab = tab === 'upload' 
    ? 'upload' 
    : tab === 'creator' 
    ? 'creator-memberships' 
    : tab === 'subscriptions' 
    ? 'subscriptions' 
    : tab === 'community' 
    ? 'community' 
    : 'videos'

  const handleTabChange = (targetTab) => {
    if (targetTab === 'videos') {
      navigate(`/channel/${username}`)
    } else if (targetTab === 'creator-memberships') {
      navigate(`/channel/${username}/creator`)
    } else {
      navigate(`/channel/${username}/${targetTab}`)
    }
  }

  const fetchChannelData = async () => {
    try {
      const channelResponse = await authAPI.getChannelProfile(username)
      const creatorData = channelResponse.data?.data

      if (creatorData) {
        setChannel(creatorData)

        try {
          const videosResponse = await videoAPI.getVideos(1, 12, 'createdAt', 'desc', creatorData._id)
          setVideos(videosResponse.data.data?.docs || videosResponse.data.data?.videos || [])
        } catch (e) {
          console.error('Error fetching channel videos:', e)
        }

        try {
          const subResponse = await subscriptionAPI.checkSubscription(creatorData._id)
          setIsSubscribed(subResponse.data?.data?.isSubscribed || false)
        } catch (e) {
          console.error('Error checking subscription:', e)
        }

        try {
          const tiersRes = await membershipTierAPI.getCreatorTiers(creatorData._id)
          setTiers(tiersRes.data?.data || [])
        } catch (e) {
          console.error('Tiers error:', e)
        }

        if (user) {
          try {
            const membershipsRes = await membershipAPI.getMyMemberships()
            const active = (membershipsRes.data?.data || []).find(
              (m) => m.creator?._id === creatorData._id && m.status === 'ACTIVE'
            )
            setUserMembership(active || null)
          } catch (e) {
            console.error('User membership check error:', e)
          }
        }
        return
      }
    } catch (error) {
      console.error('Error fetching channel data from backend:', error)
    }

    // Fallback: If backend channel fetch fails or returns empty (e.g. Clerk user not registered in DB yet)
    if (user && (user.username === username || user.username?.toLowerCase() === username?.toLowerCase())) {
      setChannel({
        _id: user._id || user.id,
        username: user.username,
        fullname: user.fullname || user.username,
        email: user.email,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        coverImage: user.coverImage || '',
        subscribersCount: 0,
      })
    } else {
      setChannel({
        notFound: true,
        username,
      })
    }
  }

  useEffect(() => {
    fetchChannelData()
  }, [username, user])

  const handleToggleSubscribe = async () => {
    if (!channel?._id) return
    try {
      const response = await subscriptionAPI.toggleSubscription(channel._id)
      setIsSubscribed(response.data.data.subscribed)
      setChannel((prev) => ({
        ...prev,
        subscribersCount: response.data.data.subscribed
          ? prev.subscribersCount + 1
          : Math.max(0, prev.subscribersCount - 1),
      }))
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  if (!channel) return (
    <div className="p-8 text-center text-gray-500 font-sora animate-pulse">
      Loading channel profile...
    </div>
  )

  if (channel.notFound) return (
    <div className="p-12 text-center max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold font-sora text-gray-900 dark:text-white">Channel Not Found</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">The channel @{username} does not exist or has been removed.</p>
      <Link to="/" className="inline-block px-5 py-2.5 bg-crimson text-white rounded-xl font-sora font-semibold text-sm shadow-md">
        Back to Home
      </Link>
    </div>
  )

  const isOwner = user && (user._id === channel._id || (user.username && channel.username && user.username.toLowerCase() === channel.username.toLowerCase()))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Channel Header Container */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-xl">
        
        {/* Cover Image Banner */}
        <div className="relative h-52 sm:h-64 lg:h-72 w-full bg-gradient-to-r from-crimson via-purple-700 to-indigo-700 overflow-hidden">
          {channel.coverImage && (
            <img 
              src={channel.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover object-top" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mt-6 sm:-mt-7 mb-2">
            
            {/* Avatar & Channel Details */}
            <div className="flex items-end gap-4">
              <div className="relative z-10">
                {channel.avatar ? (
                  <img
                    src={channel.avatar}
                    alt={channel.username}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-[#141417] shadow-2xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-crimson text-white font-extrabold text-3xl flex items-center justify-center ring-4 ring-white dark:ring-[#141417] shadow-2xl">
                    {channel.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-sora font-extrabold text-gray-900 dark:text-white">
                    {channel.fullname}
                  </h1>
                  {userMembership && (
                    <MemberBadge
                      badge={{
                        isMember: true,
                        tierName: userMembership.tier?.name,
                        color: userMembership.tier?.color,
                        icon: userMembership.tier?.icon,
                      }}
                    />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-sora">
                  @{channel.username} • <span className="font-semibold text-gray-700 dark:text-gray-300">{channel.subscribersCount || 0}</span> Subscribers
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:pb-1 w-full sm:w-auto">
              {!isOwner ? (
                <>
                  <button
                    onClick={handleToggleSubscribe}
                    className={`px-5 py-2.5 rounded-xl font-sora font-semibold text-xs transition shadow-sm ${
                      isSubscribed
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                        : 'bg-crimson hover:bg-redAccent text-white shadow-crimson/20'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>

                  {tiers.length > 0 && (
                    <button
                      onClick={() => setIsMembershipModalOpen(true)}
                      className={`px-5 py-2.5 rounded-xl font-sora font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
                        userMembership
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                      }`}
                    >
                      <Crown className="w-4 h-4 fill-current" />
                      <span>{userMembership ? 'Manage Membership' : 'Join Membership'}</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleTabChange('upload')}
                    className={`px-4 py-2.5 rounded-xl font-sora font-bold text-xs shadow-md flex items-center gap-1.5 transition ${
                      activeTab === 'upload'
                        ? 'bg-crimson text-white ring-2 ring-crimson ring-offset-2 dark:ring-offset-[#141417] scale-105'
                        : 'bg-crimson hover:bg-redAccent text-white'
                    }`}
                  >
                    <UploadIcon className="w-4 h-4" />
                    <span>Upload Video</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('creator-memberships')}
                    className={`px-4 py-2.5 rounded-xl font-sora font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition ${
                      activeTab === 'creator-memberships'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-[#141417] scale-105'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    }`}
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>Creator Studio</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Present Page Indicator & Navigation Bar */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 gap-1 items-center">
        <button
          onClick={() => handleTabChange('videos')}
          className={`px-5 py-3 font-sora font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          {activeTab === 'videos' && <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />}
          <span>Videos</span>
        </button>

        {isOwner && (
          <button
            onClick={() => handleTabChange('upload')}
            className={`px-5 py-3 font-sora font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {activeTab === 'upload' && <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />}
            <UploadIcon className="w-4 h-4 text-crimson" />
            <span>Upload Video</span>
          </button>
        )}

        <button
          onClick={() => handleTabChange('community')}
          className={`px-5 py-3 font-sora font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'community'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          {activeTab === 'community' && <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />}
          <span>Community</span>
        </button>

        {isOwner && (
          <button
            onClick={() => handleTabChange('subscriptions')}
            className={`px-5 py-3 font-sora font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {activeTab === 'subscriptions' && <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />}
            <Star className="w-4 h-4 text-amber-400" />
            <span>My Subscriptions</span>
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => handleTabChange('creator-memberships')}
            className={`px-5 py-3 font-sora font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'creator-memberships'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {activeTab === 'creator-memberships' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Creator Studio</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <div>
          <h2 className="text-xl font-sora font-bold mb-4 text-gray-900 dark:text-white">Uploaded Videos</h2>
          {videos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No videos uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <Link
                  key={video._id}
                  to={`/watch/${video._id}`}
                  className="group bg-gray-100 dark:bg-gray-800/80 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition border border-gray-200 dark:border-gray-800"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {video.visibility && video.visibility !== 'PUBLIC' && (
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-[11px] font-sora font-bold text-amber-400 flex items-center gap-1 border border-amber-400/30 shadow-md">
                        <Lock className="w-3 h-3" />
                        <span>{video.visibility === 'MEMBERS_ONLY' ? 'Members Only' : `${video.minimumTier?.name || 'Tier'} Only`}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1">
                    <h3 className="font-sora font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-crimson transition">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{video.views || 0} views</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && isOwner && (
        <Upload />
      )}

      {activeTab === 'community' && (
        <CommunityTab channelId={channel._id} isOwner={isOwner} />
      )}

      {activeTab === 'subscriptions' && isOwner && (
        <MyMemberships />
      )}

      {activeTab === 'creator-memberships' && isOwner && (
        <CreatorMemberships />
      )}

      {/* Join Membership Modal */}
      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        creator={channel}
        tiers={tiers}
        userMembership={userMembership}
        onSuccess={(updatedMembership) => {
          setUserMembership(updatedMembership)
          fetchChannelData()
        }}
      />

    </div>
  )
}
