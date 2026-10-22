import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#181D29',
            color: '#F5F5F5',
            border: '1px solid #292F3B',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#F5C518', secondary: '#0B0D12' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#F5F5F5' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
