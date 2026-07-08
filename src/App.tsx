import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Ebooks from './pages/Ebooks';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminConsole from './pages/AdminConsole';
import MyProjects from './pages/MyProjects';
import StartProject from './pages/StartProject';
import AuthCallback from './pages/AuthCallback';
import Process from './pages/Process';
import Pricing from './pages/Pricing';
import Work from './pages/Work';
import About from './pages/About';
import Academy from './pages/Academy';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/start-project" element={<StartProject />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/process" element={<Process />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/academy" element={<Academy />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
