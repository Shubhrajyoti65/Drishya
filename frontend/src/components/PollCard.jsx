import React, { useState } from 'react'
import { CheckCircle2, BarChart2, Users } from 'lucide-react'

export default function PollCard({ pollQuestion, options = [], initialVotes = 124 }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [votesCount, setVotesCount] = useState(initialVotes)
  const [pollOptions, setPollOptions] = useState(
    options.length > 0 
      ? options 
      : [
          { id: 1, text: 'Option A: Detailed Technical Breakdown', votes: 48 },
          { id: 2, text: 'Option B: Fast-Paced Cinematic Summary', votes: 32 },
          { id: 3, text: 'Option C: Interactive Q&A Live Session', votes: 24 },
        ]
  )

  const handleVote = (optionId) => {
    if (selectedOption !== null) return
    setSelectedOption(optionId)
    setVotesCount(prev => prev + 1)
    setPollOptions(prev =>
      prev.map(opt => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 space-y-4 my-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-sora font-semibold text-royalBlue dark:text-blue-400">
          <BarChart2 className="w-4 h-4" />
          <span>CREATOR POLL</span>
        </div>
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {votesCount} votes
        </span>
      </div>

      <h4 className="font-sora font-bold text-sm text-gray-900 dark:text-white">
        {pollQuestion || "What type of video content should we produce next week?"}
      </h4>

      <div className="space-y-2.5">
        {pollOptions.map((opt) => {
          const percentage = Math.round((opt.votes / votesCount) * 100) || 0
          const isSelected = selectedOption === opt.id

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'border-royalBlue bg-blue-50/50 dark:bg-blue-950/40 text-royalBlue dark:text-blue-400 font-semibold'
                  : selectedOption !== null
                  ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1F2937] text-gray-700 dark:text-gray-300'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1F2937] hover:border-royalBlue/50 hover:bg-blue-50/20 text-gray-800 dark:text-gray-200'
              }`}
            >
              {/* Progress bar fill after voting */}
              {selectedOption !== null && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isSelected ? 'bg-royalBlue/20 dark:bg-blue-600/30' : 'bg-gray-100 dark:bg-gray-700/40'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 pr-4">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-royalBlue flex-shrink-0" />}
                  <span className="font-sora">{opt.text}</span>
                </div>
                {selectedOption !== null && (
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
