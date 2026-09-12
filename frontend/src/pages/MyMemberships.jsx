import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { membershipAPI, subscriptionAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import MemberBadge from '../components/MemberBadge'
import { 
  Star, 
  Users, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Ban, 
  ArrowUpRight, 
  Loader2, 
  UserCheck, 
  UserMinus,
  Crown
} from 'lucide-react'

export default function MyMemberships() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('channels') // 'channels' | 'memberships'
  const [subscribedChannels, setSubscribedChannels] = useState([])
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [unsubscribingId, setUnsubscribingId] = useState(null)
  const [message, setMessage] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch paid memberships
      const membershipsRes = await membershipAPI.getMyMemberships().catch(() => ({ data: { data: [] } }))
      setMemberships(membershipsRes.data.data || [])

      // Fetch subscribed channels if user is logged in
      if (user?._id) {
        const subChannelsRes = await subscriptionAPI.getSubscribedChannels(user._id, 1, 50).catch(() => null)
        const raw = subChannelsRes?.data?.data
        let channelsData = []
        if (Array.isArray(raw)) {
          channelsData = raw
        } else if (raw && Array.isArray(raw.docs)) {
          channelsData = raw.docs
        } else if (raw && Array.isArray(raw.channels)) {
          channelsData = raw.channels
        } else if (Array.isArray(subChannelsRes?.data)) {
          channelsData = subChannelsRes.data
        }
        setSubscribedChannels(channelsData)
      }
    } catch (error) {
      console.error('Error fetching subscriptions data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleUnsubscribe = async (channelId) => {
    if (!window.confirm('Are you sure you want to unsubscribe from this channel?')) return

    try {
      setUnsubscribingId(channelId)
      await subscriptionAPI.toggleSubscription(channelId)
      setMessage('Unsubscribed successfully')
      setSubscribedChannels((prev) => prev.filter((item) => (item.channel?._id || item.channel) !== channelId))
    } catch (error) {
      console.error('Error unsubscribing:', error)
      alert(error.response?.data?.message || 'Failed to unsubscribe')
    } finally {
      setUnsubscribingId(null)
    }
  }

  const handleCancelMembership = async (membershipId) => {
    if (!window.confirm('Are you sure you want to cancel this membership? You will retain access until the end of your billing cycle.')) {
      return
    }

    try {
      setCancellingId(membershipId)
      const res = await membershipAPI.cancelMembership(membershipId)
      setMessage(res.data.message || 'Membership cancelled successfully')
      fetchData()
    } catch (error) {
      console.error('Error cancelling membership:', error)
      alert(error.response?.data?.message || 'Failed to cancel membership')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusPill = (status, expiryDate) => {
    const isExpired = new Date(expiryDate) < new Date()

    if (status === 'ACTIVE' && !isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sora font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ACTIVE</span>
        </span>
      )
    }

    if (status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sora font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          <span>CANCELLED</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sora font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
        <Ban className="w-3.5 h-3.5" />
        <span>EXPIRED</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-crimson animate-spin" />
      </div>
    )
  }

  const safeChannels = Array.isArray(subscribedChannels) ? subscribedChannels : []
  const safeMemberships = Array.isArray(memberships) ? memberships : []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-crimson" />
            <span>My Subscriptions</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your subscribed channels and active creator memberships
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-sora text-blue-700 dark:text-blue-300">
          {message}
        </div>
      )}

      {/* Subscriptions Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-2">
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-5 py-3 font-sora font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'channels'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Subscribed Channels ({safeChannels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('memberships')}
          className={`px-5 py-3 font-sora font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'memberships'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Paid Creator Memberships ({safeMemberships.length})</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIBED CHANNELS */}
      {activeTab === 'channels' && (
        <div>
          {safeChannels.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 space-y-4">
              <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">No Subscribed Channels</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                You haven't subscribed to any creator channels yet. Browse recommended videos and support your favorite creators!
              </p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 rounded-xl bg-crimson text-white font-sora font-semibold text-xs shadow-md"
              >
                Explore Channels
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeChannels.map((item) => {
                const channel = item.channel || item
                const channelId = channel._id

                return (
                  <div
                    key={item._id || channelId}
                    className="p-5 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {channel.avatar ? (
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-crimson/20"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-crimson text-white font-extrabold flex items-center justify-center text-lg">
                          {channel.username?.[0]?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/channel/${channel.username}`}
                          className="font-sora font-bold text-sm text-gray-900 dark:text-white hover:text-crimson transition truncate block"
                        >
                          {channel.fullname || channel.username}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">@{channel.username}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link
                        to={`/channel/${channel.username}`}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-crimson transition"
                        title="Visit Channel"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>

                      <button
                        disabled={unsubscribingId === channelId}
                        onClick={() => handleUnsubscribe(channelId)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-500/30 text-[11px] font-sora font-medium transition flex items-center gap-1"
                        title="Unsubscribe"
                      >
                        {unsubscribingId === channelId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserMinus className="w-3 h-3" />
                        )}
                        <span>Subscribed</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAID CREATOR MEMBERSHIPS */}
      {activeTab === 'memberships' && (
        <div>
          {memberships.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 space-y-4">
              <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">No Active Paid Memberships</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                You haven't joined any paid creator membership tiers yet. Unlock exclusive perks and members-only videos by joining a channel membership!
              </p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 rounded-xl bg-crimson text-white font-sora font-semibold text-xs shadow-md"
              >
                Explore Channels
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memberships.map((membership) => {
                const creator = membership.creator
                const tier = membership.tier
                const isCancelling = cancellingId === membership._id

                return (
                  <div
                    key={membership._id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800/80 shadow-premium flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition duration-200"
                  >
                    <div>
                      {/* Top Creator Header */}
                      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          {creator?.avatar ? (
                            <img src={creator.avatar} alt={creator.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-crimson/20" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-crimson text-white font-bold flex items-center justify-center text-lg">
                              {creator?.username?.[0]?.toUpperCase() || 'C'}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/channel/${creator?.username}`}
                              className="font-sora font-bold text-base text-gray-900 dark:text-white hover:text-crimson transition flex items-center gap-1"
                            >
                              <span>{creator?.fullname || creator?.username}</span>
                              <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@{creator?.username}</p>
                          </div>
                        </div>

                        {getStatusPill(membership.status, membership.expiryDate)}
                      </div>

                      {/* Tier Info & Badge */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tier:</span>
                            <MemberBadge
                              badge={{
                                isMember: true,
                                tierName: tier?.name,
                                color: tier?.color,
                                icon: tier?.icon,
                              }}
                            />
                          </div>
                          <span className="font-sora font-extrabold text-lg text-gray-900 dark:text-white">
                            ₹{membership.amount} <span className="text-xs font-normal text-gray-500">/mo</span>
                          </span>
                        </div>

                        {/* Dates & Renewal Info */}
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#202024] space-y-2 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              <span>Start Date:</span>
                            </span>
                            <span className="font-semibold">{new Date(membership.startDate || membership.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Renewal / Expiry:</span>
                            </span>
                            <span className="font-semibold">{new Date(membership.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="text-[11px] text-gray-400">
                        Payment ID: {membership.razorpayPaymentId || membership.razorpayOrderId || 'N/A'}
                      </div>

                      {membership.status === 'ACTIVE' && (
                        <button
                          disabled={isCancelling}
                          onClick={() => handleCancelMembership(membership._id)}
                          className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-sora font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Cancel Membership</span>
                        </button>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
