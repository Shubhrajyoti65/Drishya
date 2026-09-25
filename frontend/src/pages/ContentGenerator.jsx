import { useState } from 'react'
import { generatorAPI } from '../services/aiApi'
import { useUIStore } from '../stores/uiStore'
import { 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Type, 
  Lightbulb, 
  Search, 
  BarChart3, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Bot, 
  FileText, 
  ArrowRight, 
  Flame, 
  Zap, 
  Layers
} from 'lucide-react'

export default function ContentGenerator() {
  const showNotification = useUIStore((state) => state.showNotification)
  const [activeTab, setActiveTab] = useState('thumbnails')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)

  // Floating AI Chat Assistant Panel State
  const [showAiChat, setShowAiChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello Creator! I am Drishya AI Assistant. How can I help optimize your content today?' }
  ])
  const [chatInput, setChatInput] = useState('')

  // Video Titles State
  const [titleForm, setTitleForm] = useState({
    topic: '',
    niche: '',
    targetAudience: ''
  })
  const [titles, setTitles] = useState([])

  // Content Ideas State
  const [ideasForm, setIdeasForm] = useState({
    niche: '',
    targetAudience: '',
    previousContent: '',
    currentTrends: ''
  })
  const [ideas, setIdeas] = useState([])

  // Thumbnail State
  const [thumbnailForm, setThumbnailForm] = useState({
    topic: '',
    category: '',
    mood: 'Energetic & Modern'
  })
  const [thumbnails, setThumbnails] = useState([])

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    showNotification('Copied to clipboard!', 'success')
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userMsg = chatInput
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setChatInput('')

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { sender: 'ai', text: `Here is a creator tip for "${userMsg}": Focus on bold typography in your thumbnail and keep your hook under 5 seconds for maximum viewer retention.` }
      ])
    }, 1000)
  }

  const generateTitles = async () => {
    if (!titleForm.topic || !titleForm.niche) {
      showNotification('Please enter topic and niche', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await generatorAPI.generateVideoTitles(
        titleForm.topic,
        titleForm.niche,
        titleForm.targetAudience
      )
      const list = response.data?.titles || response.data?.data?.titles || []
      setTitles(list)
      showNotification('Titles generated successfully!', 'success')
    } catch (error) {
      showNotification('Failed to generate titles', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateIdeas = async () => {
    if (!ideasForm.niche) {
      showNotification('Please specify creator niche', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await generatorAPI.generateContentIdeas(
        ideasForm.niche,
        ideasForm.targetAudience,
        ideasForm.previousContent,
        ideasForm.currentTrends
      )
      const list = response.data?.ideas || response.data?.data?.ideas || []
      setIdeas(list)
      showNotification('Content ideas generated!', 'success')
    } catch (error) {
      showNotification('Failed to generate ideas', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateThumbnails = async () => {
    if (!thumbnailForm.topic) {
      showNotification('Please enter video topic', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await generatorAPI.generateThumbnailSuggestions(
        thumbnailForm.topic,
        thumbnailForm.category,
        thumbnailForm.mood
      )
      const list = response.data?.suggestions || response.data?.data?.suggestions || []
      setThumbnails(list)
      showNotification('Thumbnail generated with FLUX AI engine!', 'success')
    } catch (error) {
      showNotification('Failed to generate thumbnail', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative">
      
      {/* SECTION 1: HERO LANDING BANNER (Adapted for Light & Dark Mode) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 dark:from-blueAccent dark:via-[#5B21B6] dark:to-crimson text-white p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-premium">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/15 text-[11px] font-sora font-semibold tracking-wider text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>DRISHYA AI CREATIVE WORKSPACE</span>
            </div>

            <h1 className="font-sora font-semibold sm:font-bold text-2xl sm:text-4xl lg:text-[40px] tracking-tight leading-tight text-white">
              Create <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">Smarter with AI.</span>
            </h1>

            <p className="text-xs sm:text-sm text-white/90 dark:text-white/80 max-w-xl font-sora font-normal leading-relaxed">
              Supercharge your creative workflow. Generate 16:9 FLUX AI thumbnails, viral video titles, content roadmaps, and SEO strategies in seconds.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => setActiveTab('thumbnails')}
                className="px-4 py-2.5 rounded-xl bg-white text-gray-900 font-sora font-semibold text-xs hover:bg-gray-100 transition shadow-md flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-crimson" />
                <span>FLUX Thumbnail Studio</span>
              </button>

              <button
                onClick={() => setShowAiChat(!showAiChat)}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/20 dark:border-white/15 text-white font-sora font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                <span>{showAiChat ? 'Hide AI Copilot' : 'Open AI Copilot'}</span>
              </button>
            </div>
          </div>

          {/* AI Feature Cards Quick Switch */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/15 space-y-1 hover:bg-white/25 dark:hover:bg-white/15 transition">
              <Zap className="w-4 h-4 text-amber-300" />
              <h4 className="font-sora font-semibold text-xs">FLUX.1 [dev]</h4>
              <p className="text-[10px] text-white/80 dark:text-white/70">8k Photo Realism</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/15 space-y-1 hover:bg-white/25 dark:hover:bg-white/15 transition">
              <Type className="w-4 h-4 text-blue-200 dark:text-blue-300" />
              <h4 className="font-sora font-semibold text-xs">Viral Titles</h4>
              <p className="text-[10px] text-white/80 dark:text-white/70">High CTR Focus</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: AI TOOLS DASHBOARD (Grid of Premium Feature Cards) */}
      <section className="space-y-4">
        <h2 className="font-sora font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-crimson" />
          <span>AI Studio Tools</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('thumbnails')}
            className={`p-5 rounded-3xl border text-left transition-all duration-300 space-y-3 ${
              activeTab === 'thumbnails'
                ? 'bg-gradient-to-br from-rose-50 via-crimson/10 to-blue-50 dark:from-crimson/20 dark:to-blueAccent/20 border-crimson shadow-md scale-[1.02]'
                : 'bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-800/80 hover:border-crimson/50'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-crimson/10 text-crimson flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-base text-gray-900 dark:text-white">Thumbnail Studio</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generate 16:9 FLUX thumbnails</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('titles')}
            className={`p-5 rounded-3xl border text-left transition-all duration-300 space-y-3 ${
              activeTab === 'titles'
                ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blueAccent/20 dark:to-crimson/20 border-blueAccent shadow-md scale-[1.02]'
                : 'bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-800/80 hover:border-blueAccent/50'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-blueAccent/10 text-blueAccent flex items-center justify-center">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-base text-gray-900 dark:text-white">Title Generator</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SEO-optimized viral video titles</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`p-5 rounded-3xl border text-left transition-all duration-300 space-y-3 ${
              activeTab === 'ideas'
                ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-500/20 dark:to-royalBlue/20 border-amber-500 shadow-md scale-[1.02]'
                : 'bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-800/80 hover:border-amber-500/50'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-base text-gray-900 dark:text-white">Content Roadmap</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Personalized niche video ideas</p>
            </div>
          </button>
        </div>
      </section>

      {/* SECTION 3: SPLIT WORKSPACE (Prompt Editor Left, Generated Results Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: PROMPT CONTROLS */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800/80 shadow-premium space-y-6">
          
          {/* THUMBNAIL STUDIO TAB */}
          {activeTab === 'thumbnails' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-sora font-bold text-crimson uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" />
                <span>FLUX.1 [dev] THUMBNAIL ENGINE</span>
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Video Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building a SaaS Product in 2026"
                  value={thumbnailForm.topic}
                  onChange={(e) => setThumbnailForm({...thumbnailForm, topic: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Category / Niche
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technology, Gaming, Lifestyle"
                  value={thumbnailForm.category}
                  onChange={(e) => setThumbnailForm({...thumbnailForm, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone & Mood
                </label>
                <input
                  type="text"
                  placeholder="e.g. Energetic, Cinematic, Dark Minimalist"
                  value={thumbnailForm.mood}
                  onChange={(e) => setThumbnailForm({...thumbnailForm, mood: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <button
                onClick={generateThumbnails}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-crimson to-redAccent hover:opacity-90 disabled:opacity-50 text-white font-sora font-bold text-sm shadow-md shadow-crimson/20 transition flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loading ? 'Generating FLUX Image...' : 'Generate FLUX Thumbnail'}</span>
              </button>
            </div>
          )}

          {/* VIDEO TITLES TAB */}
          {activeTab === 'titles' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-sora font-bold text-blueAccent uppercase tracking-wider">
                <Type className="w-4 h-4" />
                <span>VIRAL TITLE GENERATOR</span>
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Video Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js 15 Full Tutorial"
                  value={titleForm.topic}
                  onChange={(e) => setTitleForm({...titleForm, topic: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blueAccent/50"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Niche
                </label>
                <input
                  type="text"
                  placeholder="e.g. Web Development"
                  value={titleForm.niche}
                  onChange={(e) => setTitleForm({...titleForm, niche: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blueAccent/50"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beginner Coders & Freelancers"
                  value={titleForm.targetAudience}
                  onChange={(e) => setTitleForm({...titleForm, targetAudience: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blueAccent/50"
                />
              </div>

              <button
                onClick={generateTitles}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blueAccent to-royalBlue hover:opacity-90 disabled:opacity-50 text-white font-sora font-bold text-sm shadow-md shadow-blueAccent/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Generating Titles...' : 'Generate 5 Titles'}</span>
              </button>
            </div>
          )}

          {/* CONTENT IDEAS TAB */}
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-sora font-bold text-amber-500 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>CONTENT ROADMAP ENGINE</span>
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Channel Niche
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI & Tech Reviews"
                  value={ideasForm.niche}
                  onChange={(e) => setIdeasForm({...ideasForm, niche: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tech Enthusiasts & Early Adopters"
                  value={ideasForm.targetAudience}
                  onChange={(e) => setIdeasForm({...ideasForm, targetAudience: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <button
                onClick={generateIdeas}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 disabled:opacity-50 text-white font-sora font-bold text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loading ? 'Generating Ideas...' : 'Generate Roadmap'}</span>
              </button>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: GENERATED RESULTS WORKSPACE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800/80 shadow-premium min-h-[400px]">
            <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Output & Workspace</span>
            </h3>

            {/* THUMBNAIL RESULTS */}
            {activeTab === 'thumbnails' && (
              <div className="space-y-4">
                {thumbnails.length > 0 ? (
                  thumbnails.map((thumb, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 space-y-4">
                      {thumb.imageUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-sora font-bold text-sm text-crimson">{thumb.text}</span>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                              FLUX Dev 16:9
                            </span>
                          </div>

                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-gray-800 group shadow-lg">
                            <img src={thumb.imageUrl} alt="Generated Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                            <span>{thumb.layout}</span>
                            <a
                              href={thumb.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blueAccent hover:underline font-semibold flex items-center gap-1"
                            >
                              <span>Open High-Res</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-sora font-bold text-sm text-gray-900 dark:text-white">{thumb.text || thumb}</p>
                          {thumb.colors && <p className="text-xs text-gray-500 mt-1">Colors: {thumb.colors}</p>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-400 space-y-2">
                    <ImageIcon className="w-12 h-12 mx-auto opacity-40 text-crimson" />
                    <p className="font-sora text-sm">Enter a topic and click Generate FLUX Thumbnail</p>
                  </div>
                )}
              </div>
            )}

            {/* TITLE RESULTS */}
            {activeTab === 'titles' && (
              <div className="space-y-3">
                {titles.length > 0 ? (
                  titles.map((title, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 flex items-center justify-between group hover:border-blueAccent transition duration-200">
                      <span className="font-sora font-semibold text-sm text-gray-900 dark:text-white pr-4">
                        {title}
                      </span>
                      <button
                        onClick={() => copyToClipboard(title, idx)}
                        className="p-2 rounded-xl text-gray-400 hover:text-blueAccent hover:bg-white dark:hover:bg-gray-800 transition flex-shrink-0"
                        title="Copy title"
                      >
                        {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-400 space-y-2">
                    <Type className="w-12 h-12 mx-auto opacity-40 text-blueAccent" />
                    <p className="font-sora text-sm">Fill parameters to generate viral video titles</p>
                  </div>
                )}
              </div>
            )}

            {/* IDEAS RESULTS */}
            {activeTab === 'ideas' && (
              <div className="space-y-4">
                {ideas.length > 0 ? (
                  ideas.map((idea, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 space-y-2">
                      <h4 className="font-sora font-bold text-base text-gray-900 dark:text-white">
                        {idea.title || idea}
                      </h4>
                      {idea.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {idea.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-400 space-y-2">
                    <Lightbulb className="w-12 h-12 mx-auto opacity-40 text-amber-500" />
                    <p className="font-sora text-sm">Generate ideas to build your channel roadmap</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </section>

      {/* SECTION 4: FLOATING AI COPILOT CHAT DRAWER */}
      {showAiChat && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-3xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 shadow-premium-hover z-50 overflow-hidden flex flex-col h-96">
          <div className="p-4 bg-gradient-to-r from-blueAccent to-crimson text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-sora font-bold text-xs">
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Drishya AI Copilot</span>
            </div>
            <button onClick={() => setShowAiChat(false)} className="text-white/80 hover:text-white text-xs font-bold">
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-sans">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-crimson text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-[#171717] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI Copilot for advice..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none"
            />
            <button type="submit" className="p-2 rounded-xl bg-crimson text-white">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
