import React, { useState } from 'react'
import { CheckCircle2, BarChart2, Users, Plus, Trash2, X } from 'lucide-react'

export default function PollCard({
  isEditing = false,
  pollQuestion: initialQuestion = '',
  options: initialOptions = [],
  initialVotes = 0,
  pollData,
  onChange,
  onRemove
}) {
  // If in creation/editor mode using controlled props:
  const question = isEditing ? (pollData?.question ?? initialQuestion) : initialQuestion
  const options = isEditing ? (pollData?.options ?? initialOptions) : initialOptions

  // Voting state for view mode:
  const [selectedOption, setSelectedOption] = useState(null)
  const [pollOptions, setPollOptions] = useState(() => {
    if (initialOptions && initialOptions.length > 0) {
      return initialOptions.map((opt, idx) =>
        typeof opt === 'string'
          ? { id: idx + 1, text: opt, votes: 0 }
          : { id: opt.id || idx + 1, text: opt.text || opt, votes: opt.votes || 0 }
      )
    }
    return [
      { id: 1, text: 'Option A: Detailed Technical Breakdown', votes: 0 },
      { id: 2, text: 'Option B: Fast-Paced Cinematic Summary', votes: 0 },
      { id: 3, text: 'Option C: Interactive Q&A Live Session', votes: 0 },
    ]
  })

  const [votesCount, setVotesCount] = useState(() => {
    if (typeof initialVotes === 'number' && initialVotes > 0) return initialVotes
    return pollOptions.reduce((acc, curr) => acc + (curr.votes || 0), 0)
  })

  // Editable mode handlers
  const handleQuestionChange = (newQ) => {
    if (onChange && pollData) {
      onChange({ ...pollData, question: newQ })
    }
  }

  const handleOptionChange = (index, newText) => {
    if (onChange && pollData) {
      const updatedOptions = [...(pollData.options || [])]
      updatedOptions[index] = newText
      onChange({ ...pollData, options: updatedOptions })
    }
  }

  const handleAddOption = () => {
    if (onChange && pollData) {
      const currentOpts = pollData.options || []
      if (currentOpts.length >= 5) return
      onChange({
        ...pollData,
        options: [...currentOpts, `Option ${currentOpts.length + 1}`]
      })
    }
  }

  const handleRemoveOption = (index) => {
    if (onChange && pollData) {
      const currentOpts = pollData.options || []
      if (currentOpts.length <= 2) return
      const updatedOptions = currentOpts.filter((_, idx) => idx !== index)
      onChange({ ...pollData, options: updatedOptions })
    }
  }

  // Voting handler for view mode
  const handleVote = (optionId) => {
    // If clicking the currently selected option, undo / unselect vote
    if (selectedOption === optionId) {
      setSelectedOption(null)
      setPollOptions(prev => {
        const updated = prev.map(opt => (opt.id === optionId ? { ...opt, votes: Math.max(0, (opt.votes || 0) - 1) } : opt))
        const newTotal = updated.reduce((acc, curr) => acc + (curr.votes || 0), 0)
        setVotesCount(newTotal)
        return updated
      })
      return
    }

    // If changing vote from previous option to new option or voting for first time
    const previousOptionId = selectedOption
    setSelectedOption(optionId)

    setPollOptions(prev => {
      const updated = prev.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: (opt.votes || 0) + 1 }
        }
        if (opt.id === previousOptionId) {
          return { ...opt, votes: Math.max(0, (opt.votes || 0) - 1) }
        }
        return opt
      })
      const newTotal = updated.reduce((acc, curr) => acc + (curr.votes || 0), 0)
      setVotesCount(newTotal)
      return updated
    })
  }

  // EDITING / CREATION MODE
  if (isEditing) {
    const currentOptions = pollData?.options || ['Option A: Detailed Technical Breakdown', 'Option B: Fast-Paced Cinematic Summary', 'Option C: Interactive Q&A Live Session']

    return (
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#161B22] border border-royalBlue/30 dark:border-royalBlue/40 space-y-4 my-3 ring-1 ring-royalBlue/20 shadow-md">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sora font-semibold text-royalBlue dark:text-blue-400">
            <BarChart2 className="w-4 h-4 animate-pulse" />
            <span>EDIT CREATOR POLL</span>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-crimson hover:bg-gray-200 dark:hover:bg-gray-800 transition flex items-center gap-1 text-xs font-sora"
              title="Remove Poll"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Poll</span>
            </button>
          )}
        </div>

        {/* Poll Question Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-sora font-semibold text-gray-500 uppercase tracking-wider">
            Poll Question / Prompt
          </label>
          <input
            type="text"
            value={pollData?.question ?? ''}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Ask your community a question..."
            className="w-full bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-sora font-semibold focus:outline-none focus:ring-2 focus:ring-royalBlue/50 transition"
          />
        </div>

        {/* Options List Inputs */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-sora font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
            <span>Poll Options</span>
            <span>({currentOptions.length}/5 max)</span>
          </label>

          {currentOptions.map((optText, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-mono font-bold text-gray-400">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={optText}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-sora focus:outline-none focus:ring-2 focus:ring-royalBlue/50 transition"
              />
              {currentOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="p-2 text-gray-400 hover:text-crimson hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
                  title="Delete Option"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        {currentOptions.length < 5 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-sora font-semibold text-royalBlue dark:text-blue-400 hover:bg-royalBlue/5 dark:hover:bg-blue-950/30 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Choice Option</span>
          </button>
        )}
      </div>
    )
  }

  // PUBLISHED / VIEW MODE
  const displayQuestion = question || "What type of video content should we produce next week?"

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
        {displayQuestion}
      </h4>

      <div className="space-y-2.5">
        {pollOptions.map((opt) => {
          const totalV = votesCount || 1
          const percentage = Math.round((opt.votes / totalV) * 100) || 0
          const isSelected = selectedOption === opt.id

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-royalBlue bg-blue-50/50 dark:bg-blue-950/40 text-royalBlue dark:text-blue-400 font-semibold ring-1 ring-royalBlue/40'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1F2937] hover:border-royalBlue/60 hover:bg-blue-50/30 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
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
      {selectedOption !== null && (
        <div className="text-[10px] text-gray-400 font-sora text-right pt-0.5">
          Click any option to change your vote or click again to undo
        </div>
      )}
    </div>
  )
}
