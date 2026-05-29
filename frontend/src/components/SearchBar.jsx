import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos, channels..."
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  )
}
