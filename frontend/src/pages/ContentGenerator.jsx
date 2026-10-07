import { useState } from 'react'
import { generatorAPI } from '../services/aiApi'
import { useUIStore } from '../stores/uiStore'
import { 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Type, 
  Lightbulb, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Bot, 
  Zap, 
  Layers,
  Sparkle,
  Palette,
  Layout as LayoutIcon
} from 'lucide-react'
import { 
  NeuCard, 
  NeuButton, 
  NeuInput, 
  NeuTab, 
  NeuChip, 
  NeuSkeleton 
} from '../components/ui'

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
      
      {/* SECTION 1: HERO LANDING BANNER (Tactile Neumorphic Extrusion) */}
      <section className="relative overflow-hidden rounded-3xl bg-neu-surface border border-neu-border p-6 sm:p-8 lg:p-10 shadow-neu-raised-lg">
        {/* Soft Tactile Accent Ambient Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blueAccent/10 via-crimson/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-crimson/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neu-surface shadow-neu-inset-xs border border-neu-border text-[11px] font-sora font-semibold tracking-wider text-crimson">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>DRISHYA AI CREATIVE WORKSPACE</span>
            </div>

            <h1 className="font-sora font-bold text-2xl sm:text-4xl lg:text-[40px] tracking-tight leading-tight text-neu-text">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson via-redAccent to-royalBlue">Smarter with AI.</span>
            </h1>

            <p className="text-xs sm:text-sm text-neu-text-secondary max-w-xl font-sans leading-relaxed">
              Supercharge your creative workflow. Generate 16:9 FLUX AI thumbnails, viral video titles, personalized content roadmaps, and high-retention concepts in seconds.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <NeuButton
                variant="primary"
                onClick={() => setActiveTab('thumbnails')}
                icon={ImageIcon}
              >
                FLUX Thumbnail Studio
              </NeuButton>

              <NeuButton
                variant="secondary"
                onClick={() => setShowAiChat(!showAiChat)}
                icon={Bot}
              >
                {showAiChat ? 'Hide AI Copilot' : 'Open AI Copilot'}
              </NeuButton>
            </div>
          </div>

          {/* AI Feature Badges Quick Switch */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <NeuCard variant="raised-sm" className="p-4 space-y-1.5" interactive>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-xs text-neu-text">FLUX.1 [dev]</h4>
              <p className="text-[11px] text-neu-text-muted">8K Photorealism</p>
            </NeuCard>

            <NeuCard variant="raised-sm" className="p-4 space-y-1.5" interactive>
              <div className="w-8 h-8 rounded-xl bg-blueAccent/10 text-blueAccent flex items-center justify-center">
                <Type className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-xs text-neu-text">Viral Titles</h4>
              <p className="text-[11px] text-neu-text-muted">High CTR Focus</p>
            </NeuCard>
          </div>
        </div>
      </section>

      {/* SECTION 2: AI TOOLS DASHBOARD (Tactile Physical Switches) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sora font-bold text-lg sm:text-xl text-neu-text flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-crimson/10 text-crimson">
              <Layers className="w-4 h-4" />
            </div>
            <span>AI Studio Tools</span>
          </h2>
          <span className="text-xs text-neu-text-muted font-sans hidden sm:inline">
            Select a generator engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeuTab
            active={activeTab === 'thumbnails'}
            onClick={() => setActiveTab('thumbnails')}
            icon={ImageIcon}
            label="Thumbnail Studio"
            subtitle="Generate 16:9 FLUX visuals"
            badge="FLUX.1"
            accentColor="crimson"
          />

          <NeuTab
            active={activeTab === 'titles'}
            onClick={() => setActiveTab('titles')}
            icon={Type}
            label="Title Generator"
            subtitle="SEO-optimized viral video titles"
            badge="High CTR"
            accentColor="blue"
          />

          <NeuTab
            active={activeTab === 'ideas'}
            onClick={() => setActiveTab('ideas')}
            icon={Lightbulb}
            label="Content Roadmap"
            subtitle="Personalized niche video ideas"
            badge="AI Strategy"
            accentColor="amber"
          />
        </div>
      </section>

      {/* SECTION 3: SPLIT WORKSPACE (Prompt Editor Left, Generated Results Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: PROMPT CONTROLS */}
        <NeuCard className="lg:col-span-5 p-6 sm:p-8 space-y-6">
          
          {/* THUMBNAIL STUDIO TAB */}
          {activeTab === 'thumbnails' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sora font-bold text-crimson uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>FLUX.1 [DEV] THUMBNAIL ENGINE</span>
                </div>
                <NeuChip variant="accent" size="xs">Visual AI</NeuChip>
              </div>

              <NeuInput
                label="Video Topic"
                placeholder="e.g. Building a SaaS Product in 2026"
                value={thumbnailForm.topic}
                onChange={(e) => setThumbnailForm({...thumbnailForm, topic: e.target.value})}
                helperText="Be specific about the main hook or story of your video"
              />

              <NeuInput
                label="Category / Niche"
                placeholder="e.g. Technology, Gaming, Lifestyle"
                value={thumbnailForm.category}
                onChange={(e) => setThumbnailForm({...thumbnailForm, category: e.target.value})}
              />

              <NeuInput
                label="Tone & Visual Mood"
                placeholder="e.g. Energetic, Cinematic, Dark Minimalist"
                value={thumbnailForm.mood}
                onChange={(e) => setThumbnailForm({...thumbnailForm, mood: e.target.value})}
              />

              <NeuButton
                variant="primary"
                onClick={generateThumbnails}
                disabled={loading}
                loading={loading}
                icon={Wand2}
                className="w-full mt-2"
                size="lg"
              >
                {loading ? 'Generating FLUX Thumbnail...' : 'Generate FLUX Thumbnail'}
              </NeuButton>
            </div>
          )}

          {/* VIDEO TITLES TAB */}
          {activeTab === 'titles' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sora font-bold text-blueAccent uppercase tracking-wider">
                  <Type className="w-4 h-4" />
                  <span>VIRAL TITLE GENERATOR</span>
                </div>
                <NeuChip variant="blue" size="xs">SEO Engine</NeuChip>
              </div>

              <NeuInput
                label="Video Topic"
                placeholder="e.g. Next.js 15 Full Tutorial"
                value={titleForm.topic}
                onChange={(e) => setTitleForm({...titleForm, topic: e.target.value})}
                helperText="What is the central premise or tutorial topic?"
              />

              <NeuInput
                label="Niche"
                placeholder="e.g. Web Development"
                value={titleForm.niche}
                onChange={(e) => setTitleForm({...titleForm, niche: e.target.value})}
              />

              <NeuInput
                label="Target Audience"
                placeholder="e.g. Beginner Coders & Freelancers"
                value={titleForm.targetAudience}
                onChange={(e) => setTitleForm({...titleForm, targetAudience: e.target.value})}
              />

              <NeuButton
                variant="accent"
                onClick={generateTitles}
                disabled={loading}
                loading={loading}
                icon={Sparkles}
                className="w-full mt-2"
                size="lg"
              >
                {loading ? 'Generating Titles...' : 'Generate 5 Titles'}
              </NeuButton>
            </div>
          )}

          {/* CONTENT IDEAS TAB */}
          {activeTab === 'ideas' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sora font-bold text-amber-500 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>CONTENT ROADMAP ENGINE</span>
                </div>
                <NeuChip variant="amber" size="xs">Strategy AI</NeuChip>
              </div>

              <NeuInput
                label="Channel Niche"
                placeholder="e.g. AI & Tech Reviews"
                value={ideasForm.niche}
                onChange={(e) => setIdeasForm({...ideasForm, niche: e.target.value})}
                helperText="Your core domain or channel theme"
              />

              <NeuInput
                label="Target Audience"
                placeholder="e.g. Tech Enthusiasts & Early Adopters"
                value={ideasForm.targetAudience}
                onChange={(e) => setIdeasForm({...ideasForm, targetAudience: e.target.value})}
              />

              <NeuButton
                variant="warning"
                onClick={generateIdeas}
                disabled={loading}
                loading={loading}
                icon={Wand2}
                className="w-full mt-2"
                size="lg"
              >
                {loading ? 'Generating Ideas...' : 'Generate Roadmap'}
              </NeuButton>
            </div>
          )}

        </NeuCard>

        {/* RIGHT PANEL: GENERATED RESULTS WORKSPACE */}
        <NeuCard className="lg:col-span-7 p-6 sm:p-8 space-y-6 min-h-[460px]">
          <div className="flex items-center justify-between pb-2 border-b border-neu-border">
            <h3 className="font-sora font-bold text-base sm:text-lg text-neu-text flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Sparkle className="w-4 h-4" />
              </div>
              <span>AI Output & Workspace</span>
            </h3>

            {/* Quick Status Pill */}
            {loading ? (
              <NeuChip variant="accent" size="xs">
                Processing AI request...
              </NeuChip>
            ) : (
              <span className="text-xs text-neu-text-muted font-sans">
                {activeTab === 'thumbnails' && `${thumbnails.length} concept(s)`}
                {activeTab === 'titles' && `${titles.length} title(s)`}
                {activeTab === 'ideas' && `${ideas.length} idea(s)`}
              </span>
            )}
          </div>

          {/* SKELETON LOADER STATE */}
          {loading && (
            <div className="space-y-4 py-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-neu-surface shadow-neu-inset-xs border border-neu-border space-y-4">
                <div className="flex items-center justify-between">
                  <NeuSkeleton height="h-5" width="w-48" />
                  <NeuSkeleton height="h-5" width="w-20" rounded="rounded-full" />
                </div>
                <NeuSkeleton height="h-44" rounded="rounded-xl" />
                <div className="flex justify-between items-center pt-2">
                  <NeuSkeleton height="h-4" width="w-32" />
                  <NeuSkeleton height="h-4" width="w-24" />
                </div>
              </div>
            </div>
          )}

          {/* THUMBNAIL RESULTS */}
          {!loading && activeTab === 'thumbnails' && (
            <div className="space-y-5">
              {thumbnails.length > 0 ? (
                thumbnails.map((thumb, idx) => (
                  <NeuCard key={idx} variant="raised-sm" className="p-5 space-y-4">
                    {thumb.imageUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-sora font-bold text-sm text-crimson">
                            {thumb.text || 'Generated Visual Concept'}
                          </span>
                          <NeuChip variant="success" size="xs">
                            FLUX Dev 16:9
                          </NeuChip>
                        </div>

                        {/* 16:9 Preview Frame with Tactile Bevel */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-neu-raised-sm border border-neu-border group">
                          <img 
                            src={thumb.imageUrl} 
                            alt="Generated Thumbnail" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          {thumb.layout && (
                            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[11px] font-sora text-white/90">
                              Layout: {thumb.layout}
                            </div>
                          )}
                        </div>

                        {/* Visual chips & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex flex-wrap gap-1.5">
                            {thumb.colors && (
                              <NeuChip variant="inset" size="xs" icon={Palette}>
                                {thumb.colors}
                              </NeuChip>
                            )}
                            {thumb.layout && (
                              <NeuChip variant="inset" size="xs" icon={LayoutIcon}>
                                {thumb.layout}
                              </NeuChip>
                            )}
                          </div>

                          <a
                            href={thumb.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neu-surface shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs text-xs font-sora font-semibold text-blueAccent hover:text-royalBlue border border-neu-border transition-all duration-200"
                          >
                            <span>Open High-Res</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-sora font-bold text-sm text-neu-text">
                          {thumb.text || thumb}
                        </p>
                        {thumb.colors && (
                          <p className="text-xs text-neu-text-muted">
                            Colors: {thumb.colors}
                          </p>
                        )}
                      </div>
                    )}
                  </NeuCard>
                ))
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-neu-surface shadow-neu-inset-sm border border-neu-border mx-auto flex items-center justify-center text-crimson/70">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-sora font-bold text-sm text-neu-text">No thumbnails generated yet</h4>
                  <p className="font-sans text-xs text-neu-text-muted max-w-xs mx-auto">
                    Enter a video topic on the left and click "Generate FLUX Thumbnail" to synthesize 16:9 visual concepts.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TITLE RESULTS */}
          {!loading && activeTab === 'titles' && (
            <div className="space-y-3">
              {titles.length > 0 ? (
                titles.map((title, idx) => (
                  <NeuCard 
                    key={idx} 
                    variant="raised-sm" 
                    className="p-4 flex items-center justify-between gap-4 group hover:border-blueAccent/40 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-blueAccent/10 text-blueAccent text-xs font-sora font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-sora font-semibold text-xs sm:text-sm text-neu-text leading-snug">
                        {title}
                      </span>
                    </div>

                    <NeuButton
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(title, idx)}
                      title="Copy title"
                      aria-label="Copy title"
                      className="text-neu-text-muted hover:text-blueAccent"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </NeuButton>
                  </NeuCard>
                ))
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-neu-surface shadow-neu-inset-sm border border-neu-border mx-auto flex items-center justify-center text-blueAccent/70">
                    <Type className="w-6 h-6" />
                  </div>
                  <h4 className="font-sora font-bold text-sm text-neu-text">Ready to generate viral titles</h4>
                  <p className="font-sans text-xs text-neu-text-muted max-w-xs mx-auto">
                    Provide topic and target audience parameters to generate 5 high-CTR, SEO-optimized title candidates.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* IDEAS RESULTS */}
          {!loading && activeTab === 'ideas' && (
            <div className="space-y-4">
              {ideas.length > 0 ? (
                ideas.map((idea, idx) => (
                  <NeuCard key={idx} variant="raised-sm" className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-sora font-bold text-sm sm:text-base text-neu-text">
                        {idea.title || idea}
                      </h4>
                      <NeuChip variant="amber" size="xs">
                        Concept #{idx + 1}
                      </NeuChip>
                    </div>

                    {idea.description && (
                      <p className="text-xs text-neu-text-secondary leading-relaxed font-sans">
                        {idea.description}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <NeuButton
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(idea.title || idea, `idea-${idx}`)}
                        icon={copiedIdx === `idea-${idx}` ? Check : Copy}
                      >
                        {copiedIdx === `idea-${idx}` ? 'Copied' : 'Copy Concept'}
                      </NeuButton>
                    </div>
                  </NeuCard>
                ))
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-neu-surface shadow-neu-inset-sm border border-neu-border mx-auto flex items-center justify-center text-amber-500/70">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h4 className="font-sora font-bold text-sm text-neu-text">Roadmap awaits</h4>
                  <p className="font-sans text-xs text-neu-text-muted max-w-xs mx-auto">
                    Fill in your channel niche and audience to brainstorm targeted video roadmaps and content angles.
                  </p>
                </div>
              )}
            </div>
          )}

        </NeuCard>

      </section>

      {/* SECTION 4: FLOATING AI COPILOT CHAT DRAWER */}
      {showAiChat && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-3xl bg-neu-surface border border-neu-border shadow-neu-raised-lg z-50 overflow-hidden flex flex-col h-[420px] transition-all duration-300">
          
          {/* Header */}
          <div className="p-4 bg-neu-surface border-b border-neu-border flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-sora font-bold text-xs text-neu-text">
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500">
                <Bot className="w-4 h-4" />
              </div>
              <span>Drishya AI Copilot</span>
            </div>
            <button 
              onClick={() => setShowAiChat(false)} 
              className="p-1 rounded-lg text-neu-text-muted hover:text-crimson transition"
              aria-label="Close Copilot"
            >
              ✕
            </button>
          </div>

          {/* Chat history */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-sans">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-crimson to-redAccent text-white shadow-neu-glow-crimson rounded-br-none' 
                    : 'bg-neu-surface shadow-neu-inset-xs text-neu-text border border-neu-border rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-neu-border flex gap-2 bg-neu-surface">
            <input
              type="text"
              placeholder="Ask AI Copilot for advice..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-neu-surface text-neu-text placeholder:text-neu-text-muted border border-neu-border shadow-neu-inset-xs text-xs font-sans focus:outline-none focus:ring-2 focus:ring-crimson/50"
            />
            <NeuButton 
              type="submit" 
              variant="primary" 
              size="icon"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </NeuButton>
          </form>
        </div>
      )}

    </div>
  )
}
