import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, type Location } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
// Home stays eager: it's the landing page (fastest possible first paint) and
// the fallback background page behind the /settings overlay.
import Home from './pages/Home';

// Every other page is code-split so the initial bundle only carries the
// landing page. Suspense fallback is null — no spinner or layout shift, the
// previous screen simply stays up for the few ms the chunk takes to arrive.
const Ebooks = lazy(() => import('./pages/Ebooks'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// /settings/* renders as an overlay on top of whatever page was open when it
// was entered (see hooks/useSettingsNavigate), instead of replacing it as a
// normal route — so that page stays mounted and visible behind the settings
// panel through its open/close transition. The main <Routes> below is given
// that "background" location (falling back to the real one) so it keeps
// resolving to the underlying page; the settings overlay is matched
// separately against the real location.
function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;

  return (
    <Suspense fallback={null}>
      <Routes location={backgroundLocation ?? location}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* Direct visits to /settings/* or /admin-settings/* (refresh,
              bookmark, typed URL) have no background location yet — fall back
              to Home behind the overlay. */}
          <Route path="/settings/*" element={<Home />} />
          <Route path="/admin-settings/*" element={<Home />} />
        </Route>

        <Route path="/ebooks" element={<Ebooks />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>

      {(location.pathname.startsWith('/settings') || location.pathname.startsWith('/admin-settings')) && (
        // Own Suspense boundary: the settings chunks are the largest lazy
        // pages, so their first open gets a visible spinner (over the
        // still-visible background page) instead of the outer boundary's
        // silent null.
        <Suspense
          fallback={
            // Dimmed, blurred backdrop + a surface card behind the spinner so
            // the loading state reads clearly over any page content. Also
            // blocks clicks on the page behind while the panel is loading.
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-base/60 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          }
        >
          <Routes>
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/admin-settings/*" element={<AdminSettings />} />
          </Routes>
        </Suspense>
      )}
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
