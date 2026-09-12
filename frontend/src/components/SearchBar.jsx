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
        placeholder="Search videos, channels..."
        className="w-full px-4 py-2.5 pl-4 pr-10 text-xs sm:text-sm font-sora font-medium bg-gray-100 dark:bg-[#1E1E22] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full border border-gray-200 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson transition duration-200 shadow-inner"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-crimson transition duration-200 p-1"
        title="Search"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  )
}
