import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/modals/AdminPanel';

export default function AdminConsole() {
  const navigate = useNavigate();
  return <AdminPanel isOpen={true} fullScreen onClose={() => navigate(-1)} />;
}
