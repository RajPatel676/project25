# Project25 - AI Generator

A modern web application featuring AI content generation with multiple models.

## Features

- **Gemini 2.0 Integration**: Text generation and analysis
- **Hugging Face Integration**: Image generation using FLUX.1-dev model
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Model Selection**: Easy switching between AI models
- **Real-time Generation**: Live content generation with loading states

## Setup

1. Clone the repository
2. Copy `config.example.js` to `config.js`
3. Add your API keys to `config.js`:
   - Get Hugging Face token from: https://huggingface.co/settings/tokens
   - Get Gemini API key from: https://makersuite.google.com/app/apikey

## Usage

### AI Generator
Open `ai-generator.html` in your browser to use the AI generator interface.

### API Keys Required
- **Hugging Face Token**: For image generation
- **Gemini API Key**: For text generation

## Files

- `ai-generator.html` - Main AI generator interface
- `src/App.jsx` - React application component
- `config.example.js` - Example configuration file
- `huggingface-example.js` - Hugging Face API example

## Security

API keys are kept in `config.js` which is gitignored for security. Never commit API keys to the repository.