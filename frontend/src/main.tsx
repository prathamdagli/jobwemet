import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './firebase/firebase'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { AppStateProvider } from './contexts/AppStateContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </AuthProvider>
  </StrictMode>,
)
