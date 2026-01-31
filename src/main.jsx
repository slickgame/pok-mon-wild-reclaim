import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { validateTagsAndTriggers } from '@/components/utils/tagValidation'

if (import.meta.env.DEV) {
  validateTagsAndTriggers()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
