import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos, channels, ideas..."
        className="w-full px-4 py-2.5 pl-4 pr-11 text-xs sm:text-sm font-sans font-medium bg-neu-surface text-neu-text placeholder:text-neu-text-muted rounded-full border border-neu-border shadow-neu-inset-sm focus:outline-none focus:ring-2 focus:ring-crimson/50 focus:border-crimson/60 transition-all duration-200"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neu-text-muted hover:text-crimson active:scale-95 transition-all duration-200 p-1.5 rounded-full hover:bg-neu-hover"
        title="Search"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  )
}
