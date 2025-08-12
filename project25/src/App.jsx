import React, { useState } from 'react'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      title: "AI-Powered Design",
      description: "Create stunning visuals with the help of artificial intelligence",
      icon: "🎨"
    },
    {
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time",
      icon: "👥"
    },
    {
      title: "Smart Templates",
      description: "Choose from hundreds of professionally designed templates",
      icon: "📋"
    },
    {
      title: "Export Anywhere",
      description: "Export your designs in multiple formats for any platform",
      icon: "📤"
    }
  ]

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-text">STITCH</span>
          <span className="logo-subtitle">by Google</span>
        </div>
        <nav className="nav">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
          <button className="cta-button">Get Started</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Design Without
            <span className="highlight"> Limits</span>
          </h1>
          <p className="hero-description">
            Stitch is the AI-powered design platform that helps you create 
            stunning visuals, collaborate with your team, and bring your 
            ideas to life faster than ever before.
          </p>
          <div className="hero-buttons">
            <button 
              className="primary-button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Start Creating
              <span className="button-arrow">→</span>
            </button>
            <button className="secondary-button">Watch Demo</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="design-preview">
            <div className="design-element design-element-1"></div>
            <div className="design-element design-element-2"></div>
            <div className="design-element design-element-3"></div>
            <div className="design-element design-element-4"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2 className="section-title">Why Choose Stitch?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Design Process?</h2>
          <p className="cta-description">
            Join thousands of designers who are already using Stitch to create amazing work.
          </p>
          <button className="cta-button-large">Start Free Trial</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#templates">Templates</a>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="#help">Help Center</a>
            <a href="#blog">Blog</a>
            <a href="#community">Community</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Stitch by Google. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
