# Stitch by Google - Website Clone

A modern, Neobrutalism-styled clone of the [Stitch by Google](https://stitch.withgoogle.com/) website built with React and Vite.

## 🎨 Design Features

This project showcases a **Neobrutalism design aesthetic** characterized by:

- **Bold, geometric shapes** with thick borders
- **High contrast colors** (black, white, coral red)
- **Offset shadows** for depth and visual interest
- **Typography-focused layouts** with heavy font weights
- **Interactive hover effects** and micro-animations
- **Responsive design** that works on all devices

## 🚀 Features

- **Modern React 19** with hooks and functional components
- **Responsive grid layouts** using CSS Grid and Flexbox
- **Interactive elements** with hover states and animations
- **Semantic HTML** for accessibility and SEO
- **Custom CSS** with Neobrutalism design principles
- **Mobile-first responsive design**

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Build Tool**: Vite
- **Styling**: Custom CSS with Neobrutalism theme
- **Fonts**: Inter (Google Fonts)
- **Icons**: Emoji icons for simplicity

## 📱 Sections

1. **Header**: Navigation with logo and menu
2. **Hero**: Main value proposition with CTA buttons
3. **Features**: Interactive feature cards with hover effects
4. **CTA**: Call-to-action section for conversions
5. **Footer**: Organized link sections and company info

## 🎯 Key Design Elements

- **Color Palette**: 
  - Primary: #1a1a1a (Black)
  - Accent: #ff6b6b (Coral Red)
  - Background: #f8f9fa (Light Gray)
  - Text: #666 (Medium Gray)

- **Typography**: 
  - Inter font family
  - Heavy weights (800-900) for headings
  - Medium weights (500-600) for body text

- **Shadows & Borders**:
  - 4-8px thick borders
  - Offset box-shadows for depth
  - Geometric, angular shapes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Environment Setup

1. Create a `.env` file in the root directory:
```bash
# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

2. Replace `your_gemini_api_key_here` with your actual Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project25
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
project25/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Neobrutalism styling
│   ├── index.css        # Global styles and fonts
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## 🎨 Customization

### Colors
To change the color scheme, modify the CSS custom properties in `src/App.css`:

```css
:root {
  --primary-color: #1a1a1a;
  --accent-color: #ff6b6b;
  --background-color: #f8f9fa;
  --text-color: #666;
}
```

### Typography
To change fonts, update the font-family imports in `src/index.css` and modify the font-family properties in `src/App.css`.

### Layout
The layout uses CSS Grid and Flexbox. Modify the grid-template-columns and flex properties in the respective CSS classes to adjust the layout.

## 🌟 Neobrutalism Design Principles

This design follows the Neobrutalism movement which emphasizes:

- **Raw, unrefined aesthetics**
- **Bold typography and colors**
- **Geometric shapes and patterns**
- **High contrast and visual impact**
- **Playful and experimental layouts**

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🔧 Development

### Code Style
- Functional React components with hooks
- CSS classes following BEM methodology
- Semantic HTML structure
- Accessibility-focused design

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is for educational purposes and is a clone of the original Stitch by Google website.

## 🙏 Acknowledgments

- Design inspiration from [Stitch by Google](https://stitch.withgoogle.com/)
- Neobrutalism design movement
- React and Vite communities

---

**Note**: This is a design clone created for educational purposes. The original Stitch by Google website and its branding belong to Google.
