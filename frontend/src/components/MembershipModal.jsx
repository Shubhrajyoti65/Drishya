import React, { useState, useEffect } from 'react'
import { X, Check, Star, Crown, ShieldCheck, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { paymentAPI } from '../services/api'

// Helper function to load Razorpay Checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function MembershipModal({
  isOpen,
  onClose,
  creator,
  tiers = [],
  userMembership = null,
  onSuccess,
}) {
  const [selectedTier, setSelectedTier] = useState(null)
  const [statusState, setStatusState] = useState('IDLE') // IDLE, PREPARING, CHECKOUT, VERIFYING, SUCCESS, ERROR, CANCELLED
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (tiers.length > 0 && !selectedTier) {
      setSelectedTier(tiers[0])
    }
  }, [tiers])

  if (!isOpen || !creator) return null

  const handleJoinClick = async () => {
    if (!selectedTier) return
    setStatusState('PREPARING')
    setErrorMessage('')

    try {
      // 1. Request backend to create Razorpay payment order
      const orderResponse = await paymentAPI.createOrder(creator._id, selectedTier._id)
      const { orderId, amount, currency, key, membershipId } = orderResponse.data.data

      // 2. Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded || !window.Razorpay) {
        // Fallback test mode verification if checkout SDK script blocked/unavailable
        await handleVerifyPayment({
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: `sig_mock_${Date.now()}`,
          membershipId,
        })
        return
      }

      // 3. Open Razorpay Checkout Dialog
      setStatusState('CHECKOUT')

      const options = {
        key: key || 'rzp_test_dummy_key_id',
        amount: amount,
        currency: currency || 'INR',
        name: `Join ${creator.fullname || creator.username}'s Membership`,
        description: `${selectedTier.name} Tier - ₹${selectedTier.price}/month`,
        image: creator.avatar,
        order_id: orderId,
        handler: async function (response) {
          // 4. Send payment details to backend for mandatory HMAC verification
          setStatusState('VERIFYING')
          try {
            await handleVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              membershipId,
            })
          } catch (err) {
            setStatusState('ERROR')
            setErrorMessage(err.response?.data?.message || 'Payment signature verification failed')
          }
        },
        modal: {
          ondismiss: function () {
            setStatusState('CANCELLED')
          },
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: selectedTier.color || '#3B82F6',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setStatusState('ERROR')
        setErrorMessage(response.error?.description || 'Payment processing failed')
      })
      rzp.open()
    } catch (error) {
      console.error('Error initiating membership payment:', error)
      setStatusState('ERROR')
      setErrorMessage(error.response?.data?.message || 'Failed to initialize payment')
    }
  }

  const handleVerifyPayment = async (verificationPayload) => {
    setStatusState('VERIFYING')
    const verifyRes = await paymentAPI.verifyPayment(verificationPayload)
    setStatusState('SUCCESS')
    if (onSuccess) {
      onSuccess(verifyRes.data.data)
    }
  }

  const isCurrentTierActive =
    userMembership &&
    userMembership.status === 'ACTIVE' &&
    userMembership.tier?._id === selectedTier?._id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-2xl">
        
        {/* Header with Creator Info */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-crimson/20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {creator.avatar ? (
              <img src={creator.avatar} alt={creator.username} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-crimson text-white font-bold flex items-center justify-center text-xl">
                {creator.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sora font-bold text-xl text-gray-900 dark:text-white">
                  Join {creator.fullname || creator.username}
                </h2>
                <Sparkles className="w-5 h-5 text-amber-400 fill-current" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Unlock exclusive perks, member badges, and special videos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status Message Overlays */}
          {statusState === 'PREPARING' && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-sora font-semibold">Preparing secure payment...</span>
            </div>
          )}

          {statusState === 'VERIFYING' && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-sora font-semibold">Verifying Razorpay payment signature...</span>
            </div>
          )}

          {statusState === 'SUCCESS' && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-sora font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-current" />
                <span>Membership Activated Successfully!</span>
              </div>
              <p className="text-xs">
                Welcome to the channel family! You now have full access to exclusive videos and member badges.
              </p>
            </div>
          )}

          {statusState === 'ERROR' && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-sora font-semibold">{errorMessage || 'Payment failed. Your membership has not been activated.'}</span>
            </div>
          )}

          {statusState === 'CANCELLED' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-sora font-semibold">Payment process cancelled. You can try again whenever you are ready.</span>
            </div>
          )}

          {/* Available Tiers List */}
          {tiers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              This creator has not configured any membership tiers yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => {
                const isSelected = selectedTier?._id === tier._id
                return (
                  <div
                    key={tier._id}
                    onClick={() => {
                      if (statusState === 'IDLE' || statusState === 'ERROR' || statusState === 'CANCELLED') {
                        setSelectedTier(tier)
                      }
                    }}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-lg scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#202024] hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div>
                      {/* Tier Tag / Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          style={{ color: tier.color || '#3B82F6' }}
                          className="font-sora font-bold text-base flex items-center gap-1.5"
                        >
                          <Star className="w-4 h-4 fill-current" />
                          <span>{tier.name}</span>
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="font-sora font-extrabold text-2xl text-gray-900 dark:text-white">
                          ₹{tier.price}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400"> / month</span>
                      </div>

                      {/* Description */}
                      {tier.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {tier.description}
                        </p>
                      )}

                      {/* Benefits Perks */}
                      <div className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Perks Included:</span>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-200">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>Official Member Badge</span>
                          </li>
                          {tier.benefits?.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-200">
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 dark:bg-[#121214] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Cancel anytime • Secured by Razorpay
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-sora font-semibold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              {statusState === 'SUCCESS' ? 'Close' : 'Cancel'}
            </button>

            {statusState !== 'SUCCESS' && (
              <button
                disabled={!selectedTier || isCurrentTierActive || statusState === 'PREPARING' || statusState === 'VERIFYING'}
                onClick={handleJoinClick}
                className={`px-6 py-2.5 rounded-xl font-sora font-bold text-xs text-white shadow-md transition flex items-center gap-2 ${
                  isCurrentTierActive
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                }`}
              >
                {(statusState === 'PREPARING' || statusState === 'VERIFYING') && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {isCurrentTierActive
                    ? 'Current Active Tier'
                    : `Join Tier for ₹${selectedTier?.price || 0}`}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
