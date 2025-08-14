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
  
  // Stitch AI Workflow System States
  const [currentWorkflow, setCurrentWorkflow] = useState('planning') // planning, designing, preview, export
  const [screenPlans, setScreenPlans] = useState([])
  const [currentScreen, setCurrentScreen] = useState(0)
  const [designComponents, setDesignComponents] = useState([])
  const [designTheme, setDesignTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#1F2937',
    textColor: '#F9FAFB',
    accentColor: '#10B981',
    borderRadius: '8px',
    fontFamily: 'Inter'
  })
  const [componentLibrary, setComponentLibrary] = useState({
    buttons: [],
    inputs: [],
    cards: [],
    navigation: [],
    layouts: []
  })
  
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
  
  // Stitch AI Workflow Functions
  const generateScreenPlan = async (prompt) => {
    try {
      const screenPlanningPrompt = `
        Based on this app description: "${prompt}"
        
        Create a comprehensive screen plan with:
        1. List of all necessary screens
        2. Purpose of each screen
        3. Key components needed
        4. User flow between screens
        
        Format as JSON with structure:
        {
          "screens": [
            {
              "name": "Screen Name",
              "purpose": "Screen purpose",
              "components": ["component1", "component2"],
              "userFlow": "next screen"
            }
          ]
        }
      `
      
      const response = await callGeminiAPI(screenPlanningPrompt)
      const plan = JSON.parse(response)
      setScreenPlans(plan.screens)
      setCurrentWorkflow('designing')
      return plan
    } catch (error) {
      console.error('Error generating screen plan:', error)
      // Fallback to default screens
      const defaultScreens = [
        { name: 'Home', purpose: 'Main landing page', components: ['header', 'hero', 'features'], userFlow: 'login' },
        { name: 'Login', purpose: 'User authentication', components: ['form', 'buttons', 'links'], userFlow: 'dashboard' },
        { name: 'Dashboard', purpose: 'Main app interface', components: ['navigation', 'content', 'sidebar'], userFlow: 'home' }
      ]
      setScreenPlans(defaultScreens)
      setCurrentWorkflow('designing')
      return { screens: defaultScreens }
    }
  }
  
  const generateComponentDesign = async (screen, components) => {
    try {
      const componentPrompt = `
        Design UI components for ${screen.name} screen with these requirements:
        - Components: ${components.join(', ')}
        - Theme: ${JSON.stringify(designTheme)}
        - Platform: ${selectedPlatform}
        
        Generate modern, professional UI components with:
        - Proper spacing and alignment
        - Accessibility considerations
        - Responsive design principles
        - Professional styling
        
        Return as JSON with component specifications.
      `
      
      const response = await callGeminiAPI(componentPrompt)
      const componentSpecs = JSON.parse(response)
      setDesignComponents(prev => [...prev, { screen: screen.name, components: componentSpecs }])
      return componentSpecs
    } catch (error) {
      console.error('Error generating components:', error)
      return null
    }
  }
  
  const applyDesignTheme = (components, theme) => {
    return components.map(component => ({
      ...component,
      styles: {
        ...component.styles,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        borderColor: theme.primaryColor,
        borderRadius: theme.borderRadius,
        fontFamily: theme.fontFamily
      }
    }))
  }
  
  const generateDesignPreview = async () => {
    try {
      const previewPrompt = `
        Create a complete design preview for this app:
        - Screens: ${screenPlans.map(s => s.name).join(', ')}
        - Theme: ${JSON.stringify(designTheme)}
        - Platform: ${selectedPlatform}
        
        Generate a professional, polished design that looks like:
        - High-quality Figma mockup
        - Dribbble-quality UI design
        - Real, usable application interface
        
        Focus on visual design, not code.
      `
      
      const response = await callGeminiAPI(previewPrompt)
      setGeneratedDesign(response)
      setCurrentWorkflow('preview')
      return response
    } catch (error) {
      console.error('Error generating preview:', error)
      return null
    }
  }
  
  const exportDesign = (format) => {
    // Export functionality for different formats
    const exportData = {
      screens: screenPlans,
      components: designComponents,
      theme: designTheme,
      platform: selectedPlatform,
      timestamp: new Date().toISOString()
    }
    
    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `design-export-${Date.now()}.json`
      link.click()
    }
    
    setCurrentWorkflow('export')
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
[JavaScript code here, or "// No JavaScript needed" if not required]
\`\`\`

Requirements:
- Make it ${selectedPlatform === 'Mobile' ? 'mobile-first responsive' : 'desktop-focused with mobile compatibility'}
- Use modern CSS (flexbox, grid, custom properties, gradients, shadows)
- Include hover effects, smooth transitions, and micro-animations
- Use a cohesive and modern color scheme with gradients
- Make it visually stunning and user-friendly
- Ensure proper accessibility (semantic HTML, ARIA labels)
- Include realistic content and placeholder text
- Use high-quality demo images from Unsplash (https://images.unsplash.com/photo-[id]?w=400&h=300&fit=crop)
- Add loading states, skeleton screens, and interactive elements
- Include icons using Unicode symbols or CSS-drawn icons
- Make it production-ready with proper spacing, typography, and visual hierarchy
- Add subtle animations and transitions for better UX
- Use CSS variables for consistent theming
- Include proper error states and empty states
- Make it look like a real, professional application`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
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

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
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
      
      try {
        // Step 1: Generate Screen Plan
        const screenPlan = await generateScreenPlan(designDescription)
        
        // Step 2: Generate Components for each screen
        for (const screen of screenPlan.screens) {
          await generateComponentDesign(screen, screen.components)
        }
        
        // Step 3: Generate Design Preview
        const preview = await generateDesignPreview()
        
        // Step 4: Generate Code
        const aiResponse = await callGeminiAPI(designDescription)
        const parsedCode = parseGeneratedCode(aiResponse)
        setGeneratedCode(parsedCode)
        
        // Save project to history
        saveProject(designDescription, selectedPlatform, parsedCode)
        
        // Update chat with workflow progress
        const workflowMessages = [
          {
            id: 1,
            type: 'user',
            content: designDescription,
            timestamp: new Date()
          },
          {
            id: 2,
            type: 'ai',
            content: `✅ Screen Planning Complete: ${screenPlan.screens.length} screens identified`,
            timestamp: new Date()
          },
          {
            id: 3,
            type: 'ai',
            content: `✅ Component Design Complete: All UI components generated`,
            timestamp: new Date()
          },
          {
            id: 4,
            type: 'ai',
            content: `✅ Design Preview Generated: Professional mockup ready`,
            timestamp: new Date()
          },
          {
            id: 5,
            type: 'ai',
            content: `✅ Code Generation Complete: Frontend code ready for development`,
            timestamp: new Date()
          }
        ]
        setChatMessages(workflowMessages)
        setGeneratedDesign(preview)
        
      } catch (error) {
        console.error('Error in Stitch AI workflow:', error)
        setChatMessages([{
          id: 1,
          type: 'ai',
          content: 'Sorry, there was an error in the design generation process. Please try again.',
          timestamp: new Date()
        }])
      } finally {
        setIsLoading(false)
        // Auto-scroll to bottom
        setTimeout(() => {
          const chatContainer = document.querySelector('.chat-messages')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
        }
        }, 100)
      }
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
      
      // Check if the response contains code and update if so
      const parsedCode = parseGeneratedCode(aiResponse)
      if (parsedCode.html || parsedCode.css || parsedCode.js) {
        setGeneratedCode(parsedCode)
      }
      
      const aiMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: aiResponse,
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
                  placeholder="Describe your design (e.g., 'A modern fitness app with dark theme, tracking features, and social elements')"
                  value={designDescription}
                  onChange={(e) => setDesignDescription(e.target.value)}
                />
                
                {/* Stitch AI Workflow Progress */}
                {currentWorkflow !== 'planning' && (
                  <div className="workflow-progress">
                    <div className="workflow-step active">
                      <div className="step-icon">📋</div>
                      <span>Screen Planning</span>
                    </div>
                    <div className={`workflow-step ${currentWorkflow === 'designing' || currentWorkflow === 'preview' || currentWorkflow === 'export' ? 'active' : ''}`}>
                      <div className="step-icon">🎨</div>
                      <span>Component Design</span>
                    </div>
                    <div className={`workflow-step ${currentWorkflow === 'preview' || currentWorkflow === 'export' ? 'active' : ''}`}>
                      <div className="step-icon">👁️</div>
                      <span>Preview</span>
                    </div>
                    <div className={`workflow-step ${currentWorkflow === 'export' ? 'active' : ''}`}>
                      <div className="step-icon">📤</div>
                      <span>Export</span>
                    </div>
                  </div>
                )}
                
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
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Generate with Stitch AI
                  </button>
                </div>
              </div>
              
              {/* Theme Customization Panel */}
              <div className="theme-panel">
                <h3 className="theme-title">Design Theme</h3>
                <div className="theme-controls">
                  <div className="theme-control">
                    <label>Primary Color</label>
                    <input 
                      type="color" 
                      value={designTheme.primaryColor}
                      onChange={(e) => setDesignTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                  </div>
                  <div className="theme-control">
                    <label>Background</label>
                    <input 
                      type="color" 
                      value={designTheme.backgroundColor}
                      onChange={(e) => setDesignTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                  </div>
                  <div className="theme-control">
                    <label>Border Radius</label>
                    <select 
                      value={designTheme.borderRadius}
                      onChange={(e) => setDesignTheme(prev => ({ ...prev, borderRadius: e.target.value }))}
                    >
                      <option value="4px">Sharp</option>
                      <option value="8px">Rounded</option>
                      <option value="16px">Pill</option>
                      <option value="24px">Extra Rounded</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Screen Planning Visualization */}
              {screenPlans.length > 0 && (
                <div className="screen-planning-panel">
                  <h3 className="screen-planning-title">Screen Plan</h3>
                  <div className="screen-grid">
                    {screenPlans.map((screen, index) => (
                      <div key={index} className="screen-card">
                        <div className="screen-header">
                          <h4 className="screen-name">{screen.name}</h4>
                          <span className="screen-number">{index + 1}</span>
                        </div>
                        <p className="screen-purpose">{screen.purpose}</p>
                        <div className="screen-components">
                          <span className="components-label">Components:</span>
                          <div className="component-tags">
                            {screen.components.map((comp, compIndex) => (
                              <span key={compIndex} className="component-tag">{comp}</span>
                            ))}
                          </div>
                        </div>
                        <div className="screen-flow">
                          <span className="flow-label">Next:</span>
                          <span className="flow-target">{screen.userFlow}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    ) : generatedCode.html ? (
                      <div className={`preview-container ${selectedPlatform.toLowerCase()}`}>
                        <div className="preview-frame" style={{ transform: `scale(${zoomLevel / 100})` }}>
                          <iframe
                            srcDoc={`
                              <!DOCTYPE html>
                              <html lang="en">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Generated Design</title>
                                <style>
                                  * { margin: 0; padding: 0; box-sizing: border-box; }
                                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                                  ${generatedCode.css}
                                </style>
                              </head>
                              <body>
                                ${generatedCode.html}
                                <script>
                                  ${generatedCode.js}
                                </script>
                              </body>
                              </html>
                            `}
                            title="Design Preview"
                            className="preview-iframe"
                            sandbox="allow-scripts allow-same-origin"
                          />
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
                      <button className="control-btn" title="View Code">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2"/>
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
