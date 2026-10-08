import { useState, useEffect } from 'react'
import { Routes as RouterRoutes, Route as RouterRoute, useLocation as useAppLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import PageTransition from './components/layout/PageTransition.jsx'
import Landing3DIntro from './components/layout/Landing3DIntro.jsx'
import useScrollToTop from './hooks/useScrollToTop.js'

import LoginPage from './pages/LoginPage.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Dashboards from './pages/Dashboards.jsx'
import Team from './pages/Team.jsx'
import Contact from './pages/Contact.jsx'
import LandingPage from './pages/LandingPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const location = useAppLocation()
  useScrollToTop()

  // 3D landing animation plays when user opens project link, then reveals login page
  const [show3DIntro, setShow3DIntro] = useState(true)

  useEffect(() => {
    const handleReplay = () => setShow3DIntro(true)
    window.addEventListener('replay-3d-intro', handleReplay)
    return () => window.removeEventListener('replay-3d-intro', handleReplay)
  }, [])

  const isAuthOrLanding = location.pathname === '/' || location.pathname === '/login'

  return (
    <AuthProvider>
      <AnimatePresence>
        {show3DIntro && (
          <Landing3DIntro onComplete={() => setShow3DIntro(false)} />
        )}
      </AnimatePresence>
      {!isAuthOrLanding && <Navbar />}
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <RouterRoutes location={location}>
            {/* Opening link presents the Login page directly */}
            <RouterRoute path="/" element={<LoginPage />} />
            <RouterRoute path="/login" element={<LoginPage />} />
            <RouterRoute path="/overview" element={<LandingPage />} />
            <RouterRoute path="/home" element={<Home />} />
            <RouterRoute path="/about" element={<About />} />
            <RouterRoute path="/dashboards" element={<Dashboards />} />
            <RouterRoute path="/team" element={<Team />} />
            <RouterRoute path="/contact" element={<Contact />} />
            <RouterRoute path="*" element={<NotFound />} />
          </RouterRoutes>
        </PageTransition>
      </AnimatePresence>
      {!isAuthOrLanding && <Footer />}
    </AuthProvider>
  )
}
