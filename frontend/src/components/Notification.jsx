import { useUIStore } from '../stores/uiStore'

export default function Notification() {
  const notification = useUIStore((state) => state.notification)

  if (!notification) return null

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[notification.type || 'info']

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-pulse`}>
      {notification.message}
    </div>
  )
}
