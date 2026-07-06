import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Ebooks from './pages/Ebooks';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminConsole from './pages/AdminConsole';
import MyProjects from './pages/MyProjects';
import StartProject from './pages/StartProject';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/start-project" element={<StartProject />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
