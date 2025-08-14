import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Core states
  const [viewMode, setViewMode] = useState('Web') // 'Web' or 'App'
  const [currentPage, setCurrentPage] = useState('Home')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('preview') // 'preview' or 'code'
  const [selectedPlatform, setSelectedPlatform] = useState('Web')
  
  // Generated content
  const [generatedPages, setGeneratedPages] = useState({})
  const [currentCode, setCurrentCode] = useState({ html: '', css: '' })
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', js: '' })
  
  // UI states
  const [isHoveringViewport, setIsHoveringViewport] = useState(false)
  const [commandInput, setCommandInput] = useState('')
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [designDescription, setDesignDescription] = useState('')
  const [generatedDesign, setGeneratedDesign] = useState(null)
  const [projectHistory, setProjectHistory] = useState([])
  const [showDesignSpec, setShowDesignSpec] = useState(false)
  
  const GEMINI_API_KEY = 'AIzaSyBlX_L1gawWBjMf2hV9Mx0qQUVItAFMjE4'
  
  // Load project history from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projectHistory')
    if (savedProjects) {
      try {
        setProjectHistory(JSON.parse(savedProjects))
      } catch (error) {
        console.error('Error loading project history:', error)
      }
    }
  }, [])
  
  // Save project history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('projectHistory', JSON.stringify(projectHistory))
  }, [projectHistory])
  
  const saveProject = (description, platform, designSpec) => {
    const newProject = {
      id: Date.now(),
      title: description.length > 50 ? description.substring(0, 50) + '...' : description,
      subtitle: platform,
      type: platform.toLowerCase(),
      date: new Date().toLocaleDateString(),
      description: description,
      designSpec: designSpec,
      timestamp: new Date().toISOString()
    }
    
    setProjectHistory(prev => [newProject, ...prev.slice(0, 19)]) // Keep only last 20 projects
  }
  
  const loadProject = (project) => {
    setDesignDescription(project.description)
    setSelectedPlatform(project.subtitle)
    setGeneratedDesign(project.designSpec)
    setIsGenerating(true)
  }
  
  const pages = ['Home', 'Features', 'Pricing', 'About', 'Contact', 'Login', 'Signup', 'Dashboard']

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const handleWheel = (e) => {
    // Only allow zoom in preview area with generated content
    if (!generatedCode.html || !isHoveringViewport) {
      // Use a more compatible approach for preventing default
      try {
        e.preventDefault()
      } catch (error) {
        // If preventDefault fails, try alternative approach
        e.stopImmediatePropagation()
      }
      return false
    }
    
    // Use a more compatible approach for preventing default
    try {
      e.preventDefault()
      e.stopPropagation()
    } catch (error) {
      // If preventDefault fails, try alternative approach
      e.stopImmediatePropagation()
    }
    
    const delta = e.deltaY
    if (delta < 0) {
      // Zoom in
      setZoomLevel(prev => Math.min(prev + 10, 200))
    } else {
      // Zoom out
      setZoomLevel(prev => Math.max(prev - 10, 50))
    }
    
    return false
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 100 && generatedCode.html) {
      // Use a more compatible approach for preventing default
      try {
        e.preventDefault()
      } catch (error) {
        // If preventDefault fails, try alternative approach
        e.stopImmediatePropagation()
      }
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning && zoomLevel > 100 && generatedCode.html) {
      // Use a more compatible approach for preventing default
      try {
        e.preventDefault()
      } catch (error) {
        // If preventDefault fails, try alternative approach
        e.stopImmediatePropagation()
      }
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleViewportEnter = () => {
    setIsHoveringViewport(true)
  }

  const handleViewportLeave = () => {
    setIsHoveringViewport(false)
    setIsPanning(false)
  }

  const resetZoom = () => {
    setZoomLevel(100)
    setPanOffset({ x: 0, y: 0 })
  }



  // Prevent all website zoom and only allow preview zoom
  useEffect(() => {
    const preventGlobalZoom = (e) => {
      // Always prevent default browser zoom
      if (e.ctrlKey || e.metaKey) {
        try {
          e.preventDefault()
        } catch (error) {
          e.stopImmediatePropagation()
        }
        return false
      }
      
      // Prevent wheel zoom unless in our preview area
      if (!isHoveringViewport || !generatedCode.html) {
        try {
          e.preventDefault()
        } catch (error) {
          e.stopImmediatePropagation()
        }
        return false
      }
    }

    const preventKeyboardZoom = (e) => {
      // Prevent Ctrl/Cmd + Plus/Minus/0 zoom
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=' || e.key === '_')) {
        e.preventDefault()
        return false
      }
    }

    // Add event listeners
    document.addEventListener('wheel', preventGlobalZoom, { passive: false })
    document.addEventListener('keydown', preventKeyboardZoom, { passive: false })
    
    // Prevent pinch zoom on touch devices
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        try {
          e.preventDefault()
        } catch (error) {
          e.stopImmediatePropagation()
        }
      }
    }, { passive: false })

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        try {
          e.preventDefault()
        } catch (error) {
          e.stopImmediatePropagation()
        }
      }
    }, { passive: false })

    return () => {
      document.removeEventListener('wheel', preventGlobalZoom)
      document.removeEventListener('keydown', preventKeyboardZoom)
      document.removeEventListener('touchstart', preventGlobalZoom)
      document.removeEventListener('touchmove', preventGlobalZoom)
    }
  }, [isHoveringViewport, generatedCode.html])

  const parseGeneratedCode = (response) => {
    const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/)
    const cssMatch = response.match(/```css\n([\s\S]*?)\n```/)
    const jsMatch = response.match(/```javascript\n([\s\S]*?)\n```/)

    return {
      html: htmlMatch ? htmlMatch[1].trim() : '',
      css: cssMatch ? cssMatch[1].trim() : '',
      js: jsMatch ? jsMatch[1].trim() : ''
    }
  }

  const validateImageCount = (html, css) => {
    // Count Unsplash images in HTML
    const unsplashImages = html.match(/https:\/\/images\.unsplash\.com\/photo-[^"'\s]+/g) || []
    const uniqueImages = [...new Set(unsplashImages)]
    
    if (uniqueImages.length < 4) {
      return {
        isValid: false,
        message: `Warning: Only ${uniqueImages.length} unique images found. The design should include at least 4-6 different images for visual richness.`,
        imageCount: uniqueImages.length
      }
    }
    
    return {
      isValid: true,
      message: `Great! Found ${uniqueImages.length} unique images in the design.`,
      imageCount: uniqueImages.length
    }
  }

  const recentProjects = [
    {
      title: "Login",
      subtitle: "Mobile",
      type: "mobile",
      date: "Yesterday"
    },
    {
      title: "Home Page",
      subtitle: "Web",
      type: "web",
      date: "Last 7 days"
    },
    {
      title: "Login",
      subtitle: "Mobile",
      type: "mobile",
      date: "Last 7 days"
    },
    {
      title: "CrickPro is a cricket scoreboard app with a futuristic and animated UI, similar to...",
      subtitle: "Mobile",
      type: "mobile",
      date: "This year"
    },
    {
      title: "Futuristic music streaming app design inspired by Spotify, called 'Stitch Music'. T...",
      subtitle: "Mobile",
      type: "mobile",
      date: "This year"
    },
    {
      title: "New design",
      subtitle: "Mobile",
      type: "mobile",
      date: "This year"
    }
  ]

  const examples = [
    {
      title: "Indoor Plant Care Dashboard",
      subtitle: "Web"
    },
    {
      title: "Abs skiing guide",
      subtitle: "Mobile"
    }
  ]

  const prompts = [
    "A bronze tab for a mobile app for romance and date night ideas",
    "The user profile page for a guided meditation and mindfulness app"
  ]

  const callGeminiAPI = async (prompt, isFollowUp = false) => {
    try {
      let apiPrompt = ''
      
                      if (isFollowUp) {
          apiPrompt = `Based on our previous conversation about the ${selectedPlatform.toLowerCase()} design, please respond to this follow-up: "${prompt}". Provide updated visual mockups following the same design system and requirements.`
        } else {
          apiPrompt = `Create a complete ${selectedPlatform.toLowerCase()} visual design mockup based on this request: "${prompt}".

IMPORTANT: Output is IMAGES ONLY (mockups/visuals). NO HTML/CSS/JS/code, NO wireframes.

Platform Mode:
- If ${selectedPlatform === 'Mobile'} → mobile-first responsive designs (phone → tablet)
- Else → desktop-focused with mobile compatibility

Modern Visual System:
- Grids, flex-style layouts, custom properties (tokens)
- Gradients, soft shadows, elevated cards
- Empty/error/loading states, micro-interactions

Accessibility:
- Semantic structure cues, clear contrast, readable hierarchy
- WCAG-friendly sizes, ARIA-like affordances indicated in captions/metadata

Imagery Requirements:
- Use MULTIPLE Unsplash images with unique photo IDs (no repeats)
- At least 6 total images across the pack
- Use these URL forms:
  * Hero/banner: https://images.unsplash.com/photo-[id]?w=800&h=400&fit=crop
  * Profile/avatar: https://images.unsplash.com/photo-[id]?w=150&h=150&fit=crop
  * Product/card: https://images.unsplash.com/photo-[id]?w=300&h=200&fit=crop
  * Background: https://images.unsplash.com/photo-[id]?w=1200&h=800&fit=crop

Icons: Use Unicode or simple CSS-style iconography (arrows, stars, hearts, play/pause, etc.)

Realism: Realistic copy and data (names, prices, durations, timestamps), professional spacing, typography, and hierarchy

Animations (as stills): Indicate interactions via micro-states: hover, pressed, focus, loading, success, error

Workflow (emulate Stitch AI):
1. Understand Brief → extract app type, audience, tone, IA, primary tasks, brand mood
2. Screen Planning → define full screen inventory and navigational flow
3. Design Tokens → color palette, type scale, spacing scale, radii, elevations, effects, states
4. Layout Composition → apply grids, rhythm, alignment; choose patterns (cards, lists, tabs, modals, filters, forms)
5. Styling & Accessibility → apply colors/contrast, semantic roles, focus indications, readable sizes
6. State Coverage → design loading/skeleton, empty, error, and success states for critical screens
7. Imagery Integration → place Unsplash assets contextually with unique IDs and alt text
8. Preview Pack → export polished screen images with device frames (optional) and compact spec

Design Tokens (example defaults; adapt to brief):
- Color tokens: --bg-0, --bg-1, --surface, --text-0, --text-1, --brand, --brand-2, --accent, --success, --warning, --error, --border
- Typography: fluid scale (Display 40/48/64, H1 32, H2 24, H3 20, Body 16/14, Caption 12), 1.5–1.7 line-height
- Spacing: 4, 8, 12, 16, 24, 32, 48 system
- Radii: 6, 12, 20 (cards/buttons/chips)
- Elevation: 0/1/2/3 with soft layered shadows
- Effects: subtle gradients, glassmorphism panels optional, motion blur hints
- States: hover, focus (visible), active/pressed, disabled, loading, success, error

Screen Set (minimum):
- Auth: Splash, Sign in, Create account, Forgot password
- Primary: Home/Feed, Search/Filters, Detail (entity page), List/Collection, Create/Edit entity
- System: Settings, Profile, Notifications, Help/Support
- States: Loading/Skeleton, Empty (per primary), Error (network/form), 404/No results

Interactivity Simulation (as visuals):
- Hover and pressed button states, focus rings on inputs
- Filter chip selected/unselected, toggles on/off
- Sliders before/after, toast/snackbar examples, modal open state
- Show at least one animation concept per primary flow

Deliverables:
- A Design Pack of images (one per screen and key state)
- Alongside each image, include metadata: Screen name, purpose, key components, tokens used, interaction states shown, accessibility notes
- List the Unsplash URLs used on that screen with alt text

Target sizes:
- Mobile: 390×844 (iPhone 15 class) or close
- Desktop: 1440×1024 or 1440×900

Strict Don'ts:
- Don't output code, CSS, Figma JSON, or raw layer dumps
- Don't show low-fidelity wireframes
- Don't reuse Unsplash photo IDs
- Don't omit loading/empty/error states

Format your response as a visual design specification with image descriptions and metadata, NOT as code.`
        }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      // Try a set of known models; stop at the first that succeeds
      const modelCandidates = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
      ]

      let lastError
      let data
      for (const model of modelCandidates) {
        try {
          console.log(`Trying Gemini model: ${model}`)
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Use lowercase per docs
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: apiPrompt
                }]
              }]
            }),
            signal: controller.signal
          })

          if (!response.ok) {
            if (response.status === 404) {
              lastError = new Error(`HTTP 404 for model ${model}`)
              continue
            }
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          data = await response.json()
          break
        } catch (err) {
          lastError = err
          if (err?.name === 'AbortError') {
            break
          }
        }
      }

      clearTimeout(timeoutId)

      if (!data) {
        throw lastError || new Error('No response from Gemini API')
      }
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      return 'Sorry, I encountered an error while generating the design. Please try again.'
    }
  }

  const handleGenerate = async () => {
    if (designDescription.trim()) {
      setIsGenerating(true)
      setIsLoading(true)
      
      // Add initial message to chat
      const initialMessages = [
        {
          id: 1,
          type: 'user',
          content: designDescription,
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'ai',
          content: 'I\'ll create a design based on your description. Let me generate some options for you...',
          timestamp: new Date()
        }
      ]
      setChatMessages(initialMessages)

      // Call Gemini API
      const aiResponse = await callGeminiAPI(designDescription)
      setIsLoading(false)
      
             // Save the design specification
       setGeneratedDesign(aiResponse)
       
       // Save project to history
       saveProject(designDescription, selectedPlatform, aiResponse)
       
       // Update chat with AI response
       const updatedMessages = [
         ...initialMessages,
         {
           id: 3,
           type: 'ai',
           content: 'Design mockup generated successfully! Your visual design specification is ready. You can view the design details by clicking the "View Design" button.',
           timestamp: new Date()
         }
       ]
       setChatMessages(updatedMessages)
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages')
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      }, 100)
    }
  }

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        type: 'user',
        content: chatInput,
        timestamp: new Date()
      }
      const updatedMessages = [...chatMessages, newMessage]
      setChatMessages(updatedMessages)
      setChatInput('')
      setIsLoading(true)
      
      // Call Gemini API with context
      const aiResponse = await callGeminiAPI(chatInput, true)
      setIsLoading(false)
      
      // Update the design specification
      setGeneratedDesign(aiResponse)
      
      const aiMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: 'I\'ve updated your design based on your request. The changes are now applied to your preview.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages')
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      }, 100)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="search-container">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input type="text" placeholder="Search designs" className="search-input" />
          </div>
        </div>
        
        <div className="header-center">
          <div className="logo">
            <span className="logo-text">Stitch</span>
            <span className="beta-badge">BETA</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="menu-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="19" cy="12" r="1" fill="currentColor"/>
              <circle cx="5" cy="12" r="1" fill="currentColor"/>
            </svg>
          </button>
          <div className="profile-avatar">
            <span>A</span>
          </div>
        </div>
      </header>

      <div className={`main-container ${isGenerating ? 'generating' : ''}`}>
        {/* Sidebar - only show when not generating */}
        {!isGenerating && (
          <aside className="sidebar">
            {projectHistory.length > 0 ? (
              <div className="sidebar-section">
                <h3 className="sidebar-title">Recent Projects</h3>
                {projectHistory.map((project) => (
                  <div 
                    key={project.id} 
                    className="project-item clickable"
                    onClick={() => loadProject(project)}
                    title="Click to load this project"
                  >
                    <div className={`project-thumbnail ${project.type}`}></div>
                    <div className="project-info">
                      <div className="project-title">{project.title}</div>
                      <div className="project-subtitle">{project.subtitle}</div>
                      <div className="project-date">{project.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sidebar-section">
                <h3 className="sidebar-title">No Projects Yet</h3>
                <p className="sidebar-empty-text">Create your first design to see it here!</p>
              </div>
            )}
          </aside>
        )}

        {/* Main Content */}
        <main className="main-content">
          {!isGenerating ? (
            <div className="design-creator">
              <div className="creator-header">
                <h1 className="creator-title">Start a new design in</h1>
                <div className="mode-selector">
                  <span>Standard mode</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              <div className="design-input-container">
                <textarea
                  className="design-input"
                  placeholder="Describe your design"
                  value={designDescription}
                  onChange={(e) => setDesignDescription(e.target.value)}
                />
                
                <div className="input-footer">
                  <div className="platform-selector">
                    <button 
                      className={`platform-btn ${selectedPlatform === 'Mobile' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('Mobile')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Mobile
                    </button>
                    <button 
                      className={`platform-btn ${selectedPlatform === 'Web' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('Web')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Web
                    </button>
                  </div>
                  
                  <button className="generate-btn" onClick={handleGenerate}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Generate
                  </button>
                </div>
              </div>

              <div className="prompts-section">
                <h3 className="prompts-title">Try these prompts</h3>
                <div className="prompt-buttons">
                  {prompts.map((prompt, index) => (
                    <button 
                      key={index} 
                      className="prompt-btn"
                      onClick={() => setDesignDescription(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="generation-interface">
              {/* Chat Panel */}
              <div className="chat-panel">
                <div className="chat-header">
                  <div className="chat-title">
                    <div className="chat-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Stitch</span>
                    </div>
                  </div>
                  <button className="close-chat" onClick={() => setIsGenerating(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>

                <div className="chat-messages">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`message ${message.type}`}>
                      <div className="message-content">
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="message ai">
                      <div className="message-content loading">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-container">
                  <input
                    type="text"
                    placeholder="Describe your design"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="chat-input"
                  />
                  <button onClick={handleSendMessage} className="send-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>

                <div className="chat-footer">
                  <span>Stitch can make mistakes. Please check its work.</span>
                </div>
              </div>

              {/* Design Output Panel */}
              <div className="output-panel">
                <div 
                  className="stitch-viewport" 
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div className="viewport-background">
                    <div className="grid-pattern"></div>
                  </div>
                  
                  <div 
                    className="viewport-content"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
                    }}
                  >
                    {isLoading ? (
                      <div className="stitch-loading">
                        <div className="loading-container">
                          <div className="loading-dots">
                            <div className="dot dot-1"></div>
                            <div className="dot dot-2"></div>
                            <div className="dot dot-3"></div>
                            <div className="dot dot-4"></div>
                          </div>
                          <div className="loading-text">
                            <div className="loading-title">Generating your design</div>
                            <div className="loading-subtitle">This may take a few moments...</div>
                          </div>
                          <div className="loading-progress">
                            <div className="progress-bar">
                              <div className="progress-fill"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : generatedDesign ? (
                      <div className={`preview-container ${selectedPlatform.toLowerCase()}`}>
                        <div className="preview-frame" style={{ transform: `scale(${zoomLevel / 100})` }}>
                          <div className="design-mockup-placeholder">
                            <div className="mockup-header">
                              <h3>Design Mockup Generated</h3>
                              <p>Your visual design specification is ready</p>
                            </div>
                            <div className="mockup-content">
                              <div className="mockup-icon">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              </div>
                              <div className="mockup-info">
                                <h4>Visual Design Specification</h4>
                                <p>This contains:</p>
                                <ul>
                                  <li>Multiple screen mockups</li>
                                  <li>Design tokens and visual system</li>
                                  <li>Accessibility guidelines</li>
                                  <li>Unsplash image integration</li>
                                  <li>Interactive states</li>
                                </ul>
                                <p>Click "View Design" to see the complete specification.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-preview">
                        <div className="empty-icon">
                          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1"/>
                            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="1"/>
                          </svg>
                        </div>
                        <div className="empty-text">
                          <h3>Your design will appear here</h3>
                          <p>Start by describing your design idea in the chat</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Design Specification Panel */}
                  {showDesignSpec && generatedDesign && (
                    <div className="design-spec-panel">
                      <div className="design-spec-header">
                        <h3>Design Specification</h3>
                        <button 
                          className="close-design-spec-btn"
                          onClick={() => setShowDesignSpec(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                      <div className="design-spec-content">
                        <div className="design-spec-text">
                          <h4>Visual Design Mockup</h4>
                          <p>This design specification contains visual mockups and design tokens for your application.</p>
                          <div className="design-spec-details">
                            <h5>Key Features:</h5>
                            <ul>
                              <li>Multiple screen mockups with device frames</li>
                              <li>Design tokens and visual system</li>
                              <li>Accessibility guidelines and WCAG compliance</li>
                              <li>Unsplash image integration with unique IDs</li>
                              <li>Interactive states and micro-animations</li>
                            </ul>
                          </div>
                          <div className="design-spec-note">
                            <p><strong>Note:</strong> This is a visual design specification, not code. The AI generates design mockups, layouts, and visual specifications that can be used by designers and developers.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Floating Controls */}
                  <div className="floating-controls">
                    <div className="control-group zoom-controls">
                      <button className="control-btn zoom-out" title="Zoom Out" onClick={handleZoomOut}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                          <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
                          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="zoom-level-btn" title="Reset Zoom" onClick={resetZoom}>
                        {zoomLevel}%
                      </button>
                      <button className="control-btn zoom-in" title="Zoom In" onClick={handleZoomIn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                          <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="2"/>
                          <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
                          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>

                    <div className="control-group view-controls">
                      <button 
                        className={`control-btn ${selectedPlatform === 'Mobile' ? 'active' : ''}`}
                        onClick={() => setSelectedPlatform('Mobile')}
                        title="Mobile View"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button 
                        className={`control-btn ${selectedPlatform === 'Web' ? 'active' : ''}`}
                        onClick={() => setSelectedPlatform('Web')}
                        title="Desktop View"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>

                    <div className="control-group action-controls">
                      <button 
                        className={`control-btn ${showDesignSpec ? 'active' : ''}`} 
                        title="View Design"
                        onClick={() => setShowDesignSpec(!showDesignSpec)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="control-btn" title="Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
