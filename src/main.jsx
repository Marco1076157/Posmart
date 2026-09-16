import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="481477151560-2t72un2b9qugh7b867imc24c412q3j6p.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>

  </React.StrictMode>,
)
