import { useUIStore } from '../stores/uiStore'
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export default function Notification() {
  const notification = useUIStore((state) => state.notification)

  if (!notification) return null

  const typeConfig = {
    success: {
      border: 'border-emerald-500/40',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-500',
    },
    error: {
      border: 'border-crimson/40',
      icon: AlertCircle,
      iconColor: 'text-crimson',
      badge: 'bg-crimson/10 text-crimson',
    },
    warning: {
      border: 'border-amber-500/40',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      badge: 'bg-amber-500/10 text-amber-500',
    },
    info: {
      border: 'border-blueAccent/40',
      icon: Info,
      iconColor: 'text-blueAccent',
      badge: 'bg-blueAccent/10 text-blueAccent',
    },
  }[notification.type || 'info']

  const Icon = typeConfig.icon

  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-neu-surface border ${typeConfig.border} shadow-neu-raised-lg animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-md`}
    >
      <div className={`p-1.5 rounded-xl ${typeConfig.badge} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs sm:text-sm font-sora font-semibold text-neu-text">
        {notification.message}
      </span>
    </div>
  )
}
