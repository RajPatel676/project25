import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Core app states
  const [viewMode, setViewMode] = useState('Web')
  const [currentPage, setCurrentPage] = useState('Home')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
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
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showTemplates, setShowTemplates] = useState(false)
  
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
  
  const saveProject = (description, platform, generatedCode) => {
    const newProject = {
      id: Date.now(),
      title: description.length > 50 ? description.substring(0, 50) + '...' : description,
      subtitle: platform,
      type: platform.toLowerCase(),
      date: new Date().toLocaleDateString(),
      description: description,
      code: generatedCode,
      timestamp: new Date().toISOString()
    }
    
    setProjectHistory(prev => [newProject, ...prev.slice(0, 19)]) // Keep only last 20 projects
  }
  
  const loadProject = (project) => {
    setDesignDescription(project.description)
    setSelectedPlatform(project.subtitle)
    setGeneratedCode(project.code)
    setGeneratedDesign(project.description)
    setIsGenerating(true)
  }
  
  const pages = ['Home', 'Features', 'Pricing', 'About', 'Contact', 'Login', 'Signup', 'Dashboard']

  // Enhanced zoom and pan functionality
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const handleWheel = (e) => {
    // Only allow zoom in preview area with generated content
    if (!generatedCode.html || !isHoveringViewport) {
      e.preventDefault()
      return false
    }
    
    e.preventDefault()
    e.stopPropagation()
    
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
      e.preventDefault()
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning && zoomLevel > 100 && generatedCode.html) {
      e.preventDefault()
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
        e.preventDefault()
        return false
      }
      
      // Prevent wheel zoom unless in our preview area
      if (!isHoveringViewport || !generatedCode.html) {
        e.preventDefault()
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
        e.preventDefault()
      }
    }, { passive: false })

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
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

  // Quick templates for common design patterns
  const quickTemplates = [
    "Modern dashboard with dark theme and neon accents",
    "Minimalist landing page with hero section",
    "Mobile app interface with rounded corners",
    "E-commerce product grid with hover effects",
    "Social media feed with card-based layout"
  ]

  const callGeminiAPI = async (prompt, isFollowUp = false) => {
    try {
      let apiPrompt = ''
      
      if (isFollowUp) {
        apiPrompt = `Based on our previous conversation about the ${selectedPlatform.toLowerCase()} design, please respond to this follow-up: "${prompt}". If the user is asking for code modifications, provide the updated HTML, CSS, and JavaScript code in the same format as before.`
      } else {
        apiPrompt = `Create a complete ${selectedPlatform.toLowerCase()} UI design based on this request: "${prompt}".

Please provide:
1. A brief description of the design concept
2. Complete HTML code
3. Complete CSS code (including responsive design)
4. JavaScript code for interactions (if needed)

Format your response exactly like this:

## Design Concept
[Brief description of the design]

## HTML
\`\`\`html
[Complete HTML code here]
\`\`\`

## CSS
\`\`\`css
[Complete CSS code here]
\`\`\`

## JavaScript
\`\`\`javascript
[Complete JavaScript code here]
\`\`\`

Requirements:
- Make it ${selectedPlatform === 'Mobile' ? 'mobile-first responsive' : 'desktop-focused with mobile compatibility'}
- Use modern CSS features (Flexbox, Grid, CSS Variables)
- Include smooth animations and transitions
- Ensure accessibility standards
- Optimize for performance`
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: apiPrompt
            }]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      throw error
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
      
      // Parse the generated code
      const parsedCode = parseGeneratedCode(aiResponse)
      setGeneratedCode(parsedCode)
      
      // Save project to history
      saveProject(designDescription, selectedPlatform, parsedCode)
      
      // Update chat with AI response
      const updatedMessages = [
        ...initialMessages,
        {
          id: 3,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        }
      ]
      setChatMessages(updatedMessages)
      setGeneratedDesign(aiResponse)
      
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
    if (chatInput.trim() && generatedCode.html) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: chatInput,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, userMessage])
      setChatInput('')
      
      try {
        const aiResponse = await callGeminiAPI(chatInput, true)
        const parsedCode = parseGeneratedCode(aiResponse)
        setGeneratedCode(parsedCode)
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        }
        
        setChatMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('Error in follow-up:', error)
      }
    }
  }

  const handleTemplateSelect = (template) => {
    setDesignDescription(template)
    setShowTemplates(false)
  }

  return (
    <div className="app">
      {/* Enhanced Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <span className="logo-text">Stitch AI</span>
            <span className="beta-badge">BETA</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="app-navigation">
            <button 
              className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-btn ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveSection('projects')}
            >
              Projects
            </button>
            <button 
              className={`nav-btn ${activeSection === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveSection('templates')}
            >
              Templates
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div className="profile-avatar">
            <span>A</span>
          </div>
        </div>
      </header>

      <div className={`main-container ${isGenerating ? 'generating' : ''}`}>
        {/* Enhanced Sidebar */}
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
            
            {/* Quick Templates Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Quick Templates</h3>
              <div className="template-grid">
                {quickTemplates.map((template, index) => (
                  <button 
                    key={index}
                    className="template-btn"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="main-content">
          {!isGenerating ? (
            <div className="design-creator">
              {/* Hero Section */}
              <div className="hero-section">
                <div className="hero-content">
                  <div className="hero-badge">
                    <span className="badge-icon">🚀</span>
                    <span>AI-Powered Design</span>
                  </div>
                  <h1 className="hero-title">
                    Transform Ideas Into
                    <span className="gradient-text"> Stunning Designs</span>
                  </h1>
                  <p className="hero-subtitle">
                    Create professional, modern, and futuristic UI designs in seconds with our advanced AI design engine
                  </p>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="stat-number">10K+</span>
                      <span className="stat-label">Designs Created</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">50+</span>
                      <span className="stat-label">Templates</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">99%</span>
                      <span className="stat-label">Satisfaction</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Design Input Section */}
              <div className="design-input-section">
                <div className="section-header">
                  <h2 className="section-title">Start Creating</h2>
                  <p className="section-subtitle">Describe your vision and watch it come to life</p>
                </div>
                
                <div className="design-input-container">
                  <div className="input-wrapper">
                    <div className="input-header">
                      <div className="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                          <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                          <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <textarea
                        className="design-input"
                        placeholder="Describe your design vision... (e.g., 'A futuristic dashboard for a smart home app with dark theme and neon accents')"
                        value={designDescription}
                        onChange={(e) => setDesignDescription(e.target.value)}
                        rows={4}
                      />
                      <div className="input-counter">
                        {designDescription.length}/500
                      </div>
                    </div>
                    
                    <div className="input-footer">
                      <div className="platform-selector">
                        <button 
                          className={`platform-btn ${selectedPlatform === 'Mobile' ? 'active' : ''}`}
                          onClick={() => setSelectedPlatform('Mobile')}
                        >
                          <div className="platform-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Mobile</span>
                          <div className="platform-indicator"></div>
                        </button>
                        <button 
                          className={`platform-btn ${selectedPlatform === 'Web' ? 'active' : ''}`}
                          onClick={() => setSelectedPlatform('Web')}
                        >
                          <div className="platform-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Web</span>
                          <div className="platform-indicator"></div>
                        </button>
                      </div>
                      
                      <button className="generate-btn" onClick={handleGenerate} disabled={isLoading}>
                        <div className="btn-content">
                          {isLoading ? (
                            <div className="loading-spinner"></div>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          )}
                          <span>{isLoading ? 'Generating...' : 'Generate Design'}</span>
                        </div>
                        <div className="btn-glow"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="prompts-section">
                  <h3 className="prompts-title">Popular Prompts</h3>
                  <div className="prompt-grid">
                    {quickTemplates.map((prompt, index) => (
                      <button 
                        key={index} 
                        className="prompt-card"
                        onClick={() => setDesignDescription(prompt)}
                      >
                        <div className="prompt-icon">💡</div>
                        <p className="prompt-text">{prompt}</p>
                        <div className="prompt-arrow">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="features-section">
                <div className="section-header">
                  <h2 className="section-title">Why Choose Stitch?</h2>
                  <p className="section-subtitle">Built for modern designers and developers</p>
                </div>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="feature-title">AI-Powered</h3>
                    <p className="feature-description">Advanced machine learning algorithms that understand design principles and user experience</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="feature-title">Production Ready</h3>
                    <p className="feature-description">Clean, semantic code that's ready for development teams to implement</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="feature-title">Responsive</h3>
                    <p className="feature-description">Automatically optimized for all devices and screen sizes</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="generation-interface">
              {/* Enhanced Chat Panel */}
              <div className="chat-panel">
                <div className="chat-header">
                  <h2>Design Assistant</h2>
                  <button className="close-chat" onClick={() => setIsGenerating(false)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
                
                <div className="chat-messages">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`message ${message.type}`}>
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask for modifications or improvements..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="send-btn" onClick={handleSendMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Preview Panel */}
              <div className="preview-panel">
                <div className="preview-header">
                  <div className="preview-controls">
                    <button onClick={handleZoomOut} className="control-btn">-</button>
                    <span className="zoom-level">{zoomLevel}%</span>
                    <button onClick={handleZoomIn} className="control-btn">+</button>
                    <button onClick={resetZoom} className="control-btn">Reset</button>
                  </div>
                  
                  <div className="platform-indicator">
                    <button 
                      className={`control-btn ${selectedPlatform === 'Mobile' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('Mobile')}
                    >
                      📱
                    </button>
                    <button 
                      className={`control-btn ${selectedPlatform === 'Web' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('Web')}
                    >
                      💻
                    </button>
                  </div>
                </div>
                
                <div className="preview-container">
                  {!generatedCode.html ? (
                    <div className="preview-placeholder">
                      <div className="placeholder-icon">🎨</div>
                      <h3>Design Preview</h3>
                      <p>Your generated design will appear here</p>
                    </div>
                  ) : generatedCode.html ? (
                    <div 
                      className="preview-viewport"
                      onMouseEnter={handleViewportEnter}
                      onMouseLeave={handleViewportLeave}
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      style={{
                        transform: `scale(${zoomLevel / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`
                      }}
                    >
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <style>${generatedCode.css}</style>
                            </head>
                            <body>${generatedCode.html}</body>
                            <script>${generatedCode.js}</script>
                          </html>
                        `}
                        title="Design Preview"
                        className="preview-iframe"
                      />
                    </div>
                  ) : null}
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
