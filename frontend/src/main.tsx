import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './index.css'
import './firebase/firebase'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { AppStateProvider } from './contexts/AppStateContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppStateProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </AppStateProvider>
    </AuthProvider>
  </StrictMode>,
)
