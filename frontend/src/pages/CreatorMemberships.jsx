import React, { useState, useEffect } from 'react'
import { membershipTierAPI, membershipAPI } from '../services/api'
import MemberBadge from '../components/MemberBadge'
import {
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Crown,
  ShieldCheck,
  Award,
  Loader2,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react'

export default function CreatorMemberships() {
  const [activeTab, setActiveTab] = useState('analytics') // analytics, tiers, members
  const [stats, setStats] = useState(null)
  const [tiers, setTiers] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Create/Edit Tier Form Modal state
  const [showTierModal, setShowTierModal] = useState(false)
  const [editingTier, setEditingTier] = useState(null)
  const [tierForm, setTierForm] = useState({
    name: '',
    price: '',
    description: '',
    benefits: '',
    color: '#3B82F6',
    icon: 'star',
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCreatorData = async () => {
    try {
      setLoading(true)
      let userId = ''
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          userId = JSON.parse(storedUser)?._id || ''
        }
      } catch (e) {
        // silent fallback
      }

      if (!userId) {
        setLoading(false)
        return
      }

      const [statsRes, tiersRes, membersRes] = await Promise.all([
        membershipAPI.getCreatorMembershipStats(),
        membershipTierAPI.getCreatorTiers(userId),
        membershipAPI.getCreatorMembers(1, 50),
      ])
      setStats(statsRes.data.data)
      setTiers(tiersRes.data.data || [])
      setMembers(membersRes.data.data?.members || [])
    } catch (error) {
      console.error('Error fetching creator membership data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCreatorData()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingTier(null)
    setTierForm({
      name: '',
      price: '',
      description: '',
      benefits: '',
      color: '#3B82F6',
      icon: 'star',
    })
    setFormError('')
    setShowTierModal(true)
  }

  const handleOpenEditModal = (tier) => {
    setEditingTier(tier)
    setTierForm({
      name: tier.name || '',
      price: tier.price || '',
      description: tier.description || '',
      benefits: Array.isArray(tier.benefits) ? tier.benefits.join(', ') : '',
      color: tier.color || '#3B82F6',
      icon: tier.icon || 'star',
    })
    setFormError('')
    setShowTierModal(true)
  }

  const handleSaveTier = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!tierForm.name.trim()) {
      setFormError('Tier name is required')
      return
    }

    const priceNum = Number(tierForm.price)
    if (isNaN(priceNum) || priceNum < 1) {
      setFormError('Monthly price must be at least ₹1')
      return
    }

    try {
      setSubmitting(true)
      const benefitsArray = tierForm.benefits
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)

      const payload = {
        name: tierForm.name.trim(),
        price: priceNum,
        description: tierForm.description.trim(),
        benefits: benefitsArray,
        color: tierForm.color,
        icon: tierForm.icon,
      }

      if (editingTier) {
        await membershipTierAPI.updateTier(editingTier._id, payload)
      } else {
        await membershipTierAPI.createTier(payload)
      }

      setShowTierModal(false)
      fetchCreatorData()
    } catch (error) {
      console.error('Error saving tier:', error)
      setFormError(error.response?.data?.message || 'Failed to save membership tier')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTier = async (tierId) => {
    if (!window.confirm('Are you sure you want to deactivate this membership tier?')) return

    try {
      await membershipTierAPI.deleteTier(tierId)
      fetchCreatorData()
    } catch (error) {
      console.error('Error deactivating tier:', error)
      alert(error.response?.data?.message || 'Failed to deactivate tier')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-crimson animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white flex items-center gap-3">
            <Crown className="w-7 h-7 text-amber-400 fill-current" />
            <span>Creator Membership Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure monthly subscription tiers, track revenue analytics, and manage active channel members
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-redAccent text-white font-sora font-semibold text-xs shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Membership Tier</span>
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Recurring</span>
            <h3 className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white mt-1">
              ₹{stats?.monthlyRecurringRevenue || 0}
            </h3>
            <span className="text-[11px] text-emerald-500 font-semibold">Estimated monthly MRR</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
            <h3 className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white mt-1">
              ₹{stats?.totalRevenue || 0}
            </h3>
            <span className="text-[11px] text-blue-500 font-semibold">All-time earnings</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Members</span>
            <h3 className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white mt-1">
              {stats?.totalActiveMembers || 0}
            </h3>
            <span className="text-[11px] text-purple-500 font-semibold">
              +{stats?.newMembersThisMonth || 0} new this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Tiers</span>
            <h3 className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white mt-1">
              {tiers.length}
            </h3>
            <span className="text-[11px] text-amber-500 font-semibold">Configured tier levels</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-sora font-bold text-sm border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Analytics & Tiers Breakdown
        </button>

        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-6 py-3 font-sora font-bold text-sm border-b-2 transition ${
            activeTab === 'tiers'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Manage Tiers ({tiers.length})
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 font-sora font-bold text-sm border-b-2 transition ${
            activeTab === 'members'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Members List ({members.length})
        </button>
      </div>

      {/* Tab 1: Analytics Breakdown */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">Active Members Distribution by Tier</h3>
          
          {stats?.membersByTier?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 rounded-2xl bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-gray-800">
              No active tier subscriptions recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats?.membersByTier?.map((tierStat) => (
                <div
                  key={tierStat._id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{ color: tierStat.tierColor }}
                      className="font-sora font-bold text-base flex items-center gap-1.5"
                    >
                      <Star className="w-4 h-4 fill-current" />
                      <span>{tierStat.tierName}</span>
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      ₹{tierStat.tierPrice}/mo
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white">
                      {tierStat.memberCount} <span className="text-xs font-normal text-gray-500">members</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-500">₹{tierStat.tierRevenue}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Tiers */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">Configured Membership Tiers</h3>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-crimson text-white font-sora font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tier</span>
            </button>
          </div>

          {tiers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 rounded-2xl bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 space-y-3">
              <Star className="w-10 h-10 mx-auto text-gray-400" />
              <p>You haven't created any membership tiers yet.</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-sora font-semibold text-xs inline-block"
              >
                Create Bronze / Silver / Gold Tiers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier._id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: tier.color }}
                        className="font-sora font-bold text-lg flex items-center gap-2"
                      >
                        <Star className="w-5 h-5 fill-current" />
                        <span>{tier.name}</span>
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditModal(tier)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white">
                        ₹{tier.price}
                      </span>
                      <span className="text-xs text-gray-500"> / month</span>
                    </div>

                    {tier.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{tier.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Perks Included:</span>
                      {tier.benefits?.map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Members List */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">Active & Past Channel Members</h3>

          {members.length === 0 ? (
            <div className="p-8 text-center text-gray-500 rounded-2xl bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-gray-800">
              No channel members found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181B]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-[#202024] text-gray-500 font-sora uppercase border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {members.map((m) => (
                    <tr key={m._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="p-4 flex items-center gap-3">
                        {m.subscriber?.avatar ? (
                          <img src={m.subscriber.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-crimson text-white font-bold flex items-center justify-center">
                            {m.subscriber?.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-sora font-semibold text-gray-900 dark:text-white">
                            {m.subscriber?.fullname || m.subscriber?.username}
                          </div>
                          <div className="text-[11px] text-gray-400">@{m.subscriber?.username}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <MemberBadge
                          badge={{
                            isMember: true,
                            tierName: m.tier?.name,
                            color: m.tier?.color,
                            icon: m.tier?.icon,
                          }}
                        />
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(m.startDate || m.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-500">{new Date(m.expiryDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tier Create/Edit Modal */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">
                {editingTier ? 'Edit Membership Tier' : 'Create Membership Tier'}
              </h3>
              <button onClick={() => setShowTierModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs">
              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tier Name (e.g. Bronze, Silver, Gold)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bronze"
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Price (INR ₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="49"
                  value={tierForm.price}
                  onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Exclusive benefits for super fans"
                  value={tierForm.description}
                  onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Perks & Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Exclusive posts, Members-only videos, Early access"
                  value={tierForm.benefits}
                  onChange={(e) => setTierForm({ ...tierForm, benefits: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Theme Color
                  </label>
                  <input
                    type="color"
                    value={tierForm.color}
                    onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })}
                    className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Badge Icon
                  </label>
                  <select
                    value={tierForm.icon}
                    onChange={(e) => setTierForm({ ...tierForm, icon: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                  >
                    <option value="star">Star</option>
                    <option value="crown">Crown</option>
                    <option value="shield">Shield</option>
                    <option value="award">Award</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowTierModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white font-sora font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-redAccent text-white font-sora font-bold shadow-md flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingTier ? 'Update Tier' : 'Save Tier'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
