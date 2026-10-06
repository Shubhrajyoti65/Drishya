import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Eye, Clock, Sparkles } from 'lucide-react'

export default function VideoCard({ video, isFeatured = false }) {
  if (!video) return null

  // Format duration into mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Format views into 1.2K, 3.4M etc.
  const formatViews = (views) => {
    if (!views) return '0 views'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`
    return `${views} views`
  }

  // Format relative date
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    if (diffHours < 24) return `${diffHours || 1}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 30)}m ago`
  }

  const ownerName = video.owner?.fullname || video.owner?.username || 'Creator'
  const ownerAvatar = video.owner?.avatar
  const ownerUsername = video.owner?.username

  if (isFeatured) {
    return (
      <div className="group relative rounded-3xl overflow-hidden bg-neu-surface border border-neu-border shadow-neu-raised hover:shadow-neu-raised-lg transition-all duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Thumbnail Section */}
          <div className="lg:col-span-7 relative aspect-video overflow-hidden bg-black/90">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Featured Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-crimson to-redAccent text-white text-xs font-sora font-bold tracking-wide shadow-neu-glow-crimson border border-red-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>FEATURED VIDEO</span>
            </div>

            {/* Duration */}
            <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-sm text-white text-xs font-mono font-medium border border-white/10">
              {formatDuration(video.duration)}
            </div>

            {/* Play Button Overlay */}
            <Link 
              to={`/watch/${video._id}`} 
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30"
              aria-label={`Play ${video.title}`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-crimson to-redAccent text-white flex items-center justify-center shadow-neu-glow-crimson transform group-hover:scale-110 active:scale-95 transition-all duration-200 border border-red-500/30">
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              </div>
            </Link>
          </div>

          {/* Content Details Section */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Link to={ownerUsername ? `/channel/${ownerUsername}` : '#'}>
                  {ownerAvatar ? (
                    <img src={ownerAvatar} alt={ownerName} className="w-10 h-10 rounded-2xl object-cover border border-neu-border shadow-neu-raised-xs" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-crimson to-redAccent text-white flex items-center justify-center font-bold text-sm shadow-neu-glow-crimson">
                      {ownerName[0]}
                    </div>
                  )}
                </Link>
                <div>
                  <Link to={ownerUsername ? `/channel/${ownerUsername}` : '#'} className="font-sora font-semibold text-sm text-neu-text hover:text-crimson transition">
                    {ownerName}
                  </Link>
                  <p className="text-xs text-neu-text-muted">Verified Creator</p>
                </div>
              </div>

              <Link to={`/watch/${video._id}`}>
                <h3 className="font-sora font-bold text-xl sm:text-2xl text-neu-text group-hover:text-crimson transition-colors duration-200 line-clamp-2 mb-3 leading-snug">
                  {video.title}
                </h3>
              </Link>

              <p className="text-sm text-neu-text-secondary line-clamp-3 mb-6 leading-relaxed font-sans">
                {video.description || "Watch this exclusive creator video on Drishya platform."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neu-border text-xs font-medium text-neu-text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-crimson font-semibold">
                  <Eye className="w-4 h-4" />
                  {formatViews(video.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-neu-text-muted" />
                  {formatDate(video.createdAt)}
                </span>
              </div>

              <Link
                to={`/watch/${video._id}`}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-crimson to-redAccent hover:brightness-105 active:shadow-neu-inset text-white font-sora font-semibold text-xs transition duration-200 flex items-center gap-1.5 shadow-neu-glow-crimson border border-red-500/30"
              >
                Watch Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-neu-surface rounded-3xl overflow-hidden border border-neu-border shadow-neu-raised-sm hover:shadow-neu-raised hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/90">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-white text-[11px] font-mono font-medium border border-white/10">
          {formatDuration(video.duration)}
        </div>

        {/* Floating Play Icon */}
        <Link 
          to={`/watch/${video._id}`} 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label={`Play ${video.title}`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-crimson to-redAccent text-white flex items-center justify-center shadow-neu-glow-crimson transform group-hover:scale-110 active:scale-95 transition-all duration-200 border border-red-500/30">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* Card Info Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <Link to={`/watch/${video._id}`}>
            <h4 className="font-sora font-bold text-base text-neu-text group-hover:text-crimson transition-colors duration-200 line-clamp-2 leading-snug mb-2">
              {video.title}
            </h4>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-neu-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to={ownerUsername ? `/channel/${ownerUsername}` : '#'}>
              {ownerAvatar ? (
                <img src={ownerAvatar} alt={ownerName} className="w-7 h-7 rounded-xl object-cover border border-neu-border" />
              ) : (
                <div className="w-7 h-7 rounded-xl bg-neu-hover text-neu-text flex items-center justify-center font-bold text-xs">
                  {ownerName[0]}
                </div>
              )}
            </Link>
            <Link to={ownerUsername ? `/channel/${ownerUsername}` : '#'} className="text-xs font-medium text-neu-text-secondary hover:text-crimson transition line-clamp-1">
              {ownerName}
            </Link>
          </div>

          <div className="text-[11px] text-neu-text-muted font-medium flex items-center gap-1.5">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
